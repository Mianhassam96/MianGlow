# ✨ MianGlow

**Make Their Birthday Unforgettable.**

MianGlow is a personalized animated birthday surprise creation platform. Create a beautiful glowing birthday experience, share it as a link, or download a standalone greeting — no account required.

---

## 🌐 Live Site

### **[https://mianhassam96.github.io/MianGlow](https://mianhassam96.github.io/MianGlow)**

| Page | URL |
|------|-----|
| Landing | https://mianhassam96.github.io/MianGlow/ |
| Creator | https://mianhassam96.github.io/MianGlow/create.html |
| Recipient View | https://mianhassam96.github.io/MianGlow/view.html |

---

## 🗺️ Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Done | Audit existing Canvas LED scroller |
| Phase 1 | ✅ Done | Landing page, branding, design tokens |
| Phase 2 | ✅ Done | Birthday creator (5-step wizard, 4 themes, live preview) |
| Phase 3 | ✅ Done | Animation engine (name reveal, cake, confetti, balloons, fireworks) |
| Phase 4 | ✅ Done | Share links + downloadable HTML greeting |
| Phase 5 | ✅ Done | Mobile QA, accessibility, error states |
| Phase 6 | ✅ Done | SEO, OG tags, structured data, PWA manifest, sitemap, performance |

---

## 🎨 Themes

| Theme | Style | Vibe |
|-------|-------|------|
| **Golden Celebration** ⭐ | Cinematic black & gold | Flagship — elegant |
| **Dreamy Birthday** | Soft purples & pinks | Romantic & gentle |
| **Party Blast** | Bright colours | Energetic & fun |
| **Neon Night** | Cyan & purple glow | Modern & electric |

---

## ✨ Features

- 5-step birthday creator wizard
- 4 beautiful animated themes
- Live preview while editing
- Canvas 2D name reveal with glow animation
- Animated birthday cake with tappable candles
- Physics-based confetti (rect/circle/ribbon)
- Floating balloon animation (per-theme emoji)
- Fireworks engine with rocket trails
- Photo upload with client-side resize (up to 6 photos)
- Shareable link (data encoded in URL, no server)
- WhatsApp share + native mobile share sheet
- Downloadable standalone HTML greeting (works offline, photos included)
- Full Open Graph + Twitter Card meta tags
- Structured data (JSON-LD WebApplication)
- PWA manifest + favicon
- Sitemap + robots.txt
- 48px touch targets, iOS safe-area insets, reduced-motion support
- No account, no backend, no data stored

---

## 🏗️ Project Structure

```
MianGlow/
├── index.html          ← Landing page
├── create.html         ← Birthday creator wizard
├── view.html           ← Recipient experience
├── manifest.json       ← PWA manifest
├── sitemap.xml         ← SEO sitemap
├── robots.txt          ← Crawler rules
├── .nojekyll           ← GitHub Pages bypass
├── assets/
│   ├── images/
│   │   └── og-image.svg    ← Open Graph preview image
│   ├── icons/
│   │   └── favicon.svg
│   └── fonts/
│
├── css/
│   ├── tokens.css      ← Design tokens (colours, spacing, typography)
│   ├── global.css      ← Global reset + utilities + Phase 5 QA
│   ├── landing.css     ← Landing page styles
│   ├── animations.css  ← Scroll-reveal, shimmer, confetti keyframes
│   ├── creator.css     ← Creator wizard styles
│   ├── themes.css      ← Theme CSS variables (golden/dreamy/party/neon)
│   └── viewer.css      ← Recipient experience styles
│
├── js/
│   ├── app.js          ← Nav, scroll-reveal, star field, live demo, analytics hooks
│   ├── data-model.js   ← State, validation, image resize
│   ├── share.js        ← URL serialisation, clipboard, WhatsApp, native share
│   ├── export.js       ← Standalone HTML birthday greeting generator
│   ├── creator.js      ← 5-step wizard logic
│   ├── viewer.js       ← Recipient sequence controller
│   └── animations/
│       ├── name-reveal.js  ← Canvas 2D cinematic name reveal
│       ├── cake.js         ← Canvas 2D animated cake + candles
│       ├── confetti.js     ← Physics confetti engine
│       ├── balloons.js     ← DOM balloon float animation
│       └── fireworks.js    ← Canvas 2D rocket + burst fireworks
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Choice |
|-------|--------|
| UI | HTML / CSS / Vanilla JS (ES5 compatible) |
| Animation | CSS keyframes + Canvas 2D |
| Share data | Compressed base64 URL-fragment payload |
| Download | Blob-generated standalone HTML |
| Hosting | GitHub Pages (static, no backend) |
| PWA | Web App Manifest |

---

## 🛡️ Design Principles

- No excessive animation — smooth and purposeful
- Mobile-first, 48px touch targets
- No forced audio (user gesture required)
- No account, no sign-up, no data stored server-side
- Accessible: keyboard nav, focus rings, reduced-motion, high-contrast support
- Fast: deferred JS, lazy images, preconnect for fonts

---

## 👤 Author

Built with ❤️ by [MultiMian](https://multimian.com)

---

*Content rephrased for compliance with licensing restrictions.*
