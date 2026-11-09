// Cloudflare Worker: handles only POST /api/contact (sends the request to Telegram).
// Every other URL is served from the static files (env.ASSETS).
// Secrets (never in the repo): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID. Local: .dev.vars. Production: Cloudflare dashboard (Secret).
import enUi from '../src/i18n/ui.en.json';
import ukUi from '../src/i18n/ui.uk.json';
import enSite from '../src/content/en/site.json';

type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  TELEGRAM_API_BASE?: string; // tests only; default is the real Telegram API
};

const MAX_BODY = 10 * 1024;
const MIN_FILL_MS = 3000;
const OPTIONS: Record<string, string[]> = { en: enUi.form.options, uk: ukUi.form.options };
const MIN_PHOTOS = enSite.minPhotos;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const IG_RE = /^(@?[A-Za-z0-9._]{1,30}|(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._]{1,30}\/?(\?.*)?)$/i;

const json = (body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra },
  });
const fail = (error: string, status: number, extra: Record<string, string> = {}) => json({ ok: false, error }, status, extra);

// control characters out; single-line fields also lose line breaks
const clean = (v: unknown, max: number, multiline = false) => {
  if (typeof v !== 'string') return '';
  let s = v.replace(multiline ? /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, ' ');
  s = multiline ? s.replace(/\r\n?/g, '\n').trim() : s.replace(/\s+/g, ' ').trim();
  return s.slice(0, max);
};

function originAllowed(origin: string | null) {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    if (u.origin === 'https://vikaretoucher.win') return true;
    return u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

const kyivTime = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23' }).format(new Date());

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return fail('method_not_allowed', 405, { allow: 'POST' });
  if (!originAllowed(request.headers.get('origin'))) return fail('forbidden_origin', 403);
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return fail('unsupported_media_type', 415);

  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BODY) return fail('too_large', 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY) return fail('too_large', 413);

  let data: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    data = parsed as Record<string, unknown>;
  } catch {
    return fail('bad_request', 400);
  }

  // honeypot: bots fill it, people never see it. Pretend success, send nothing.
  if (typeof data.website === 'string' && data.website.trim() !== '') return json({ ok: true });

  const elapsed = Number(data.elapsed);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return fail('too_fast', 429);

  const lang = data.lang === 'uk' || data.lang === 'en' ? (data.lang as 'en' | 'uk') : null;
  if (!lang) return fail('invalid_lang', 400);

  const name = clean(data.name, 100);
  if (!name) return fail('invalid_name', 400);
  const email = clean(data.email, 200);
  if (!EMAIL_RE.test(email)) return fail('invalid_email', 400);
  const instagram = clean(data.instagram, 100);
  if (!IG_RE.test(instagram)) return fail('invalid_instagram', 400);
  const need = clean(data.need, 100);
  if (!OPTIONS[lang].includes(need)) return fail('invalid_need', 400);

  let count = '';
  const rawCount = clean(typeof data.count === 'number' ? String(data.count) : data.count, 12);
  if (rawCount) {
    const n = Number(rawCount);
    if (!Number.isInteger(n) || n < MIN_PHOTOS || n > 1_000_000) return fail('invalid_count', 400);
    count = String(n);
  }
  const message = clean(data.message, 2000, true);

  const token = env.TELEGRAM_BOT_TOKEN;
  // one chat id, or several separated by commas (each person who pressed Start gets the request)
  const chatIds = (env.TELEGRAM_CHAT_ID || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10);
  if (!token || chatIds.length === 0) {
    console.error('config_missing');
    return fail('not_configured', 500);
  }

  const text = [
    `Новая заявка с сайта (${lang.toUpperCase()})`,
    `Имя: ${name}`,
    `Email: ${email}`,
    `Instagram: ${instagram}`,
    `Нужно: ${need}`,
    `Фото: ${count || '—'}`,
    `Сообщение: ${message || '—'}`,
    `Время (Киев): ${kyivTime()}`,
  ].join('\n');

  const base = (env.TELEGRAM_API_BASE || 'https://api.telegram.org').replace(/\/$/, '');
  const results = await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const res = await fetch(`${base}/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
        });
        if (!res.ok) console.error('telegram_error', res.status);
        return res.ok;
      } catch {
        console.error('telegram_unreachable');
        return false;
      }
    }),
  );
  // success if at least one person got it
  if (!results.some(Boolean)) return fail('telegram_unavailable', 502);
  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') {
      try {
        return await handleContact(request, env);
      } catch {
        console.error('unexpected_error');
        return fail('server_error', 500);
      }
    }
    if (pathname.startsWith('/api/')) return fail('not_found', 404);
    return env.ASSETS.fetch(request);
  },
};
