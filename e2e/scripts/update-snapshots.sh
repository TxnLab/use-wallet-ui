#!/bin/bash
# Update visual regression snapshots using Docker (Linux environment)
# This ensures snapshots match what CI will see

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$E2E_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to chromium project (matches CI); callers can override via args,
# e.g. `pnpm test:e2e:update:docker -- --project=vue-chromium`
PROJECT_ARGS=("$@")
# pnpm forwards the caller's `--` separator token through every script layer,
# so if present it arrives as a literal arg here. Drop it so it doesn't land
# between `playwright test` and the forwarded flags — playwright would treat
# everything after `--` as positional test-file regexes and match nothing.
if [ "${PROJECT_ARGS[0]:-}" = "--" ]; then
  PROJECT_ARGS=("${PROJECT_ARGS[@]:1}")
fi
if [ ${#PROJECT_ARGS[@]} -eq 0 ]; then
  PROJECT_ARGS=(--project=chromium)
fi

echo -e "${YELLOW}Updating visual regression snapshots using Docker...${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Use the official Playwright Docker image matching the installed @playwright/test version
# Derived from the package so the image tag cannot drift from the npm pin
PLAYWRIGHT_VERSION="v$(cd "$E2E_DIR" && node -p "require('@playwright/test/package.json').version")"
IMAGE="mcr.microsoft.com/playwright:${PLAYWRIGHT_VERSION}"

# Pin pnpm inside the container to the root packageManager version so Renovate's
# pnpm bumps to the root manifest don't silently desync from this script
PNPM_VERSION="$(node -p "require('$ROOT_DIR/package.json').packageManager.split('@')[1]")"

echo "Using Playwright image: $IMAGE"
echo "Using pnpm: $PNPM_VERSION"
echo "Mounting: $ROOT_DIR -> /work"
echo "Project args: ${PROJECT_ARGS[*]}"
echo ""

# Run the update command in Docker
# - Mount the repo as read-write for source files and snapshots
# - Use anonymous volumes for node_modules directories to isolate from host
# - This prevents Docker's pnpm install from affecting your local node_modules
# - Run only chromium project (matches CI)
docker run --rm \
  -v "$ROOT_DIR:/work" \
  -v /work/node_modules \
  -v /work/packages/react/node_modules \
  -v /work/packages/vue/node_modules \
  -v /work/examples/react/node_modules \
  -v /work/examples/react-css-only/node_modules \
  -v /work/examples/react-custom/node_modules \
  -v /work/examples/vue/node_modules \
  -v /work/e2e/node_modules \
  -w /work \
  -e CI=true \
  "$IMAGE" \
  /bin/bash -c "
    cd /work && \
    npm install -g pnpm@$PNPM_VERSION && \
    pnpm install --frozen-lockfile && \
    pnpm build && \
    cd e2e && \
    pnpm exec playwright test --update-snapshots ${PROJECT_ARGS[*]}
  "

echo ""
echo -e "${GREEN}Snapshots updated successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the updated snapshots in e2e/tests/visual/__snapshots__/"
echo "  2. Commit the changes: git add e2e/tests/visual/__snapshots__ && git commit -m 'chore: update visual regression baselines'"
