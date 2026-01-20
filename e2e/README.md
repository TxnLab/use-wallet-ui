# E2E Tests

End-to-end tests for `@txnlab/use-wallet-ui-react` using [Playwright](https://playwright.dev/).

## Running Tests

### Local (Native)

Run tests using your local browser installations:

```bash
pnpm e2e                    # Run tests (excludes button visual tests)
pnpm e2e:all                # Run all tests including button visual tests
pnpm e2e --project=chromium # Run only Chromium tests
pnpm e2e:headed             # Run with visible browser
pnpm e2e:ui                 # Run with Playwright UI
pnpm e2e:debug              # Run in debug mode
```

> **Note:** The default `e2e` script excludes "connect wallet button" visual tests because they fail on macOS due to 1px image dimension differences caused by font rendering variations between macOS and Linux. Use `e2e:all` or Docker to run all tests.

### Local (Docker)

Run tests in a Linux Docker container matching the CI environment. This ensures visual regression tests produce consistent results:

```bash
pnpm e2e:docker             # Run tests in Docker (chromium by default)
pnpm e2e:docker firefox     # Run with a specific browser project
```

The Docker script uses anonymous volumes for `node_modules` directories, so it won't affect your local development environment.

## Visual Regression Tests

Visual regression tests capture screenshots and compare them against baseline images stored in `tests/visual/__snapshots__/`.

### Updating Snapshots

When UI changes are intentional, update the baseline snapshots using Docker to match CI:

```bash
pnpm e2e:update:docker
```

This runs in the same Linux environment as CI, ensuring consistent baselines. After running, review the changes and commit:

```bash
git add tests/visual/__snapshots__
git commit -m "chore: update visual regression baselines"
```

### Why Docker?

Visual regression tests are sensitive to:

- **Font rendering** - macOS and Linux render fonts differently
- **Subpixel antialiasing** - Varies by platform
- **System fonts** - Different default fonts between OSes
- **Element dimensions** - Button screenshots may differ by 1px between platforms

Running in Docker ensures your local tests match CI results.

### Cross-Platform Compatibility

The "connect wallet button" visual tests are excluded from the default `pnpm e2e` script because isolated button screenshots produce images with 1px dimension differences between macOS and Linux. This is due to subtle font rendering variations affecting button sizing.

- **Most visual tests pass locally** - Full page screenshots, modal screenshots, and other tests are large enough that the pixel difference tolerance handles any variations
- **Button tests require Docker** - Use `pnpm e2e:docker` or `pnpm e2e:all` in a Linux environment to run all tests
- **CI runs all tests** - The GitHub Actions workflow runs in Linux where all tests pass

## Test Structure

```
e2e/
├── tests/
│   ├── theme/           # Theme functionality tests
│   │   ├── dark-mode.spec.ts
│   │   ├── light-mode.spec.ts
│   │   ├── system-preference.spec.ts
│   │   └── theme-switching.spec.ts
│   └── visual/          # Visual regression tests
│       ├── dark-mode.spec.ts
│       ├── light-mode.spec.ts
│       └── __snapshots__/  # Baseline images
├── fixtures/            # Test fixtures and utilities
├── scripts/             # Helper scripts
│   ├── run-e2e-docker.sh
│   └── update-snapshots.sh
└── playwright.config.ts # Playwright configuration
```

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- **Projects**: chromium, chromium-dark, firefox, webkit
- **Web Server**: Automatically starts the example app on port 5173
- **Visual Comparison**: 5% pixel difference tolerance for font rendering variations
- **Retries**: 2 retries in CI, none locally

## CI Integration

E2E tests run automatically on pull requests via GitHub Actions. The CI workflow:

1. Installs dependencies with `--frozen-lockfile`
2. Builds the library
3. Runs E2E tests with Chromium
4. Uploads test reports and screenshots on failure
