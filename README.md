# SLOP

> *An idle game where the gameplay is the moral compromise.*

A satirical mobile idle game fusing AdVenture Capitalist's frictionless chassis with Game Dev Tycoon's combinatorial decision space. The Algorithm is opaque, every recipe rots under exploitation, and the win screen is the dead internet.

## Repository layout

```
SLOP-design-document.md         — 713-line master design doc (the structure is the deliverable)
*-design-briefing.md            — supporting research briefings
slop-game/                      — Phase 1 prototype: Vite + React + TypeScript + Tailwind
.github/workflows/deploy.yml    — GitHub Pages auto-deploy on push to main
```

## What's in Phase 1

The §16 vertical slice that proves the core loop works:

- Full four-axis recipe engine (Model × Topic × Platform × Tactic), with Platform as page identity (D6)
- The 10×7 Affinity matrix and 7×7 Tactic-Synergy table from §4
- **Both anti-solve systems live** — rotating Trend with the legible→opaque flip (D2), and Saturation decay (§4.6)
- Directional preview picker (D4) + factor strip (D5)
- One soft prestige (Algorithm Update — banks Slop Tokens, reshuffles 15% of the matrix, flips Trend opaque on first run)
- ~10 verbatim-quote achievements (§13)
- Offline progress + localStorage save
- Mobile-first responsive layout

Not yet in Phase 1: Eras II–IV, scandals, bots-decision feedback (slider works but the crackdown event isn't wired), Model-Collapse Reruns, the Scam Tier.

## Local development

```bash
cd slop-game
npm install
npm run dev
```

Visit http://localhost:5173.

## Deploying to GitHub Pages

The repo is wired to auto-deploy `slop-game/` on every push to `main`. To turn it on:

1. **Create a GitHub repo** (recommended name: `slop-game` — keeps the local-build fallback base path matching what Pages serves).
2. **Push this folder up:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit — SLOP design doc + Phase 1 prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/slop-game.git
   git push -u origin main
   ```
3. In the GitHub repo settings → **Pages**, set the source to **GitHub Actions**.
4. The Actions workflow will build and publish on this push and every subsequent one. The live URL appears under the deploy job (`https://<your-username>.github.io/<repo-name>/`).

Open the URL on a phone to test the mobile build. Cache-bust by adding `?v=2` if you don't see a recent change.

## Design references

- `SLOP-design-document.md` — the master doc. Read §0 (the design bet), §4 (the heart), §16 (Phase 1 roadmap), and the D1–D12 decision log at the top.
- `*-design-briefing.md` — research briefings on AdVenture Capitalist, Game Dev Tycoon, the idle-game canon, and SLOP's verbatim source material.

## Phase 1 pass/fail (per §16)

- ✅ Median check-in retunes a chip, not passive watching
- ✅ Two players from the same start reach different recipe builds
- ✅ Returning player changes a recipe *because of* the Trend ticker
- 🟡 Saturation visibly forces niche rotation (works in math; needs longer playtest to confirm the feel)
- 🟡 Players laugh at least once (tooltips and achievements wired; needs playtester)
