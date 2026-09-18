# Suyash Vasal Jain | Portfolio

A dark, motion-heavy personal portfolio for **Suyash Vasal Jain**, full stack
developer from Indore, India. Built with **React 18**, **TypeScript**,
**Tailwind CSS 3**, **Framer Motion 12** and **Lucide React**, bundled with
**Vite**.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## Design

- **Hero**: a giant white "HI, I'M SUYASH" heading over a dimmed pixel-art
  field, with a large static pixel-art lily (pink/violet) as the centerpiece.
  Moving the cursor reveals a warm coral version of the lily inside a soft
  trailing circle. No photo, no CTA: the lily is the hero.
- **Backgrounds**: a grayscale pixel-art field behind the hero (gently dimmed
  for text readability), flowing into a near-black pixel field that covers the
  rest of the page.
- **Typography**: all text is pure white for contrast; panels and borders use
  subtle light tones (#D7E2EA).

## Sections

| Section | Highlights |
| --- | --- |
| **Hero** | Mega heading, pixel-art lily with cursor-trail reveal, top nav |
| **Marquee** | Two rows of real screenshots from Suyash's own sites and apps, sliding in opposite directions as you scroll |
| **About** | Character-by-character scroll-reveal bio, highlight chips (CGPA 8.94, I-SoftZone internship, ACM/IEEE roles, SIH 2025), email CTA |
| **Services** | White rounded panel: Full Stack Development, Mobile Development, AI & RAG, Backend & Databases, UI/UX & Design |
| **Projects** | Five cards: Prepwise, Roll Call, ClinicGo, Nrityarpan, Vahan Vault, each linking to the live project |
| **Contact** | Icon contact cards (email, phone, location, LinkedIn, GitHub, portfolio), "Say Hello" CTA, footer |

## Interaction notes

- **Every clickable element gives feedback.** Nav links smooth-scroll
  programmatically (`scrollIntoView`) so they work even inside sandboxed
  preview iframes; mail/phone actions copy the value to the clipboard with a
  toast; web links open in a new tab and fall back to copy + toast when
  popups are blocked.
- The lily's cursor reveal uses a rAF lerp loop (no re-renders) so the trail
  eases gently behind the pointer.

## Assets

- `public/assets/hero-bg4.png`: hero pixel-art field (dimmed by a 30% overlay
  for readability).
- `public/assets/rest-bg.png`: near-black pixel field for the rest of the page.
- `public/assets/lily-front.png` / `lily-reveal.png`: the pixel-art lily,
  normal and coral variants.
- `public/projects/*.jpg`: real screenshots captured from the live projects.
- `public/marquee/m01-m21.jpg`: marquee tiles from the same captures,
  composited to a consistent 420x270 crop.

## Reusable components (`src/components`)

- **`FadeIn`**: `motion.create()` wrapper that fades/slides content into view.
- **`AnimatedText`**: per-character scroll-driven opacity via `useScroll` +
  `useTransform`.
- **`ContactButton` / `LiveProjectButton`**: CTA pills with copy-to-clipboard
  feedback.
- **`ToastProvider` / `useToast`**: lightweight toast for click
  acknowledgements.

## Notes

- Global styles live in `src/index.css` (reset, `.hero-heading` white text).
- Kanit (weights 300 to 900) is loaded from Google Fonts in `index.html`.
- The main wrapper uses `overflow-x: clip` (not `hidden`) so `position: sticky`
  keeps working inside it.
- Deploying to GitHub Pages? See **DEPLOY.md** (a workflow file is included).
