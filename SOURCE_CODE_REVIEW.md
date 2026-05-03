# Source Code Review Guide

This document helps AMO reviewers reproduce the Firefox build for **Email Makinator**.

## Project Summary

Email Makinator is a browser extension that assists users in drafting emails with AI.

- Current provider support: Gmail (initial release)
- Target browsers: Chrome (MV3), Firefox (MV2 build target via WXT)
- Framework: WXT + React + TypeScript

## Repository

- Source repository: `https://github.com/mkgp-dev/email-makinator`

## Build Environment

- Node.js: 20+ recommended
- npm: 10+ recommended

## Install Dependencies

```bash
npm install
```

## Build Commands

### Type-check

```bash
npm run compile
```

### Test

```bash
npm test
```

### Firefox production build

```bash
npm run build:firefox
```

### Firefox submission zip

```bash
npm run zip:firefox
```

## Build Artifacts

WXT outputs artifacts under `.output/`.

- Firefox extension package zip (used for AMO upload)
- Firefox sources zip (used for AMO source review)

Exact filenames can vary by version and WXT output naming.

## Environment Variables

The project uses:

- `WXT_PUBLIC_API_BASE_URL`

Files used for local/prod configuration:

- `.env.development`
- `.env.production`

For source review/reproducible build, any non-secret value is acceptable (for example, localhost URL).  
No private API keys are required to build the extension package.

### Note on Committed `.env.*` Files

Any committed `.env.*` files in this repository are intended to contain **non-secret** configuration only (for example, public API base URLs).  
No private credentials, tokens, or secret keys are stored in committed environment files.

## Network/Data Notes

- The extension sends generation requests to the configured API base URL only when user-triggered actions occur.
- Optional user-provided Pollinations key can be included as an Authorization bearer token.
- Settings are stored locally using browser extension storage.

## Generated Code

- `.output/` contains generated build artifacts from WXT.
- These files are not handwritten source code.

## Reproducibility Notes

If build output hash/filenames differ across systems, this is expected due to toolchain/environment differences.  
Functional behavior should remain consistent when using the same source revision and commands above.
