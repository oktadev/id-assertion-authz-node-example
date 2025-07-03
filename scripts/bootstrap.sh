#!/bin/bash

set -e

yarn setup:env
yarn install
yarn postinstall
yarn resetdb
