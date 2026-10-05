# Ritesh Vishwakarma — Portfolio

A responsive, dependency-free portfolio for GitHub Pages, built from the experience and projects in my résumé.

**Live portfolio:** [rvtechinnovate.github.io/portfolio](https://rvtechinnovate.github.io/portfolio/)

## Preview locally

The project uses the existing `uv` environment and Python's static file server:

```bash
uv sync
uv run python -m http.server 8000
```

Open `http://localhost:8000`.

## Connect the Hugging Face voice agent

Open [`site.config.js`](./site.config.js) and set `spaceUrl` to the direct public or protected Space URL:

```js
window.PORTFOLIO_CONFIG = {
  voiceAgent: {
    spaceUrl: "https://YOUR-USERNAME-YOUR-SPACE.hf.space",
    title: "Ritesh’s AI assistant",
  },
};
```

Use the `https://…hf.space` URL shown in the Space's embed options. Do not put an API token or other secret in this repository. Until a valid URL is configured, the portfolio displays an honest “Coming soon” panel with résumé-based quick answers.

The embedded Space is only loaded after a visitor presses **Start conversation**. Closing the panel removes the iframe and ends the embedded session.

## Publish on GitHub Pages

The included workflow deploys the static site whenever `main` is updated.

1. Push these files to the repository's `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Open the repository's **Actions** tab to follow the first deployment.

The `.nojekyll` file keeps GitHub Pages from applying Jekyll processing. All asset paths are relative, so the site works at either a user domain or a repository subpath.

## Main files

- `index.html` — content, project case studies, metadata, and accessible dialogs
- `styles.css` — responsive visual system and layouts
- `app.js` — navigation, filtering, dialogs, clipboard, and voice embed behavior
- `scene.js` — lightweight canvas artwork for the hero
- `site.config.js` — public voice-agent configuration
- `assets/Ritesh_Vishwakarma_Resume.pdf` — downloadable résumé
