#!/bin/bash -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

(
  cd "${DIR}/pt_os_web_portal/frontend"
  yarn install
  yarn test:coverage
)

(
  cd "${DIR}/pt_os_web_portal"
  PYTHONPATH=backend python3 -m pytest -v --cov-report term-missing --cov=backend
)
