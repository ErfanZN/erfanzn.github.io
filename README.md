# Erfan Zareian — Product Designer

Personal portfolio with selected case studies, career experience, and an interactive decision explorer.

## Website

The website files are in `dist/`. This is a static website: no dependency installation or build is required.

For a local preview, run `python3 -m http.server 4173 --directory dist` from this directory and open `http://localhost:4173`.

## Publishing

GitHub repository: `ErfanZN/erfanzn.github.io`.

Once GitHub Pages is enabled with **GitHub Actions** as its source, pushing website changes to `main` automatically publishes `dist/`. The workflow is in `.github/workflows/pages.yml`.

The intended public address is `https://erfanzn.github.io/`.

Edit the files in `dist/`, check the affected pages locally, then commit and push to `main`. Check that the **Publish portfolio** action succeeds before treating the new version as live.

The `.openai/hosting.json` file records the original Sites deployment. GitHub Pages publishes only `dist/` and does not use that configuration.
