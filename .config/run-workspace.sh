#!/bin/sh
set -eu

if [ "${1:-}" = "--audit" ]; then
  shift
  node .config/scripts/dependencies.ts --audit
else
  node .config/scripts/dependencies.ts
fi

exec "$@"
