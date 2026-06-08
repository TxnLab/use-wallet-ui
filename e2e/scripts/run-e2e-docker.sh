#!/bin/bash
# Run E2E tests in Docker (Linux environment) without affecting local node_modules
# This ensures tests run in the same environment as CI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$E2E_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# pnpm forwards the caller's `--` separator token through every script layer,
# so if present it arrives as a literal first arg here. Drop it before reading
# positionals — otherwise PROJECT would be set to "--".
if [ "${1:-}" = "--" ]; then shift; fi

# Default to chromium project (matches CI); callers may follow the project
# name with additional playwright flags, e.g. `./run-e2e-docker.sh chromium --headed`
PROJECT="${1:-chromium}"
if [ $# -gt 0 ]; then shift; fi
EXTRA_ARGS=("$@")

echo -e "${YELLOW}Running E2E tests in Docker (Linux environment)...${NC}"
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
echo "Project: $PROJECT"
echo "Extra args: ${EXTRA_ARGS[*]}"
echo ""

# Run tests in Docker with isolated node_modules
# - Mount the repo as read-write for source files
# - Use anonymous volumes for node_modules directories to isolate from host
# - This prevents Docker's pnpm install from affecting your local node_modules
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
    pnpm exec playwright test --grep-invert \"connect wallet button\" --project=$PROJECT ${EXTRA_ARGS[*]}
  "

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}E2E tests passed!${NC}"
else
  echo -e "${RED}E2E tests failed with exit code $EXIT_CODE${NC}"
fi

exit $EXIT_CODE
