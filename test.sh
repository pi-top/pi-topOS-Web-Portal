#!/bin/bash -e

cd src/frontend/onboarding
yarn install
yarn test:coverage
cd ../../../

cd src/server
PYTHONPATH=backend python3 -m pytest -v --cov-report term-missing --cov=backend
cd ../../../

# Or
# docker run \
# 	--rm \
# 	--name onboarding-py-tests \
# 	--volume "$PWD":/src \
# 	--env RUN_PYTHON_TESTS=1 \
# 	--env PYTHON_TESTS_DIR=src/server/tests \
# 	--env PYTHON_TARGET_DIR=src/server \
# 	--env PYTHON_COVERAGE_DIR=backend \
# 	--env RUN_WEB_TESTS=1 \
# 	--env WEB_TESTS_DIR=src/frontend/onboarding \
# 	pitop/test-run
