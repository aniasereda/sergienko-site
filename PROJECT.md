# PROJECT: sergienko.space — redesign

Professional retoucher Victoria Sergienko (wedding, family, personal photoshoots).
Replace the slow WordPress/Elementor site with a fast static site and a simple admin the owner can use without a developer.

Language of the site: English (a Ukrainian version comes later, see Phase 4).

## Rules for Claude Code

- Work only inside this folder.
- Ask before installing anything beyond what is listed below.
- All editable content lives in `src/content/` as JSON files. Components only render it, they never contain hard-coded prices, FAQ or steps.
- Use typographic punctuation in visible text: ’ and “ ”.
- Real photos are in `public/images/`. Until they exist, render labelled placeholder tiles, never remote images or stock photos.
- After each phase: run `npm run build`, fix errors, start `npm run dev` and tell me the local address.
- Commit to git after each phase with a short message. Never push unless I ask.

## Stack

- Astro (static output), plain CSS with CSS variables, a little vanilla JS (no UI framework).
- Fonts: Google Fonts, Cormorant (headings) + Montserrat (body). Self-host later if needed.
- Deploy: Vercel (Phase 3). Admin: Decap CMS or similar git-based CMS (Phase 2).

## Phases

1. **Site on localhost**: structure below, all sections, responsive, FAQ accordion, before/after slider, contact form UI.
2. **Admin** at `/admin`: forms for Prices, Steps, FAQ, Portfolio images, Contacts. Saving updates the JSON files in the git repo, which triggers a rebuild. Must be usable by a non-technical person. Propose the simplest option that works with Vercel and GitHub login, and explain the setup steps to me like I am a beginner.
3. **Deploy to Vercel** with a test link for the owner.
4. **Ukrainian version** (`/uk/`) with the same content structure, plus a language switch. Contact form wired to a real email (Formspree, Resend or similar). Move the domain only after the owner approves.

## Folder structure

```
sergienko-site/
  astro.config.mjs
  package.json
  public/images/            real photos go here
  src/
    content/
      site.json             name, tagline, social links, contacts
      prices.json           color + skin tiers
      steps.json            collaboration steps
      faq.json              questions and answers
      portfolio.json        list of images and before/after pairs
    components/             Header, Hero, Services, Prices, Process, Portfolio, Faq, Contact, Footer
    layouts/Base.astro
    pages/index.astro
    styles/global.css
```

## Design tokens

Warm beige, calm, editorial. Keep the identity of the old site.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#e6e2d5` | page background |
| `--surface` | `#f3f0e7` | cards |
| `--line` | `#d6d0bf` | borders |
| `--text` | `#2b2720` | main text |
| `--muted` | `#4a4439` | secondary text (contrast 4.5:1+ on bg) |
| `--accent` | `#5f5240` | buttons, prices, markers |
| `--dark` | `#2d2923` | dark band (process, contact) |
| `--dark-text` | `#efebdf` | text on dark |

Typography: headings Cormorant 500, hero name 84px desktop (scale down on mobile), section titles 56px, card titles 28–30px. Body Montserrat 16px / 1.6. Eyebrow labels: 13px uppercase, letter-spacing .14em.
Layout: max width 1160px, side padding 32px (20px on mobile). Cards radius 10px, buttons are pill-shaped with 48px minimum height. Every tap target at least 44px. Breakpoint: 900px (grids collapse to one column, portfolio grid to 2 columns).
Accessibility: real `<button>` for accordion with `aria-expanded`, labels on all form fields, visible focus outline, alt text on images.

## Page structure (single page, in this order)

