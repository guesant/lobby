# Lobby

Meu site pessoal em [guesant.net](https://guesant.net/).

[![CI](https://img.shields.io/github/actions/workflow/status/guesant/lobby/ci.yml?branch=main&label=CI&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/guesant/lobby/actions/workflows/ci.yml)
[![Site](https://img.shields.io/badge/site-guesant.net-2563eb?style=for-the-badge&labelColor=0b1120&logo=firefoxbrowser&logoColor=white)](https://guesant.net)
[![Licença](https://img.shields.io/github/license/guesant/lobby?style=for-the-badge&labelColor=0b1120&logo=gnu&logoColor=white)](LICENSE)

[![Última execução do CI](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Frepos%2Fguesant%2Flobby%2Factions%2Fworkflows%2Fci.yml%2Fruns%3Fper_page%3D1&query=%24.workflow_runs%5B0%5D.updated_at&label=última%20execução%20do%20CI&style=flat-square&labelColor=0b1120&color=2563eb&logo=githubactions&logoColor=white)](https://github.com/guesant/lobby/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/guesant/lobby?label=OpenSSF%20Scorecard&style=flat-square&labelColor=0b1120&color=2563eb)](https://scorecard.dev/viewer/?uri=github.com/guesant/lobby)
[![Último commit](https://img.shields.io/github/last-commit/guesant/lobby/main?label=último%20commit&style=flat-square&labelColor=0b1120&color=b45309&logo=git&logoColor=white)](https://github.com/guesant/lobby/commits/main)
[![Commits por mês](https://img.shields.io/github/commit-activity/m/guesant/lobby?label=commits%2Fmês&style=flat-square&labelColor=0b1120&color=b45309&logo=git&logoColor=white)](https://github.com/guesant/lobby/graphs/commit-activity)
[![PRs abertas](https://img.shields.io/github/issues-pr/guesant/lobby?label=PRs%20abertas&style=flat-square&labelColor=0b1120&color=b45309&logo=github&logoColor=white)](https://github.com/guesant/lobby/pulls)
[![Issues abertas](https://img.shields.io/github/issues/guesant/lobby?label=issues%20abertas&style=flat-square&labelColor=0b1120&color=b45309&logo=github&logoColor=white)](https://github.com/guesant/lobby/issues)
[![Issues fechadas](https://img.shields.io/github/issues-closed/guesant/lobby?label=issues%20fechadas&style=flat-square&labelColor=0b1120&color=b45309&logo=github&logoColor=white)](https://github.com/guesant/lobby/issues?q=is%3Aissue+is%3Aclosed)
[![Forks](https://img.shields.io/github/forks/guesant/lobby?style=flat-square&labelColor=0b1120&color=b45309&logo=github&logoColor=white)](https://github.com/guesant/lobby/forks)
[![Feito no Brasil](https://img.shields.io/badge/feito_no-Brasil-009440?style=flat-square&labelColor=0b1120)](https://pt.wikipedia.org/wiki/Brasil)

- [Perfil em YAML](https://guesant.net/profile.yaml)
- [Aplicação](website/src/) e [conteúdo](website/src/data/)
- [Desenvolvimento e CI](docs/operacao/desenvolvimento-e-ci.md) e [ambiente Docker](.config/compose.yaml)
- [Configurações](.config/), [CI](.github/workflows/ci.yml) e [Scorecard](.github/workflows/scorecard.yml)

## Desenvolvimento Local

Requer Docker e Docker Compose.

```sh
git clone https://github.com/guesant/lobby.git
cd lobby
docker compose -f .config/compose.yaml run --build --rm --service-ports workspace just dev
```

Acesse [localhost:4173](http://localhost:4173/). As ferramentas rodam no container.

## Licença

Código sob [licença MIT](LICENSE). Consulte os [créditos e licenças dos assets](website/src/data/credits.yaml).
