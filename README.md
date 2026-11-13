# ✨ MianGlow

**Make Their Birthday Unforgettable.**

MianGlow is a personalized animated birthday surprise creation platform. Create a beautiful glowing birthday experience, share it as a link, or download a standalone greeting — no account required.

---

## 🌐 Live Site

**[https://mianhassam96.github.io/MianGlow](https://mianhassam96.github.io/MianGlow)**

---

## 🗺️ Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Done | Audit existing Canvas LED scroller |
| Phase 1 | ✅ Done | Landing page, branding, design tokens |
| Phase 2 | 🔨 Next | Birthday creator (wizard, themes, preview) |
| Phase 3 | Planned | Animation engine (cake, confetti, name reveal) |
| Phase 4 | Planned | Share links + downloadable HTML greeting |
| Phase 5 | Planned | QA, mobile testing, accessibility |
| Phase 6 | Future | Growth, SEO, optional premium themes |

---

## 🎨 Themes (Phase 2)

| Theme | Description |
|-------|-------------|
| **Golden Celebration** | Flagship — cinematic black & gold, golden particles, elegant name reveal |
| **Dreamy Birthday** | Soft purples, floating hearts, romantic photo memories |
| **Party Blast** | Colorful balloons, confetti, bright energetic animations |
| **Neon Night** | Glowing text, neon outlines, modern digital celebration |

---

## 🏗️ Project Structure

```
MianGlow/
├── index.html          ← Landing page
├── create.html         ← Birthday creator (Phase 2)
├── view.html           ← Recipient experience (Phase 4)
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── css/
│   ├── tokens.css      ← Design tokens
│   ├── global.css      ← Global reset + utilities
│   ├── landing.css     ← Landing page styles
│   ├── animations.css  ← Animation utilities
│   ├── creator.css     ← Creator wizard (Phase 2)
│   ├── viewer.css      ← Recipient view (Phase 4)
│   └── themes.css      ← Theme-specific styles (Phase 2)
│
├── js/
│   ├── app.js          ← Global utilities, nav, reveal
│   ├── creator.js      ← Creator wizard logic (Phase 2)
│   ├── viewer.js       ← Recipient experience (Phase 4)
│   ├── data-model.js   ← Celebration data model (Phase 2)
│   ├── share.js        ← URL-fragment share links (Phase 4)
│   ├── export.js       ← HTML download (Phase 4)
│   └── animations/
│       ├── cake.js
│       ├── confetti.js
│       ├── balloons.js
│       ├── fireworks.js
│       └── name-reveal.js
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Choice |
|-------|--------|
| UI | HTML / CSS / Vanilla JS |
| Animation | CSS, Canvas 2D, SVG |
| Share data | Compressed URL-fragment payload |
| Download | Blob-generated standalone HTML |
| Hosting | GitHub Pages (static) |
| Backend | None required for MVP |

---

## 🛡️ Design Principles

- No excessive animation everywhere
- Strong typography and beautiful spacing
- Fast mobile loading
- Touch-friendly interactions
- No forced audio (user gesture required)
- No account or sign-up required

---

## 👤 Author

Built with ❤️ by [MultiMian](https://github.com/Mianhassam96)
