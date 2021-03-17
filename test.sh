#!/bin/bash -e

cd src/frontend
yarn test:coverage
cd ../../

cd src/server
PYTHONPATH=onboarding python3 -m pytest -v --cov-report term-missing --cov=onboarding
cd ../../
