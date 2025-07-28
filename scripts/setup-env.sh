#!/bin/bash

set -e

cp -n packages/todo0/.env.default packages/todo0/.env 2>/dev/null || true
cp -n packages/wiki0/.env.default packages/wiki0/.env 2>/dev/null || true
cp -n packages/authorization-server/.env.wiki.default packages/authorization-server/.env.wiki 2>/dev/null || true
cp -n packages/authorization-server/.env.todo.default packages/authorization-server/.env.todo 2>/dev/null || true

echo "\n[setup:env] Default .env files copied (if not already present)."
echo "Please edit the following files to fill in required values:"
echo "  - packages/authorization-server/.env.todo"
echo "  - packages/authorization-server/.env.wiki"
echo "  - packages/wiki0/.env (for SAML config if needed)"
echo "  - packages/todo0/.env (if needed)"
echo "Required fields: CUSTOMER1_AUTH_ISSUER, CUSTOMER1_CLIENT_ID, etc."
