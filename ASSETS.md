# Asset provenance

## Night shift illustration
- Tool: built-in image_gen (no CLI/API fallback).
- Published asset: `dist/assets/night-shift-illustration.png` (1536 × 1024).
- Purpose: symbolic editorial illustration for Erfan’s true account of studying design while working night security. The page captions it as an illustration, not an archival photograph.
- Final prompt:

> Use case: illustration-story. Asset: editorial illustration for a product designer's personal origin story, a dark minimalist portfolio. Create a cinematic charcoal and graphite illustration, landscape 3:2 composition, showing a modest residential-building night security desk in Tehran: one empty worn office chair, an open notebook with faint abstract interface sketches, a couple of well-used books, a small pool of warm light from a desk lamp, a quiet dark entrance lobby and a window with sparse distant city lights. No person or face. This is a symbolic illustration about someone working night security shifts while teaching himself design in the quiet hours, dignity and persistence rather than melodrama. Black, charcoal and warm ivory palette, deep shadows, tactile hand-drawn grain, fine precise details around the notebook and fading edges into black. Restrained, human, beautiful editorial storytelling. Horizontal composition with notebook and light in lower-middle, window upper-right. Not a photograph and not a fake documentary image of an actual specific building. No legible text, no clock digits, no brand logos, no security weapon, no luxury office, no neon, no watermark.

## Portrait
The supplied original `dist/assets/erfan-portrait-dark.png` remains unchanged at 1086 × 1448. Two generated restoration attempts returned the same dimensions and altered visual details, so neither is used on the website. No upscaling or extra photographic detail is claimed.

## Case covers
The original Medium images recorded in `content-sources.json` are unchanged. Shared HTML/CSS adds a consistent frame, aspect ratio, company and topic label around them. No product UI was generated or redrawn.

## Unified case covers
The six covers are native HTML/CSS device compositions using SVG viewBox crops of original published UI. There is no generated UI or rewritten screenshot text. Additional budget/result, market offer and inspection comparison images were retrieved from the same author’s supplied Medium articles; exact URLs are recorded in content-sources.json. Phone/browser frames and the charcoal scene are CSS, so all covers share one responsive visual system.

## Persian typography
Self-hosted [Vazirmatn](https://github.com/rastikerdar/vazirmatn), version v33.003, from the official repository: `fonts/webfonts/Vazirmatn[wght].woff2`. Served as `/assets/vazirmatn.woff2`. The SIL Open Font License is included at `/assets/Vazirmatn-OFL.txt`. No external font request is required at runtime.
