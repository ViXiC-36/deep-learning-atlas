# Validation record — 2026-11-04

## Passed

- `npm test`: 18 tests passed (Node.js 24.18.1, no dependencies needed).
- Numerical checks: central finite differences for backpropagation; cross-correlation orientation, stride and padding; hand-calculated attention; causal masking; numerically stable softmax; CTC collapse order and exact path sums.
- Transformer checks: all tensor dimensions; 788-parameter inventory; per-token LayerNorm; residual sums; normalized attention and vocabulary distributions; deterministic positional encoding and forward pass.
- Content checks: unique chapter/section/topic identifiers; ready routes reference real chapters; grouped model encyclopedia entries; all graph destinations resolve to curriculum topics.
- Existing esbuild bundled the entire application with `--packages=external`. This verifies TSX syntax, local imports and CSS parsing, but is **not** a dependency-resolved production build or TypeScript typecheck.
- All eight Python examples passed Python syntax parsing. The two pure-Python CTC examples were executed with assertions; attention worked-example arithmetic was independently recalculated.

## Not yet verified

- `npm install`, TypeScript checking and Vite production build: dependency downloads were blocked by the execution environment. No lockfile or built `dist` is fabricated.
- Browser visual, accessibility and end-to-end interaction checks: browser connection timed out; native browser operation was then stopped because the current URL could not be verified reliably. No alternate UI automation was attempted after that stop.
- PyTorch example runtime execution: PyTorch was not installed in this environment.
- GitHub repository was created by the owner and initialized through the connected API on 2026-11-04. Full source upload and cloud validation are in progress. Pages enablement and deployment remain unverified.

## Next acceptance run

1. On a network-enabled machine run `npm install`, commit the generated `package-lock.json`, then `npm test` and `npm run build`.
2. Run `npm run preview`; inspect desktop, 768px tablet and 390px phone layouts, light and dark themes, search and keyboard navigation.
3. Exercise every playground: edit a value, step/play/pause where offered, reset, and verify the computed output changes. Check both Attention heads and causal masking. Verify `a → blank → a` collapses to `aa` in CTC.
4. Publish to a new `deep-learning-atlas` repository, select **Settings → Pages → GitHub Actions**, and wait for successful build and deploy jobs.
5. Verify the deployed hash routes and asset paths under the repository subpath; refresh a chapter URL.
