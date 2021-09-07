#!/bin/bash -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "Building static files for onboarding web server"
(
  cd "${DIR}/frontend"
  yarn install
  yarn build
)
