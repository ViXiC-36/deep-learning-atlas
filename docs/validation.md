# Validation record — 2026-11-04

Validated and deployed application commit: `8844e36f1e2d10710ea698d3be5ef73e9481aca4`.

[Successful GitHub Actions build and deployment](https://github.com/ViXiC-36/deep-learning-atlas/actions/runs/41808107976). Later documentation-only changes do not change the tested application.

## Published scope

- 66 chapters cover all 101 curriculum topics across eight modules. Related topics may share a substantial chapter.
- 484 learning sections, 113 displayed equations with local notation definitions and Chinese readings, and 71 independent Python/PyTorch code examples.
- Every chapter includes a computation-flow diagram and a small self-check. The four original numerical playgrounds and Transformer explorer remain interactive; new chapters use explanation, diagrams and code examples.
- Notation is visible without hovering. Optional focus reading hides surrounding navigation and persists in browser storage. Existing chapter links, learning records and themes remain compatible.

## Passed

- 19 Node tests: numerical invariants, architecture shapes, full curriculum coverage, content structure, and KaTeX rendering of every equation and notation entry.
- TypeScript strict checking and Vite production build on Node.js 24.
- All 71 Python examples executed independently with no failures. CI installed CPU PyTorch 2.7.0 and NumPy; examples require no private data, credentials or downloaded model weights.
- 19 Chromium browser tests: all 66 chapters at all three reading depths; visible notation before equations; persistent focus mode; old topic-link redirects; theme/search/completion persistence; original playground interactions; 390px mobile and 768px tablet overflow checks.
- GitHub Pages reported deployment success on 2026-11-04 at 17:34 CST (09:34 UTC).
- A post-deployment HTTP check loaded the live HTML and its referenced JavaScript/CSS assets successfully: [Deep Learning Atlas](https://vixic-36.github.io/deep-learning-atlas/).
- Source files transferred through the GitHub integration were checked against local Git blob hashes before committing.

## Review notes and limits

- Cross-review checked multi-channel convolution dimensions and reused symbols, CTC indexing and unreachable states, RNN-T paths, speech pretraining targets, DPO/PPO/GRPO distinctions, KV-cache arithmetic, and FlashAttention normalization. Automated tests do not prove that every explanation is semantically exhaustive.
- The first V0.2 run passed the mathematical and Python checks, then found a missing JSX delimiter in the reading-depth keyboard handler. It was fixed; the complete run linked above passed.
- Browser screenshots are retained with the test artifacts, but manual pixel-level review was not performed. Browser tests use Chromium; iPad Safari has not been tested directly.
- The generated package-lock.json remains in the CI validation artifact and is not yet committed. The workflow uses npm ci when a lockfile is present and npm install otherwise.
- CI retains `validation-evidence-<attempt>` and `github-pages-<attempt>` artifacts for their configured retention periods.

For future content updates, follow [the writing and symbol-definition guide](writing-guide.md).
