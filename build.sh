#!/bin/bash -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "Building static frontend files..."
(
  cd "${DIR}/pt_os_web_portal/frontend"
  yarn install
  yarn build
)

# pip3 install -e .
