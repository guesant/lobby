set shell := ["sh", "-eu", "-c"]

compose := "docker compose -f .config/compose.yaml run --build --rm"
runner := "sh .config/run-workspace.sh"
workspace := compose + " workspace " + runner
audit := compose + " audit " + runner + " --audit"
tasks := "node .config/scripts/tasks.ts"

default:
    @just --list

dependencies:
    {{ compose }} workspace node .config/scripts/dependencies.ts

dev:
    {{ compose }} --service-ports workspace {{ runner }} {{ tasks }} dev

build:
    {{ workspace }} {{ tasks }} build

lighthouse-baseline:
    {{ audit }} {{ tasks }} lighthouse-baseline

check: _check-justfile
    {{ audit }} {{ tasks }} check

check-audit-stage:
    {{ compose }} -e AUDIT_STAGE audit {{ runner }} --audit {{ tasks }} check-audit-stage

check-fast: _check-justfile
    {{ workspace }} {{ tasks }} check-fast

ci: _check-justfile
    {{ workspace }} {{ tasks }} ci

format: _check-justfile
    {{ workspace }} {{ tasks }} format

format-fix:
    just --fmt
    {{ workspace }} {{ tasks }} format-fix

test:
    {{ workspace }} {{ tasks }} test

lint:
    {{ workspace }} node .config/scripts/quality.ts lint

lint-fix:
    {{ workspace }} node .config/scripts/quality.ts lint-fix

typecheck:
    {{ workspace }} sh -eu -c 'pnpm --dir website run check && pnpm --dir .config exec tsc --project tsconfig.json'

stats:
    {{ workspace }} node .config/scripts/update-stats.ts

icons:
    {{ audit }} node .config/scripts/generate-icons.ts

links:
    {{ audit }} node .config/scripts/verify-links.ts

preview:
    {{ compose }} --service-ports workspace {{ runner }} {{ tasks }} preview

shell:
    {{ compose }} workspace bash

_check-justfile:
    just --fmt --check
