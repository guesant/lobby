# Federação de conteúdo

O Blog e o Resume publicam índices JSON. O build do Lobby valida a versão do
contrato, os destinos e os campos públicos antes de usar os dados na busca e
nas seções. Os documentos editoriais continuam nas fontes. O visitante recebe
a saída estática gerada com os índices validados.

Em falhas de rede, o build pode recuperar um índice válido do cache. A data
de obtenção continua sendo a da última resposta válida. Sem uma entrada
válida, a geração falha para evitar a publicação de uma lista incompleta.

Em desenvolvimento, as variáveis `LOBBY_BLOG_FEED` e `LOBBY_RESUME_FEED`
podem apontar para arquivos gerados nos outros projetos. O Compose monta as
saídas como `/sources/blog` e `/sources/resume`. Gere esses arquivos com os
comandos Docker de cada fonte antes de iniciar o Lobby.

Continue em [Desenvolvimento e CI](../operacao/desenvolvimento-e-ci.md).
