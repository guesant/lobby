# Desenvolvimento e CI

A imagem `workspace-fast` reúne as ferramentas para desenvolver, verificar e
construir o site. A imagem `workspace-audit` acrescenta scanners, Chromium e
as dependências da auditoria manual. Execute o Just no host, a partir da raiz.

```sh
just dev
just ci
just check
```

As receitas chamam o Docker Compose. No GitHub Actions, os jobs usam o mesmo
script de entrada para preparar as dependências e executar as tarefas no
container. A formatação do Justfile é verificada com o Just no runner.

O workflow `ci.yml` executa o gate rápido e o build em pull requests e pushes.
Em `main`, a publicação usa o artefato da revisão validada. A operação manual
`audit` executa os scanners e as verificações de navegador e Lighthouse. O
Scorecard tem workflow manual próprio, com a action por SHA e a imagem interna
`v2.5.0` controlada pela action.

Confira o job que produziu o relatório antes de interpretar um resultado. O
gate rápido e a auditoria usam conjuntos de ferramentas diferentes. Para
reproduzir um achado, rode o mesmo target na revisão registrada no workflow.

O snapshot Debian usado pelos targets fica no argumento `DEBIAN_SNAPSHOT`
do Dockerfile. Ao atualizar uma versão de pacote, ajuste o snapshot quando
necessário e valide os targets rápido e de auditoria. APT verifica as
assinaturas do arquivo mesmo quando a data de validade do índice arquivado
já passou.

Os valores interpolados nos preloads e no sitemap passam por `encodeXML`
antes de compor o HTML e XML. A entrada do fuzz test usa texto de ataque,
construído sem uma template literal que pareça injetar HTML.

Continue em [Federação de conteúdo](../arquitetura/federacao.md).

Os estágios npm instalam cada ferramenta com o lockfile de
`.config/tooling/<ferramenta>`. O Docker reutiliza o cache de downloads entre
estágios. A imagem de qualidade reúne os executáveis desses estágios.
Os plugins do ESLint e as dependências do Vitest acompanham seus respectivos
executores.

A imagem da ferramenta pode ser executada pelo Compose. Por exemplo:

```sh
docker compose -f .config/compose.yaml run --build --rm actionlint
docker compose -f .config/compose.yaml run --build --rm scorecard
docker compose -f .config/compose.yaml run --build --rm renovate --platform=local --dry-run=extract
```

O Scorecard local verifica o checkout. O workflow oficial separado publica
o resultado para o badge. O Dependency Review compara as revisões de cada
PR pelo Dependency Graph do GitHub.

A auditoria gera CycloneDX para aplicação, automação, auditoria e cada
lockfile isolado. O job de submissão usa um correlator por lockfile.