1. **Header** (sticky): brand “Victoria Sergienko”, links Prices (#price), How it works (#process), Portfolio (#portfolio), FAQ (#faq), UK (https://www.sergienko.space/uk/vs/ for now), button “Send photos” (#contact).
2. **Hero**: eyebrow “A professional retoucher”, h1 “Victoria Sergienko”, italic line “Clean color. Consistent results. Confidence in every series.”, text “I help photographers increase their income without burning out. Wedding, family and personal photoshoots.” Buttons “See prices” and “Send photos”. Facts: “7+ years of experience”, “Color 1–5 days”, “Retouching 1–3 days”. Right side: collage of 6 portfolio photos in 3 columns, middle column shifted down 40px.
3. **Directions and services**: two cards. Directions of my work: Wedding photoshoots, Family photoshoots, Personal photoshoots. Services: Color correction, Skin retouching, Packages (color correction + skin retouching).
4. **Prices** (#price): intro “I have an individual approach for each client, so the final cost is determined personally. The minimum order is 10 photos.” Group “Color correction” (3 cards) and “Skin retouching” (2 cards) from `prices.json`. Then two cards: “What affects the final price” and “Packages: color + skin” with button “Send photos for a quote”.
5. **How it works** (#process, dark band): intro, six numbered steps from `steps.json`, then two boxes: Terms and Important to know.
6. **Portfolio** (#portfolio): before/after slider (range input over two stacked images, clip-path), 6-photo grid, button “More works” (later: a full gallery page).
7. **FAQ** (#faq): accordion from `faq.json`, first item open.
8. **Contact** (#contact, dark band): left text and social links, right form card: Name, Instagram or email, I need (select), Number of photos (min. 10), Message, consent text with privacy link, Send. After sending, show “Thank you!”. (Form is UI only until Phase 4.)
9. **Footer**: copyright and Privacy policy link (https://www.sergienko.space/privacy%20policy/).

## Content files

### src/content/site.json

```json
{
  "name": "Victoria Sergienko",
  "role": "A professional retoucher",
  "tagline": ["Clean color.", "Consistent results.", "Confidence in every series."],
  "intro": "I help photographers increase their income without burning out. Wedding, family and personal photoshoots.",
  "social": {
    "instagram": "https://www.instagram.com/viktoria.touch/",
    "facebook": "https://www.facebook.com/profile.php?id=100010429836367",
    "linkedin": "https://www.linkedin.com/in/victoria-sergienko-5700181a1/"
  },
  "email": "",
  "directions": ["Wedding photoshoots", "Family photoshoots", "Personal photoshoots"],
  "services": ["Color correction", "Skin retouching", "Packages (color correction + skin retouching)"],
  "minPhotos": 10,
  "terms": "Color correction: from 1 to 5 days. Retouching: from 1 to 3 days. Terms are discussed for each order.",
  "important": "I work with a booking system, so please contact me in advance about upcoming shoots. Last-minute requests without prior booking are almost impossible.",
  "priceFactors": [
    "Statement of work and the overall complexity",
    "Number of people in the frame (more for two or more people who need complex correction)",
    "Skin condition (more for problematic skin)",
    "Deadline (today or tomorrow: +50–100%)",
    "Quality of the RAW files"
  ]
}
```

(`email` is empty on purpose: ask the owner which contact to show.)

### src/content/prices.json

```json
{
  "color": [
    {
      "name": "Your Color",
      "price": "$0.40",
      "lead": "You provide your own preset or Lightroom catalog with your color. Best if you already have your editing style and only need it applied consistently across the whole gallery.",
      "included": [
        "Applying your preset or color",
        "Straightening horizons",
        "Removing small unwanted elements (when possible in Lightroom)",
        "Keeping your style consistent throughout the gallery"
      ],
      "notIncluded": ["Creating a new color style", "Local adjustments with masks"]
    },
    {
      "name": "Custom Color",
      "price": "$0.50",
      "lead": "Perfect if you don’t have your own preset or want me to create the best color for your gallery based on your references and lighting conditions.",
      "included": [
        "Everything in Your Color",
        "Creating a custom color from scratch",
        "Matching the color across the entire gallery",
        "A consistent and natural look"
      ],
      "notIncluded": ["Lightroom masks"]
    },
    {
      "name": "Color with Masks",
      "price": "$0.70",
      "lead": "Used whenever Lightroom masks are required for color correction. Color only, it does not include skin retouching.",
      "included": [
        "Everything in Your Color or Custom Color",
        "Local color adjustments with masks, as needed for each image",
        "Brightening or darkening specific areas",
        "Balancing uneven lighting",
        "Correcting skin tones in selected areas"
      ],
      "notIncluded": ["Skin retouching"]
    }
  ],
  "skin": [
    {
      "name": "Basic Retouch",
      "price": "$3",
      "lead": "Ideal for quick, natural cleanup.",
      "included": [
        "Removing pimples and temporary blemishes",
        "Removing stray hairs",
        "Light skin cleanup",
        "Subtle Liquify (body shaping)"
      ]
    },
    {
      "name": "Detailed Retouch",
      "price": "$7",
      "lead": "Perfect for images that require a more detailed and refined retouch. The final price depends on the complexity of the image and the desired level of retouching.",
      "included": [
        "Frequency Separation",
        "Dodge & Burn",
        "Detailed skin retouching",
        "Advanced cleanup",
        "Natural-looking results that preserve skin texture"
      ]
    }
  ],
  "packageNote": "Color correction and skin retouching in one order. The exact amount for the entire order is announced when I see the full scale of the work. To clarify the price, send photos in a way convenient for you."
}
```

### src/content/steps.json

```json
[
  { "title": "Reach out", "text": "Send me a message via Direct or email. We briefly discuss what you need (color correction, skin retouching or full editing), the number of photos, deadlines and the collaboration format. No unnecessary steps or complicated technical details." },
  { "title": "Send your photos", "text": "Send a link via any file-sharing service (Google Drive, Dropbox, WeTransfer). Color work: RAW files only. Skin retouching: JPEG or TIFF. Minimum order: 10 photos. Please include references or examples of the desired result." },
  { "title": "Color workflow", "text": "No defined style yet? I select one photo from each location, create several color options, you choose the one that feels right, and I fine-tune the details. If you already have your own style, you send a folder with key edited images and the full order is paid upfront." },
  { "title": "Retouching", "text": "For skin retouching only, I do one free test image and you review and approve it. After confirmation we proceed with payment and the full order. I don’t offer free test retouching for entire series, which lets me keep quality and focus on real projects." },
  { "title": "Payment", "text": "After you approve the color or the test image, you receive a payment link, or you can pay via bank details. I work officially, so the payment process is simple and transparent." },
  { "title": "Editing and delivery", "text": "After payment I start the full editing and deliver the finished photos within the agreed timeframe." }
]
```

Section intro for the process block: “I know how difficult it can be to trust your photographs to someone else. That is why my workflow is built to be simple and transparent.” Heading: “Calm, clear and comfortable at every stage”.

### src/content/faq.json

```json
[
  { "q": "Do you do photo culling?", "a": "No. The photographer always does the photo selection. I wasn’t present at the shoot, so I can’t fully feel the atmosphere or identify the key moments. My focus is color, editing and consistency across the series, and that is where my real strength is. I’ve been doing this successfully for over 7 years." },
  { "q": "Do you publish edited series without permission?", "a": "No. I never publish any work without the photographer’s permission. If you prefer that your images not be used in my portfolio, that is absolutely fine and will always be respected." },
  { "q": "How should RAW files be delivered (format and platform)?", "a": "You send the selected RAW files via Google Drive, WeTransfer or any other platform that is convenient for you." },
  { "q": "Do you use presets?", "a": "No, I don’t work with ready-made presets. Each series is edited individually, taking into account lighting, location, skin tones and your personal style. This approach ensures clean, consistent and predictable results throughout the entire gallery. Exception: if you already have your own preset or defined style and want me to work within it, I can easily adapt and follow your direction." },
  { "q": "Can revisions be made to edited images?", "a": "Yes. All preferences and adjustments that align with the agreed brief are included in the price. A new request that wasn’t part of the original agreement is billed separately. If a revision concerns something that was in the brief or references but wasn’t implemented on my side, it is corrected free of charge." },
  { "q": "How does payment work?", "a": "Payment is made after the color and editing direction are approved. You decide to move forward only after you’ve seen a sample result and are confident it fits your expectations. Once approved, full payment is made, and only then do I edit the entire order." },
  { "q": "Do you work without references or a brief?", "a": "I don’t work in a “just make it look nice” format. Even a minimal reference or a short brief helps achieve the desired result faster and more accurately, saving you a lot of time. If you don’t yet have a defined style, we can shape it together, but never blindly." }
]
```

### src/content/portfolio.json

```json
{
  "beforeAfter": [
    { "before": "/images/before-1.jpg", "after": "/images/after-1.jpg", "alt": "" }
  ],
  "gallery": [
    { "src": "/images/work-1.jpg", "alt": "Wedding photo" },
    { "src": "/images/work-2.jpg", "alt": "Portrait" }
  ],
  "moreWorksUrl": "https://www.sergienko.space/portfolio"
}
```

Photos I will put into `public/images/` (the owner’s originals). If a file is missing, show a placeholder tile with its alt text.

## Done when (Phase 1)

- `npm run dev` shows the full page on localhost, looks good at 1440, 900 and 390 px width.
- FAQ opens and closes, slider drags, form shows “Thank you!” after Send.
- Changing a value in any JSON file changes the page.
- `npm run build` finishes without errors.
