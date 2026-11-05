FROM rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667 AS actionlint
FROM ghcr.io/zizmorcore/zizmor:1.31.1@sha256:42d409dbb851d4c5d35a058cf042b828bea1e3f2884378c526eb0974780e18d9 AS zizmor
FROM hadolint/hadolint:v2.15.1@sha256:32dac94127fd60b7b7e3fbfc65e1383b9b5e25c9bfd7b8536de7a539fe68a12d AS hadolint
FROM zricethezav/gitleaks:v8.30.1@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f AS gitleaks
FROM ghcr.io/casey/just:1.59.0@sha256:014cbe6e6de678864004e2fd8b0405f77ce43b20b225e816feb330f2fb575c01 AS just
FROM ghcr.io/astral-sh/uv:0.13.6@sha256:af22a52f5eafef3d78e551599d405c02df61919d18028f0cea8eda93bc9986d0 AS uv
FROM lycheeverse/lychee:0.24.2-alpine@sha256:2255c0b916cc8fc4193f59a4549358a6bae0f7d4ea16b5e1dd4c3b2733c35504 AS lychee
FROM ghcr.io/google/osv-scanner:v2.5.1@sha256:8108ae94eadea5a02c9bec6e646909d5b790b44bd62d7f5b7f0b1d6d0ffc7734 AS osv-scanner
FROM aquasec/trivy:0.74.0@sha256:62b1e65e8869bc4b4c6aa4fa2b21595256c7c2f6018a9d9ad61caf87187c1969 AS trivy

FROM node:24.15.0-bookworm-slim@sha256:4e6b70dd6cbfc88c8157ba19aa3d9f9cce6ba4703576d55459e45efcbc9c5f5d AS workspace-fast
# renovate: datasource=deb registryUrl=https://deb.debian.org/debian?suite=bookworm&components=main
RUN apt-get update \
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
COPY .config/package.json .config/pnpm-lock.yaml .config/pnpm-workspace.yaml /opt/tooling/
COPY website/package.json website/pnpm-lock.yaml website/pnpm-workspace.yaml /opt/website/
RUN pnpm --dir /opt/tooling fetch --store-dir /pnpm/store \
  && pnpm --dir /opt/website fetch --store-dir /pnpm/store
COPY .config/python/pyproject.toml .config/python/uv.lock /opt/python/
RUN uv sync --project /opt/python --locked --no-group audit --no-install-project
WORKDIR /workspace
CMD ["sleep", "infinity"]

FROM workspace-fast AS workspace-audit
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
COPY --from=lychee /usr/local/bin/lychee /usr/local/bin/lychee
COPY --from=osv-scanner /osv-scanner /usr/local/bin/osv-scanner
COPY --from=trivy /usr/local/bin/trivy /usr/local/bin/trivy
COPY .config/audit/package.json .config/audit/pnpm-lock.yaml .config/audit/pnpm-workspace.yaml /opt/audit/
RUN pnpm --dir /opt/audit fetch --store-dir /pnpm/store \
  && uv sync --project /opt/python --locked --group audit --no-install-project
