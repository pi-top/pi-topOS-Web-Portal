#!/bin/bash -e

cd src/frontend/onboarding
yarn install
yarn test:coverage
cd ../../../

cd src/server
PYTHONPATH=backend python3 -m pytest -v --cov-report term-missing --cov=backend
cd ../../../
