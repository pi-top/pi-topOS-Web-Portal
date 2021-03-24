#!/bin/bash -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
SRC_DIR="${DIR}/src"

echo "Building static files for onboarding web server"
cd "${SRC_DIR}/frontend/onboarding"
yarn install
yarn build
