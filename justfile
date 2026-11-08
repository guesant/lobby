set shell := ["sh", "-eu", "-c"]

default:
    @just --list

dependencies:
    node .config/scripts/dependencies.ts

dev: dependencies
    node .config/scripts/tasks.ts dev

build: dependencies
    node .config/scripts/tasks.ts build

lighthouse-baseline:
    node .config/scripts/dependencies.ts --audit
    node .config/scripts/tasks.ts lighthouse-baseline

check:
    node .config/scripts/dependencies.ts --audit
    node .config/scripts/tasks.ts check

check-audit-stage:
    node .config/scripts/dependencies.ts --audit
    node .config/scripts/tasks.ts check-audit-stage

check-fast: dependencies
    node .config/scripts/tasks.ts check-fast

ci: dependencies
    node .config/scripts/tasks.ts ci

format: dependencies
    node .config/scripts/tasks.ts format

format-fix: dependencies
    node .config/scripts/tasks.ts format-fix

test: dependencies
    node .config/scripts/tasks.ts test

lint: dependencies
    node .config/scripts/quality.ts lint

lint-fix: dependencies
    node .config/scripts/quality.ts lint-fix

typecheck: dependencies
    pnpm --dir website run check
    pnpm --dir .config exec tsc --project tsconfig.json

stats: dependencies
    node .config/scripts/update-stats.ts

icons:
    node .config/scripts/dependencies.ts --audit
    node .config/scripts/generate-icons.ts

links:
    node .config/scripts/dependencies.ts --audit
    node .config/scripts/verify-links.ts

preview: dependencies
    node .config/scripts/tasks.ts preview

shell:
    bash
