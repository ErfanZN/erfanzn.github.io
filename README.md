# Erfan Zareian — portfolio

English, dark-only portfolio. Static source in `dist/`, no build step.

- Local preview: `python3 -m http.server 4173 --directory dist`
- Live: https://erfanzn.github.io/
- Owner annotation mode: https://erfanzn.github.io/?review=1
- GitHub Actions publishes `dist/` on changes pushed to main.
- Contact: FormSubmit AJAX → erfanzn777@gmail.com; recipient activation is required before email delivery. A successful API response confirms acceptance, not inbox delivery. Direct email remains available.
- `content-sources.json` records actual Medium source links, images and scoped card metrics.
- `DESIGN.md` records design and interaction decisions.

Review mode stores notes locally in the current browser. Select a part, write a note, save, then copy the notes into the conversation. It does not automatically send notes or edit the website.

## Bilingual editing
English is served at `/`, Persian at `/fa/`. English content in `dist/index.html` is the shared markup source; Persian text, attributes, and dynamic interface messages live in `locales/fa.json`. Persian copy is an editorial adaptation, not a word-for-word translation. Preserve all factual outcomes and original case-study destinations.

After editing either language, run:

```sh
python3 scripts/build-locales.py
python3 scripts/build-locales.py --check
node tests/contact.cjs
```

Commit the generated Persian HTML and message script with their source changes. GitHub Actions checks synchronization before publishing. Common layout is in `dist/styles.css`; RTL and Vazirmatn-specific rules are in `dist/fa.css`. Tests simulate contact service responses without sending messages.
