FROM koalaman/shellcheck:v0.11.0@sha256:61862eba1fcf09a484ebcc6feea46f1782532571a34ed51fedf90dd25f925a8d AS shellcheck
FROM mvdan/shfmt:v3.14.1@sha256:8c06884a35683d8763fba6c0d9484d11a61a96da65f8d497d6f625825a6043f2 AS shfmt
FROM ghcr.io/ossf/scorecard:v5.4.0@sha256:546c3f019eb24974abda92004a9003e4059a10e9ee13b1c3ab40d29f4f32f764 AS scorecard
FROM ghcr.io/renovatebot/renovate:44.201.1-full@sha256:eb95a37c0350651d7cc0dc5b383450cbbfeb0fc2ecba69cb13bd4839def31e1d AS renovate
ENTRYPOINT ["/usr/local/sbin/renovate-entrypoint.sh", "renovate"]
CMD []

FROM rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667 AS actionlint
FROM ghcr.io/zizmorcore/zizmor:1.31.1@sha256:42d409dbb851d4c5d35a058cf042b828bea1e3f2884378c526eb0974780e18d9 AS zizmor
FROM hadolint/hadolint:v2.15.1@sha256:32dac94127fd60b7b7e3fbfc65e1383b9b5e25c9bfd7b8536de7a539fe68a12d AS hadolint
FROM zricethezav/gitleaks:v8.30.1@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f AS gitleaks
FROM ghcr.io/casey/just:1.59.0@sha256:014cbe6e6de678864004e2fd8b0405f77ce43b20b225e816feb330f2fb575c01 AS just
FROM ghcr.io/astral-sh/uv:0.13.6@sha256:af22a52f5eafef3d78e551599d405c02df61919d18028f0cea8eda93bc9986d0 AS uv
FROM lycheeverse/lychee:0.24.2-alpine@sha256:2255c0b916cc8fc4193f59a4549358a6bae0f7d4ea16b5e1dd4c3b2733c35504 AS lychee
FROM ghcr.io/google/osv-scanner:v2.5.1@sha256:8108ae94eadea5a02c9bec6e646909d5b790b44bd62d7f5b7f0b1d6d0ffc7734 AS osv-scanner
FROM aquasec/trivy:0.74.0@sha256:62b1e65e8869bc4b4c6aa4fa2b21595256c7c2f6018a9d9ad61caf87187c1969 AS trivy

FROM node:24.15.0-bookworm@sha256:f22d6a1f082c02f292e86929b5b0442ac2e5eaf438a5dea9b1566601c3e05940 AS certificates

FROM node:24.15.0-bookworm-slim@sha256:4e6b70dd6cbfc88c8157ba19aa3d9f9cce6ba4703576d55459e45efcbc9c5f5d AS node-base

FROM node-base AS ci-policy
WORKDIR /workspace
ENTRYPOINT ["node", ".config/scripts/ci-policy.ts"]

