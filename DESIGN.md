# Erfan Zareian portfolio

## Purpose and audience
English hiring portfolio for Erfan Zareian, Senior Product Designer in Discovery at SnappMarket. International and Iranian hiring teams should understand his problem-solving judgment, see original case studies, and make contact.

## Approved visual direction
Dark only, per Erfan’s latest instruction. Near-black cinematic portrait hero with monumental Bricolage typography and an outlined “More” contrasting with solid “impact”. Use the supplied September 24 portrait. The portrait’s natural rim light is the visual signature; no stock imagery or fabricated project mockups. Body: DM Sans. Utility: system monospace. Quiet monochrome UI, original company logos and original Medium artwork retain their colors.

## Runtime token authority
`dist/styles.css :root` owns tokens: background #080808, surface #111111, raised #191919, ink #f4f3ef, secondary #aaa9a6, border #303030, error #ffaaa4, focus #fff. Global scrollbar thumb #666, track #151515, hover #999, active #ccc. Display Bricolage, body DM, utility monospace. Content maximum 1280px. Pill buttons, 8px inputs, 14px project images, 20px dialogs. Spacing in 4/8px increments with fluid section gutters. No light theme or toggle.

## Structure and content integrity
Single page: portrait hero → moving company strip → four selected cases + two disclosed cases → career → approach and real origin story → contact form. Case cards contain original Medium images, scoped metrics and summaries; every card links directly to its original article. Old case routes redirect to Medium and contain no reconstructed narratives. `content-sources.json` records the source of every case image and metric. Career dates and outcomes come from supplied LinkedIn screenshots. Discovery is the SnappMarket focus. Hamrah Mechanic APM and Product Designer roles were concurrent. No invented hobbies, skill scores, or combined conversion statistics.

## Interaction and accessibility
Natural scrolling, native links and details, no scroll hijacking or custom cursor. Portrait responds subtly to mouse movement. Company marquee has pause/resume, hover/focus pause and a static reduced-motion layout. The approach illustration can be untangled using a real keyboard/touch button. Case hover motion does not carry essential information. Entrance motion never hides content without JavaScript. Reduced motion disables animations and smooth scrolling. Focus outlines and visible scrollbars are global. Default open SnappMarket career; remaining careers and two extra cases use native details.

## Responsive behavior
Desktop: expansive portrait hero, two-column cases and contact; career date / logo+role / disclosure columns. At 700px: mobile portrait above the headline, single-column cards, stacked careers/contact. Work and Contact stay in the header; other sections remain on the page. Support 320px width without horizontal scrolling. Image aspect ratios reserve space and artwork uses object-fit contain.

## Contact behavior
`dist/app.js` owns validation, submission and success dialog. `dist/styles.css` owns shared fields/buttons/dialogs. Destination is erfanzn777@gmail.com via FormSubmit’s AJAX service. First-use activation must be completed by the recipient. No claim of delivery before a successful service response. Activation responses are errors with direct-email recovery, not success. Invalid inputs have inline associated errors and focus moves to the first invalid field. Pending disables duplicate submission, retains geometry, and communicates status. Timeout/offline/service errors preserve all input; navigation warns about unsent input. No message data is saved to localStorage. Success clears the form and opens a native modal with check animation, focus containment, Escape and restored focus. `mailto:` and LinkedIn are always available alternatives. Email delivery is not guaranteed by a static site and must be verified after activation.

## Publishing
GitHub Pages only, repo ErfanZN/erfanzn.github.io. `main` deploys `dist/` through `.github/workflows/pages.yml`. No build step or external JS dependency. Never publish local authorization or workspace-only files.

## Optional review tool
The query parameter `review=1` loads a Persian RTL annotation tool shared by the home page. Ordinary visitors receive no review interface. A compact floating toolbar supports selecting page content, browsing normally, reviewing notes, copying requests for this conversation, and exiting. The signature is the blue selection outline and numbered pins anchored to the actual content. This is a lightweight review tool, not an editor that changes the live page.

Review tokens live in `dist/review.css` on the shadow host: paper #111111, ink #f4f3ef, soft #191919, line #393939, secondary #aaa9a6, selection #8aabff, error #ffaaa4. Existing marketing typography remains unchanged; the Persian tool uses Tahoma/Arial/system sans, 14px controls, 19px dialog headings and 1.8 line height. Controls retain 8px corners and visible focus rings. The toolbar overlays the page without moving it; the dialog scrolls within the viewport on narrow screens. No hover-only action, scroll hijacking or new motion.

`dist/review.js` owns all note forms, dialogs, statuses, CRUD and local persistence; `dist/review.css` owns their shared controls and visible scrollbars. Native HTML dialog provides focus containment, Escape and an inert background. Closing an editor preserves its draft; saving returns to the page; deleting offers Undo. Notes persist only in the current browser's local storage and are never uploaded. Copy exports page, section, element selector, text, viewport and requested change for manual pasting into this conversation. Clipboard failure provides selectable text. Storage failure retains data in memory and warns before leaving. A keyboard selection alternative uses Alt+arrow, then Enter. Page navigation in browse mode preserves the review parameter. The tool shares no authentication or account state.
