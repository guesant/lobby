# Lobby

Meu site pessoal em [guesant.net](https://guesant.net/).

[![CI](https://github.com/guesant/lobby/actions/workflows/ci.yml/badge.svg)](https://github.com/guesant/lobby/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/guesant/lobby/badge)](https://scorecard.dev/viewer/?uri=github.com/guesant/lobby)
[![Licença](https://img.shields.io/github/license/guesant/lobby)](LICENSE)

- [Aplicação](website/src/) e [conteúdo](website/src/data/)
- [Comandos](justfile) e [ambiente Docker](.config/compose.yaml)
- [Configurações](.config/), [CI](.github/workflows/ci.yml) e [Scorecard](.github/workflows/scorecard.yml)

## Desenvolvimento Local

Requer Git, Docker e Docker Compose.

```sh
git clone https://github.com/guesant/lobby.git
cd lobby
docker compose --file .config/compose.yaml run --rm --build --service-ports workspace just dev
```

Acesse [localhost:4173](http://localhost:4173/). As ferramentas rodam no container.

## Licença

Código sob [licença MIT](LICENSE). Consulte os [créditos e licenças dos assets](website/src/data/credits.yaml).
