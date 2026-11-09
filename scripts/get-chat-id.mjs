// Prints the chat id(s) that wrote to your bot. Reads the token from .dev.vars and NEVER prints it.
// Usage: 1) Victoria opens the bot in Telegram and presses Start (or writes in the group where the bot is added)
//        2) node scripts/get-chat-id.mjs
import { readFileSync } from 'node:fs';

let token = '';
try {
  const line = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8')
    .split('\n')
    .find((l) => l.trim().startsWith('TELEGRAM_BOT_TOKEN='));
  token = (line || '').slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
} catch {
  console.error('Cannot read .dev.vars. Create it from .dev.vars.example first.');
  process.exit(1);
}
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is empty in .dev.vars.');
  process.exit(1);
}

let body;
try {
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  body = await res.json();
} catch {
  console.error('Could not reach Telegram. Check your internet connection.');
  process.exit(1);
}
if (!body.ok) {
  console.error(`Telegram refused the request: ${body.description ?? 'unknown error'}. Is the token correct?`);
  process.exit(1);
}

const chats = new Map();
for (const u of body.result) {
  const c = (u.message ?? u.edited_message ?? u.channel_post ?? u.my_chat_member)?.chat;
  if (c) chats.set(c.id, [c.title, [c.first_name, c.last_name].filter(Boolean).join(' '), c.username && `@${c.username}`].filter(Boolean).join(' / ') || c.type);
}
if (!chats.size) {
  console.log('No chats found yet. Ask Victoria to open the bot and press Start (or write in the group), then run this again.');
} else {
  for (const [id, name] of chats) console.log(`chat id: ${id}   (${name})`);
}
