set shell := ["sh", "-eu", "-c"]

compose := "docker compose --file .config/compose.yaml run --rm --build"
runner := if env("LINKS_CONTAINER", "") == "1" { "" } else { compose + " workspace" }
server := if env("LINKS_CONTAINER", "") == "1" { "" } else { compose + " --service-ports workspace" }
audit := if env("LINKS_CONTAINER", "") == "1" { "" } else { compose + " audit" }

default:
    @just --list

dependencies:
    {{ runner }} node .config/scripts/dependencies.ts

dev: dependencies
    {{ server }} node .config/scripts/tasks.ts dev

build: dependencies
    {{ runner }} node .config/scripts/tasks.ts build

lighthouse-baseline:
    {{ audit }} node .config/scripts/dependencies.ts --audit
    {{ audit }} node .config/scripts/tasks.ts lighthouse-baseline

check:
    {{ audit }} node .config/scripts/dependencies.ts --audit
    {{ audit }} node .config/scripts/tasks.ts check

check-fast: dependencies
    {{ runner }} node .config/scripts/tasks.ts check-fast

ci: dependencies
    {{ runner }} node .config/scripts/tasks.ts ci

format: dependencies
    {{ runner }} node .config/scripts/tasks.ts format

format-fix: dependencies
    {{ runner }} node .config/scripts/tasks.ts format-fix

test: dependencies
    {{ runner }} node .config/scripts/tasks.ts test

lint: dependencies
    {{ runner }} node .config/scripts/quality.ts lint

lint-fix: dependencies
    {{ runner }} node .config/scripts/quality.ts lint-fix

typecheck: dependencies
    {{ runner }} pnpm --dir website run check
    {{ runner }} pnpm --dir .config exec tsc --project tsconfig.json

stats: dependencies
    {{ runner }} node .config/scripts/update-stats.ts

icons:
    {{ audit }} node .config/scripts/dependencies.ts --audit
    {{ audit }} node .config/scripts/generate-icons.ts

links:
    {{ audit }} node .config/scripts/dependencies.ts --audit
    {{ audit }} node .config/scripts/verify-links.ts

preview: dependencies
    {{ server }} node .config/scripts/tasks.ts preview

shell:
    {{ runner }} bash
