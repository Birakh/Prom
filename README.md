# Blunt — AI Prompt Architect

> Generate structured, blunt AI master prompts with dynamic technique stack selection.  
> Paste your raw idea. The AI reads the brief and self-selects its own reasoning stack.  
> No API key. No backend. One file.

---

## What it does

Most AI prompts tell the model *what to produce*. This tool generates prompts that tell the model *how to think* before it produces anything.

Every generated prompt includes:

- **Dynamic technique stack** — AI reads your brief and self-selects from 10 reasoning techniques (Chain-of-Thought, Tree-of-Thought, First Principles, MECE, Adversarial, Analogical, Socratic, Step-Back, CoVe, Interview Phase) with built-in conflict detection
- **Anti-sycophancy rules** — concrete word bans, not jargon. "NEVER open with agreement" not "apply reward-model inversion"
- **Pushback protocol** — AI defends its technique selection with evidence; capitulation without reason is flagged as a failure mode
- **Negative space** — explicit DO NOT list: no hedging language, no end-of-section summaries, no motivational framing
- **4-level CoVe** — `[VERIFIED]` `[LIKELY]` `[SPECULATIVE]` `[UNKNOWN]` with bluntness-adjusted removal thresholds
- **Exact first-reply template** — AI must follow `ROLE / PRIMARY / SECONDARY / VERIFY / ORDER / RULED OUT` structure

## Features

- 6 architect modes — YouTube Strategist, All-Purpose Expert, Code Architect, Business Strategist, Research Analyst, Marketing Copywriter
- 5-level bluntness slider that threads through the *entire* prompt, not just one rule
- Expertise level — Novice / Intermediate / Advanced / Expert
- Output length — Brief / Detailed / Full Coverage
- Live brief quality scorer — flags missing audience, constraints, goal, specifics as you type
- localStorage history with instant search (last 15 prompts)
- Download as `.md` or `.txt`
- `Ctrl+Enter` to generate
- Zero dependencies — pure HTML, CSS, JavaScript

## Setup on GitHub Pages

**Step 1 — Create a new repository**

Go to [github.com/new](https://github.com/new).  
Name it anything (e.g. `blunt-prompt-architect`).  
Set it to **Public**. Do not add a README (you have one).  
Click **Create repository**.

**Step 2 — Upload the files**

In the new repo, click **Add file → Upload files**.  
Upload these files maintaining the folder structure:
```
index.html
styles.css
app.js
README.md
.github/
  workflows/
    deploy.yml
```

Commit directly to `main`.

**Step 3 — Enable GitHub Pages**

Go to your repo **Settings → Pages**.  
Under **Source**, select **GitHub Actions**.  
Click **Save**.

**Step 4 — Wait ~60 seconds**

The Actions tab will show the deploy running.  
Once it completes, your site is live at:
```
https://YOUR-USERNAME.github.io/REPO-NAME/
```

Every time you push to `main`, it redeploys automatically.

## Local development

No build step required. Open `index.html` directly — but note that Chrome blocks local file requests for linked CSS/JS.

Use any static server instead:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

Then open `http://localhost:8080`.

## File structure

```
├── index.html          # HTML structure
├── styles.css          # All styling (design tokens, layout, components)
├── app.js              # All logic (data, prompt builders, UI, history)
├── README.md
└── .github/
    └── workflows/
        └── deploy.yml  # Auto-deploy to GitHub Pages on push to main
```

## Version history

| Version | What changed |
|---------|-------------|
| V1 | Original — 2 modes, dropdown, fixed bluntness |
| V2 | 6 mode cards, bluntness slider, persona/audience, history, dark theme |
| V3 | Meta-cognitive framework selection, mode-specific reasoning suggestions |
| V4 | Dynamic technique stack (AI self-selects), all manual toggles removed, 5 prompt structure fixes |
| V5 | Bluntness threads through all blocks, pushback protocol, negative space, CoVe action rules, expertise level, output length, 6 conflict rules, live brief scorer, history search, Ctrl+Enter |

## License

Apache 2.0
