# Kampive

Aplicativo mobile em Expo SDK 54, React Native, TypeScript, Expo Router e NativeWind 4. As sete telas do Google Stitch são a referência visual principal, preservando a marca Kampive. Os HTMLs e screenshots originais estão em `design_system/stitch`; as orientações complementares ficam em `design_system/spec-layout.md`.

## Executar

```sh
npm install
npm start
```

Use `npm run ios` / `npm run android` com um simulador ou dispositivo configurado. A prévia web está disponível com `npm run web`.

No Xcode 27, inicie um iPhone no Device Hub. O script `postinstall` aplica a compatibilidade com o Device Hub à CLI 54.0.27, baseada na correção oficial do Expo (PR #46757). Reinicie o servidor Expo após instalar dependências. Ao atualizar a CLI, revise/remova `scripts/patch-expo-device-hub.cjs`; o script recusa versões diferentes para evitar alterações indevidas.

## Telas

- Explorar: busca real por nome, cidade ou país; filtros por categoria, comodidade e ambiente natural; paginação.
- Países e Salvos: destinos por país e lista persistida de favoritos.
- Notificações: caixa de entrada da conta no banco, com paginação, filtros e marcação individual ou em lote. O contador vem do servidor. Não há entrega de push.
- Detalhes: galeria com área segura, comodidades, contatos, mapa por coordenadas e resumo de avaliações retornados pela API.
- Nova avaliação: nota de 1 a 5, comentário e até 3 fotos reais enviados à API para moderação. O perfil mostra o status de cada contribuição.
- Indicar camping: perfil do Instagram, link do Google Maps e nome do camping enviados para revisão da equipe, sem vínculo de propriedade.
- Sou proprietário: solicitação privada nos detalhes do camping; a gestão só é liberada após aprovação da equipe. Meus campings lista somente vínculos aprovados.
- A API requer a alteração manual de banco `kampive-api/docs/sql/campsite-community.sql`; o procedimento administrativo está em `kampive-api/docs/campsite-community.md`.
- Perfil: foto, nome, cidade/estado/país, apresentação e múltiplos estilos de viagem. Edição integrada e exclusão com senha e confirmação.
- Login e cadastro: integração com autenticação da API, sessão e proteção CSRF.

## Organização

- `src/app`: rotas do Expo Router.
- `src/components`: componentes compartilhados e formulários.
- `src/data/symbols.ts`: mapa visual dos ícones.
- `src/lib/store.tsx`: estado em memória dos favoritos e contador de notificações da API, isolado por conta.
- `src/theme/tokens.ts` e `tailwind.config.js`: tokens do design system.

## Dados reais

Campings, países, cidades, categorias, comodidades, preços, fotos, avaliações, perfil, favoritos e notificações vêm da API. Listas vazias e falhas de rede têm estados próprios, sem conteúdo fictício de fallback. Rótulos da interface, ícones, marca e os estilos de viagem definidos pelo contrato continuam locais.

O armazenamento antigo `kampive.layout.v1` não é mais lido nem gravado. Favoritos, comentários, perfil e notificações da demonstração não são importados para nenhuma conta, pois não têm autoria confiável. Favoritos reais agora exigem login e persistem no banco, inclusive entre dispositivos.

Login e cadastro usam e-mail/senha, sessão e CSRF. Controles demonstrativos de login social, SMS e recuperação foram removidos; esses serviços ainda não estão implementados. Moderação continua administrativa, sem painel no app. A central de notificações lê mensagens atribuídas à conta no banco; esta integração não cria mensagens promocionais nem implementa push.

As referências visuais originais permanecem em `design_system/stitch`. As fotos de demonstração e os ícones substituídos foram removidos de `assets`; `assets/stitch` mantém somente a fonte Material Symbols e sua licença. Avaliações aceitam comentários entre 50 e 1.000 caracteres e fotos JPEG/PNG de até 2 MiB e 16 megapixels por imagem, normalizadas no servidor para até 512 px. No cadastro de camping, cidade e endereço são digitados livremente; coordenadas e como chegar são opcionais.

## Verificações

```sh
npm run lint
npm run typecheck
npm test
npx expo install --check
npx expo export --platform android --platform ios --platform web
```

A exportação valida os bundles, não substitui teste em dispositivo. Permissões de localização, seletor de fotos, teclado e áreas seguras precisam de validação final em iOS/Android.

A API está em `https://localhost:8443`, disponibilizada pelo gateway do repositório irmão `kampive-infra`. Siga o README desse repositório para subir o Docker, exportar o certificado público da CA local e instalá-lo no simulador. Nunca desabilite a validação TLS. A chave privada da CA permanece no volume Docker e não deve ser compartilhada.

Para usar a API local, copie `.env.example` para `.env.local`, defina `EXPO_PUBLIC_API_URL=https://localhost:8443` e recarregue o app. Essa variável é pública: não coloque credenciais nela. Execute `npm start` e abra o app no simulador com o certificado instalado.

O cliente usa cookies de sessão com `credentials: include` e obtém um token CSRF atualizado antes de cada escrita. Escritas são serializadas e não são repetidas automaticamente. Credenciais, cookies e tokens não são gravados no armazenamento JavaScript do app. O backend configura o cookie como Secure e HttpOnly; não foi introduzido JWT ou JWE.

Países e continentes usam o catálogo real, com filtros e paginação. Um banco sem dados apresenta uma lista vazia. Cadastro exige os dois documentos legais vigentes publicados no banco (termos e privacidade), provisionados manualmente; sem eles o formulário não permite criar uma conta. Campings usam o catálogo real. Favoritos e notificações pertencem à conta autenticada; avaliações públicas incluem somente as aprovadas.

A conexão HTTPS e a consulta do catálogo foram verificadas no simulador iOS. Cadastro e login no simulador foram validados pelo responsável pelo projeto. Autenticação no navegador exige configuração própria de origem/CORS e cookies; o encaminhamento do frontend web não está configurado. Android e aparelhos físicos também exigem endereço acessível e confiança no certificado, ainda não configurados nesta etapa.

Testes do cliente HTTP:

```sh
npm run test:api
```

## Campings conectados à API

- Explorar consulta `/campsites` com paginação, busca com debounce e filtros combináveis por UUID. Apenas publicados aparecem. Catálogo vazio não é substituído por exemplos.
- Detalhes usa `/campsites/{uuid}` e apresenta somente informações reais. O selo de verificação depende da resposta do servidor; preços sem valor e avaliações sem nota têm estados próprios. Contatos são texto selecionável; somente links HTTPS válidos são abertos. O mapa usa as coordenadas cadastradas.
- Perfil → Meus campings lista `/users/me/campsites`. O formulário exige uma sessão, cria rascunhos e permite editar apenas `draft` e `rejected`. Enviar para análise salva antes de submeter; não publica automaticamente. Arquivar exige confirmação e remove o camping da busca pública.
- Categorias, cidades, comodidades, ambientes, contatos e moedas vêm dos catálogos da API. Devem ser provisionados manualmente no banco. Sem categorias o formulário não permite salvar; sem cidade, contato ou foto permite rascunho, mas não envio para análise.
- Fotos: até nove arquivos JPEG/PNG enviados por multipart, com seleção da capa. A API reduz o maior lado a 1920 pixels e salva JPEG com qualidade 70% em volume Docker; o banco armazena os caminhos.
- Favoritos usam `GET/PUT/DELETE /users/me/favorites`; as escritas só atualizam a interface após confirmação do servidor. Campings que deixaram de estar disponíveis podem ser removidos dos favoritos. Avaliações usam `/campsites/{uuid}/reviews`, `/review-options` e `/users/me/reviews`.
- Operações de escrita usam cookies e um token CSRF atualizado, incluindo PUT. Não há repetição automática. Se a conexão cair durante a criação, o formulário orienta consultar Meus campings antes de tentar outro cadastro, evitando duplicação silenciosa.

Validação automatizada: `npm run lint`, `npm run typecheck` e `npm run test:api`. Os testes incluem métodos/CSRF, filtros, conflitos de status, validação de rascunhos, envio para análise, fotos e decimais. A validação dos bundles não substitui um teste completo do formulário em dispositivo com os catálogos provisionados.

No perfil, **Cadastrar camping** abre o formulário completo para análise da equipe, sem vínculo automático. **Indicar camping** abre o formulário resumido. O atalho **Meus campings** lista os vínculos de propriedade aprovados. A indicação resumida permanece em `/campsite/suggest`. O cadastro completo exige também `kampive-api/docs/sql/campsite-registration.sql`.


## Perfil e exclusão de conta

O perfil usa `PUT /users/me` e a exclusão usa `DELETE /users/me`, ambos com sessão e CSRF.
Antes de atualizar a API, aplicar manualmente `kampive-api/docs/sql/user-profile.sql` depois de `campsite-community.sql`.
Cidade e estado vêm do catálogo geográfico; a API confere se a cidade pertence ao país selecionado.
Estilos aceitam seleção múltipla: barraca, motorhome, trailer e chalé.
Fotos de perfil são enviadas em base64 (JPEG/PNG até 2 MiB e 16 megapixels), normalizadas no servidor para até 512 px e persistidas no banco. As fotos das avaliações também são normalizadas e persistidas no banco.
Excluir conta exige a senha atual e a confirmação EXCLUIR. O servidor remove credenciais e dados pessoais do perfil, e os dados em memória do app são descartados após a confirmação do servidor. Contribuições e registros de aceite ficam vinculados a uma conta anonimizada. Não se confunde exclusão com logout.


## Explorar por estado e busca global

Ao abrir, Explorar consulta o estado da cidade cadastrada no perfil, usando o UUID da divisão administrativa. Sem estado disponível, mostra explicitamente todos os destinos; escolher um país substitui o filtro inicial do estado. Resultados sem texto são ordenados por média de avaliações publicadas (sem avaliação ao final), quantidade de avaliações e UUID.
A busca textual consulta todo o catálogo e não envia os filtros geográficos de estado/país. Categorias, comodidades e ambientes selecionados continuam ativos. A relevância prioriza correspondências exatas e prefixos de nome/cidade/país; avaliação desempata.
São 20 registros na primeira consulta (`page=0&size=20`), depois 10 (`page=2&size=10`, `page=3&size=10`, ...). A rolagem a 400 px do fim da seção dispara a próxima consulta, com indicador no rodapé. UUIDs repetidos são consolidados e falhas de paginação preservam os cards e permitem repetir a página. Não foram adicionados cache, virtualização, cursores ou índices geográficos.

## Validação com backend Docker

O app roda localmente e a API no Compose de `kampive-infra`. Reconstrua/recrie o serviço `api` depois de alterar o backend; não é necessário recriar o PostgreSQL. A integração de favoritos, notificações e avaliações utiliza as tabelas existentes do schema base e não exige DDL adicional. As alterações de schema anteriores listadas acima continuam sendo pré-requisitos.

Contratos e testes de persistência: `kampive-api/docs/community-data.md`. Os testes Docker usam PostgreSQL descartável e nunca inserem exemplos no banco de desenvolvimento.

## Minhas solicitações

Perfil → Minhas solicitações reúne indicações resumidas e pedidos de vínculo de proprietário, com paginação, data, situação e protocolo. Os detalhes mostram os dados enviados e a resposta pública da equipe; notas internas nunca são retornadas. Após enviar, o recibo permite acompanhar a solicitação. Em falha de conexão sem confirmação, há acesso à lista antes de tentar novo envio.

A central de notificações recebe um aviso por resultado de análise e permite abrir a solicitação. Indicação aceita pode ainda estar em preparação: o botão Ver camping só aparece quando o registro estiver publicado. Cadastros completos e avaliações não fazem parte desta lista.

Pré-requisito da API: aplicar manualmente `kampive-api/docs/sql/request-tracking.sql` antes da atualização. O procedimento e os contratos estão em `kampive-api/docs/request-tracking.md`. Não há push, notificações retroativas nem exposição de notas internas.

## Recuperação de senha

Login → Esqueci minha senha abre a solicitação por e-mail. A rota pública `/reset-password?token=...` permite definir e confirmar a senha; o sucesso limpa a conta local e volta ao login. Links inválidos/expirados/usados permitem solicitar outro. Respostas 401 das operações privadas também descartam a sessão local.

O backend possui tokens de uso único, validade de 30 minutos, fila persistente de e-mails e invalidação das sessões anteriores. Aplicar `kampive-api/docs/sql/password-recovery.sql` antes de atualizar a API. Provedor ainda não configurado: a solicitação mostra indisponibilidade e não simula envio. A confirmação de senha alterada fica na fila para o adapter de envio.

O scheme `kampive` foi declarado para futuras builds nativas; requer nova development build. No Expo Go, usar o formato `exp://HOST:8081/--/reset-password?token=...`. O domínio HTTPS e Universal Links/App Links ainda dependem da definição do domínio. Contratos, configuração e testes estão em `kampive-api/docs/password-recovery.md`.

### Recuperação no navegador local

Execute `npm run export:web:local` para gerar a versão servida pelo gateway Docker em `https://localhost:8443/forgot-password`. Reexporte após mudar o app e execute `docker compose up -d --no-deps --force-recreate gateway` em `kampive-infra` para remontar o diretório exportado. O teste usa as mesmas telas e a mesma API, com cookies HTTPS. Consulte `kampive-api/docs/password-recovery.md` para configurar a chave privada e ativar o envio. Abra os links no computador: localhost não é acessível pelo celular físico ou pelo proxy de imagens do Gmail.

## Idiomas

A interface oferece português, inglês, francês e espanhol. Em **Perfil → Idioma**, a opção
**Automático pelo país** usa o código ISO do país cadastrado. Países multilíngues consideram
as preferências do aparelho entre os idiomas suportados; sem país, vale o idioma do aparelho.
Países sem um idioma correspondente usam inglês. A seleção manual tem prioridade e é salva
com AsyncStorage por UUID de usuário neste dispositivo (não sincroniza entre dispositivos).

O catálogo está em `src/lib/i18n/messages.json`, com português como chave/base e traduções
`en`, `es` e `fr`. Use `useTranslation()` para textos e o `locale` retornado para datas e valores.
Parâmetros dinâmicos usam `{name}` e são passados separadamente, preservando o conteúdo do
usuário. Nomes e descrições de campings, avaliações, notificações e catálogos fornecidos pela
API continuam no idioma de origem. Documentos legais e e-mails também não são traduzidos
por esta camada da interface.

Validação de idiomas: `node --test tests/i18n.test.mjs`.
