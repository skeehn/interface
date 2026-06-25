# Contributing to skeehn

## Toolchain

The monorepo runs on **Bun** (workspaces, `bun test`, `bun run build` via tsdown,
Next.js for the docs). CI and publishing stay on Bun + npm for now.

```bash
bun install          # install workspace deps
bun test             # 760+ tests (structural + React render/interaction/a11y)
bun run build        # build @skeehn/core + @skeehn/react (tsdown)
bun run docs         # run the docs app (apps/docs)
```

### React component tests

The React package has a happy-dom + Testing Library harness (`packages/react/test/`).
Every component has a `<Name>.test.tsx`; a coverage guard fails if one is missing.

```bash
cd packages/react && bun test            # just the React tests
bun test                                  # everything, from the repo root
```

When writing tests, follow `packages/react/test/Button.test.tsx`. **Do not import
`screen`** from `@testing-library/react` (it throws under this harness) — use the
bound queries returned by `renderC(...)` or query off `root`.

## Local development with `oath` (optional, security-first)

[`oath`](https://github.com/Generalized-Labs/oath) is a security-first drop-in
replacement for `npm`/`npx` (malware scanning, postinstall scripts blocked by
default, a transparency log). It is **opt-in for local development only** — CI and
publishing remain on Bun + npm until `oath publish` provenance/OIDC is verified.

Install:

```bash
brew install generalized-labs/tap/oath
# or: curl -fsSL https://raw.githubusercontent.com/Generalized-Labs/oath/master/install.sh | sh
```

It understands this Bun workspace (verified: `oath install --dry-run` resolves all
4 packages + the `@skeehn/react` workspace link). Usage:

```bash
oath install                 # like bun install (writes oath-lock.json — gitignored)
oath add <pkg> [-D]          # add a dependency
oath run build               # run a package.json script
oath exec <bin>              # like bunx, with permission checks
oath audit                   # scan installed packages for malicious behavior
oath score <pkg>             # safety score before adding a dependency
```

Notes:
- oath **blocks postinstall scripts by default**. If a dependency legitimately needs
  one (e.g. `esbuild`), add it to `trustedDependencies` in `package.json`, or run
  `oath install --run-scripts`.
- oath writes its own `oath-lock.json` (separate from `bun.lock`); both are fine to
  keep locally — `oath-lock.json` is gitignored so it never reaches the Bun CI.
- Use `oath install --frozen-lockfile` for reproducible installs.

### Deferred (not done yet)

Moving CI and releases to oath is intentionally **not** done. Before that:
1. Verify whether `oath publish` supports npm **provenance** and/or **OIDC trusted
   publishing** — the current `publish.yml` uses `npm publish --provenance`.
2. Only then switch `.github/workflows/{ci,publish}.yml` and retire the npm token.
