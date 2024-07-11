name: Code Coverage Test

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18.x'
      - run: npm install
      - run: npm test -- --coverage
      - run: npm install coveralls --save-dev
      - run: cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
        env:
          COVERALLS_REPO_TOKEN: ${{ secrets.COVERALLS_REPO_TOKEN }}