FROM node-base AS node-tools
COPY --from=certificates /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
ARG DEBIAN_SNAPSHOT=20261107T000000Z
# renovate: datasource=deb registryUrl=https://deb.debian.org/debian?suite=bookworm&components=main
RUN sed -i \
    -e "s|^URIs: http://deb.debian.org/debian$|URIs: https://snapshot.debian.org/archive/debian/${DEBIAN_SNAPSHOT}/\nCheck-Valid-Until: no|" \
    -e "s|^URIs: http://deb.debian.org/debian-security$|URIs: https://snapshot.debian.org/archive/debian-security/${DEBIAN_SNAPSHOT}/\nCheck-Valid-Until: no|" \
    /etc/apt/sources.list.d/debian.sources \
  && apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates=20250419~deb12u2 curl=7.88.1-10+deb12u15 git=1:2.39.5-0+deb12u3 libstdc++6=12.2.0-14+deb12u1 optipng=0.7.7-2+b1 python3=3.11.2-1+b1 python3-venv=3.11.2-1+b1 \
  && rm --recursive --force /var/lib/apt/lists/*
ARG COREPACK_VERSION=v0.36.0
ARG COREPACK_SHA256=9128cfe26aee0c99f4fc68c15c6b8b12309a68be0de2c012cdfea2a463cb722f
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl --fail --silent --show-error --location "https://github.com/nodejs/corepack/releases/download/${COREPACK_VERSION}/corepack.tgz" --output /tmp/corepack.tgz \
  && echo "${COREPACK_SHA256}  /tmp/corepack.tgz" | sha256sum --check --strict \
  && mkdir --parents /opt/corepack \
  && tar --extract --gzip --file /tmp/corepack.tgz --directory /opt/corepack --strip-components=1 \
  && node /opt/corepack/dist/corepack.js enable pnpm --install-directory /usr/local/bin \
  && rm /tmp/corepack.tgz
COPY --from=just /just /usr/local/bin/just
COPY --from=uv /uv /usr/local/bin/uv
COPY --from=actionlint /usr/local/bin/actionlint /usr/local/bin/actionlint
COPY --from=zizmor /usr/bin/zizmor /usr/local/bin/zizmor
COPY --from=hadolint /bin/hadolint /usr/local/bin/hadolint
COPY --from=gitleaks /usr/bin/gitleaks /usr/local/bin/gitleaks
ENV LINKS_CONTAINER=1
ENV TOOLING_PROFILE=fast
ENV PNPM_HOME=/pnpm
ENV PNPM_CONFIG_STORE_DIR=/pnpm/store
ENV UV_PYTHON_DOWNLOADS=never
ENV PATH="/workspace/.config/node_modules/.bin:/workspace/website/node_modules/.bin:/opt/python/.venv/bin:${PATH}"
COPY .config/package.json /opt/tooling/package.json
COPY website/package.json website/pnpm-lock.yaml website/pnpm-workspace.yaml /opt/website/
RUN node -p "require('/opt/tooling/package.json').packageManager" \
  | xargs node /opt/corepack/dist/corepack.js install --global
RUN pnpm --dir /opt/website fetch --store-dir /pnpm/store
WORKDIR /workspace

FROM node-tools AS yamllint
COPY .config/python/pyproject.toml .config/python/uv.lock /opt/python/
RUN uv sync --project /opt/python --locked --no-group audit --no-install-project

FROM node-tools AS audit-node
# renovate: datasource=deb registryUrl=https://deb.debian.org/debian-security?suite=bookworm-security&components=main
RUN apt-get update \
  && apt-get install --yes --no-install-recommends chromium=156.0.8078.79-1~deb12u1 g++=4:12.2.0-3 make=4.3-4.1 \
  && rm --recursive --force /var/lib/apt/lists/*
ENV TOOLING_PROFILE=audit
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV npm_config_build_from_source=true
ENV RE2_DOWNLOAD_FORCE_BUILD=1
ENV npm_config_nodedir=/usr/local
ENV PATH="/workspace/.config/audit/node_modules/.bin:${PATH}"

FROM node-tools AS ast-grep
WORKDIR /opt/tools/ast-grep
COPY .config/tooling/ast-grep/package.json .config/tooling/ast-grep/pnpm-lock.yaml .config/tooling/ast-grep/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/ast-grep/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS markdownlint
WORKDIR /opt/tools/markdownlint
COPY .config/tooling/markdownlint/package.json .config/tooling/markdownlint/pnpm-lock.yaml .config/tooling/markdownlint/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/markdownlint/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS jscpd
WORKDIR /opt/tools/jscpd
COPY .config/tooling/jscpd/package.json .config/tooling/jscpd/pnpm-lock.yaml .config/tooling/jscpd/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/jscpd/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS eslint
WORKDIR /opt/tools/eslint
COPY .config/tooling/eslint/package.json .config/tooling/eslint/pnpm-lock.yaml .config/tooling/eslint/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/eslint/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS prettier
WORKDIR /opt/tools/prettier
COPY .config/tooling/prettier/package.json .config/tooling/prettier/pnpm-lock.yaml .config/tooling/prettier/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/prettier/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS knip
WORKDIR /opt/tools/knip
COPY .config/tooling/knip/package.json .config/tooling/knip/pnpm-lock.yaml .config/tooling/knip/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/knip/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS vitest
WORKDIR /opt/tools/vitest
COPY .config/tooling/vitest/package.json .config/tooling/vitest/pnpm-lock.yaml .config/tooling/vitest/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/vitest/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS stylelint
WORKDIR /opt/tools/stylelint
COPY .config/tooling/stylelint/package.json .config/tooling/stylelint/pnpm-lock.yaml .config/tooling/stylelint/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/stylelint/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS typecheck
WORKDIR /opt/tools/typecheck
COPY .config/tooling/typecheck/package.json .config/tooling/typecheck/pnpm-lock.yaml .config/tooling/typecheck/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/typecheck/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS automation
WORKDIR /opt/tools/automation
COPY .config/tooling/automation/package.json .config/tooling/automation/pnpm-lock.yaml .config/tooling/automation/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/automation/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS dependency-submission
WORKDIR /opt/tools/dependency-submission
COPY .config/tooling/dependency-submission/package.json .config/tooling/dependency-submission/pnpm-lock.yaml .config/tooling/dependency-submission/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/tools/dependency-submission/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS lighthouse
WORKDIR /opt/audit-tools/lighthouse
COPY .config/tooling/lighthouse/package.json .config/tooling/lighthouse/pnpm-lock.yaml .config/tooling/lighthouse/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/audit-tools/lighthouse/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS pa11y
WORKDIR /opt/audit-tools/pa11y
COPY .config/tooling/pa11y/package.json .config/tooling/pa11y/pnpm-lock.yaml .config/tooling/pa11y/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/audit-tools/pa11y/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS pa11y-ci
WORKDIR /opt/audit-tools/pa11y-ci
COPY .config/tooling/pa11y-ci/package.json .config/tooling/pa11y-ci/pnpm-lock.yaml .config/tooling/pa11y-ci/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/audit-tools/pa11y-ci/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM audit-node AS renovate-validator
WORKDIR /opt/audit-tools/renovate-validator
COPY .config/tooling/renovate-validator/package.json .config/tooling/renovate-validator/pnpm-lock.yaml .config/tooling/renovate-validator/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=guesant-tooling-pnpm,target=/tool-cache,sharing=locked pnpm install --frozen-lockfile --store-dir /tool-cache
ENV PATH="/opt/audit-tools/renovate-validator/node_modules/.bin:${PATH}"
WORKDIR /workspace

FROM node-tools AS workspace-fast
COPY --from=yamllint /opt/python/.venv /opt/python/.venv
COPY --from=ast-grep /opt/tools/ast-grep /opt/tools/ast-grep
COPY --from=markdownlint /opt/tools/markdownlint /opt/tools/markdownlint
COPY --from=jscpd /opt/tools/jscpd /opt/tools/jscpd
COPY --from=eslint /opt/tools/eslint /opt/tools/eslint
COPY --from=prettier /opt/tools/prettier /opt/tools/prettier
COPY --from=knip /opt/tools/knip /opt/tools/knip
COPY --from=vitest /opt/tools/vitest /opt/tools/vitest
COPY --from=stylelint /opt/tools/stylelint /opt/tools/stylelint
COPY --from=typecheck /opt/tools/typecheck /opt/tools/typecheck
COPY --from=automation /opt/tools/automation /opt/tools/automation
COPY --from=dependency-submission /opt/tools/dependency-submission /opt/tools/dependency-submission
COPY .config/link-tool-modules.mjs /opt/link-tool-modules.mjs
RUN node /opt/link-tool-modules.mjs /workspace/.config/node_modules /opt/tools
COPY --from=shellcheck /bin/shellcheck /usr/local/bin/shellcheck
COPY --from=shfmt /bin/shfmt /usr/local/bin/shfmt
CMD ["sleep", "infinity"]

FROM yamllint AS semgrep
RUN uv sync --project /opt/python --locked --group audit --no-install-project

FROM workspace-fast AS workspace-audit
# renovate: datasource=deb registryUrl=https://deb.debian.org/debian-security?suite=bookworm-security&components=main
RUN apt-get update \
  && apt-get install --yes --no-install-recommends chromium=156.0.8078.79-1~deb12u1 g++=4:12.2.0-3 make=4.3-4.1 \
  && rm --recursive --force /var/lib/apt/lists/*
ENV TOOLING_PROFILE=audit
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY --from=lychee /usr/local/bin/lychee /usr/local/bin/lychee
COPY --from=osv-scanner /osv-scanner /usr/local/bin/osv-scanner
COPY --from=trivy /usr/local/bin/trivy /usr/local/bin/trivy
COPY --from=pa11y-ci /opt/audit-tools/pa11y-ci /opt/audit-tools/pa11y-ci
COPY --from=pa11y /opt/audit-tools/pa11y /opt/audit-tools/pa11y
COPY --from=renovate-validator /opt/audit-tools/renovate-validator /opt/audit-tools/renovate-validator
COPY --from=lighthouse /opt/audit-tools/lighthouse /opt/audit-tools/lighthouse
COPY --from=semgrep /opt/python/.venv /opt/python/.venv
RUN node /opt/link-tool-modules.mjs /workspace/.config/audit/node_modules /opt/audit-tools
ENV PATH="/workspace/.config/audit/node_modules/.bin:${PATH}"
