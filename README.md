# Kampive

Protótipo mobile em Expo SDK 54, React Native, TypeScript, Expo Router e NativeWind 4. As sete telas do Google Stitch são a referência visual principal, preservando a marca Kampive. Os HTMLs e screenshots originais estão em `design_system/stitch`; as orientações complementares ficam em `design_system/spec-layout.md`.

## Executar

```sh
npm install
npm start
```

Use `npm run ios` / `npm run android` com um simulador ou dispositivo configurado. A prévia web está disponível com `npm run web`.

No Xcode 27, inicie um iPhone no Device Hub. O script `postinstall` aplica a compatibilidade com o Device Hub à CLI 54.0.27, baseada na correção oficial do Expo (PR #46757). Reinicie o servidor Expo após instalar dependências. Ao atualizar a CLI, revise/remova `scripts/patch-expo-device-hub.cjs`; o script recusa versões diferentes para evitar alterações indevidas.

## Telas

- Explorar: busca por nome, cidade, região ou país; filtros combináveis; favoritos.
- Países e Salvos: destinos por país e lista persistida de favoritos.
- Notificações: central demonstrativa com contador de não lidas, filtros por leitura, marcação individual e em lote. O estado de leitura é persistido no dispositivo; não há envio ou recebimento de push conectado.
- Detalhes: galeria expansível, comodidades, contatos demonstrativos, mapa da região e avaliações.
- Nova avaliação: nota de 1 a 5, comentário e até 3 fotos.
- Cadastrar camping: categoria, localização, contatos obrigatórios, comodidades e fotos.
- Perfil: consulta dos dados da conta autenticada e logout. Edição depende dos próximos endpoints.
- Login e cadastro: integração com autenticação da API, sessão e proteção CSRF.

## Organização

- `src/app`: rotas do Expo Router.
- `src/components`: componentes compartilhados e formulários.
- `src/data/campsites.ts`: catálogo fictício e busca.
- `src/lib/store.tsx`: estado local persistido com AsyncStorage.
- `src/theme/tokens.ts` e `tailwind.config.js`: tokens do design system.

## Escopo do protótipo

Login e cadastro utilizam a API. Senhas não são persistidas pelo app. Login social, SMS, recuperação de senha, contatos oficiais, publicação de avaliações e curadoria aguardam integração com backend.

Favoritos, avaliações, rascunhos e leitura de notificações continuam demonstrativos e locais ao dispositivo. As fotos selecionadas são URIs locais (ou temporárias na web), não uploads permanentes. O perfil autenticado vem da API; a sessão é administrada pelo servidor.

As imagens do Stitch são empacotadas localmente em `assets/stitch`, com suas URLs de origem em `sources.json`. A fonte Material Symbols tem licença incluída na mesma pasta. Nomes, preços, notas e verificações são dados demonstrativos; fotos dos formulários são exemplos removíveis. Avaliações aceitam comentários entre 50 e 1.000 caracteres. A localização é solicitada somente ao tocar em “Usar minha localização atual”; sempre é possível digitar o endereço.

## Verificações

```sh
npm run lint
npm run typecheck
npx expo install --check
npx expo export --platform android --platform ios --platform web
```

A exportação valida os bundles, não substitui teste em dispositivo. Permissões de localização, seletor de fotos, teclado e áreas seguras precisam de validação final em iOS/Android.

## API HTTPS local e simulador iOS

A API está em `https://localhost:8443`, disponibilizada pelo gateway do repositório irmão `kampive-infra`. Siga o README desse repositório para subir o Docker, exportar o certificado público da CA local e instalá-lo no simulador. Nunca desabilite a validação TLS. A chave privada da CA permanece no volume Docker e não deve ser compartilhada.

A configuração padrão já usa esse endereço. Para alterá-lo, copie `.env.example` para `.env.local`, ajuste `EXPO_PUBLIC_API_URL` e reinicie o Expo. Essa variável é pública: não coloque credenciais nela. Execute `npm start` e abra o app no simulador com o certificado instalado.

O cliente usa cookies de sessão com `credentials: include` e obtém um token CSRF atualizado antes de cada escrita. Escritas são serializadas e não são repetidas automaticamente. Credenciais, cookies e tokens não são gravados no AsyncStorage. O backend configura o cookie como Secure e HttpOnly; não foi introduzido JWT ou JWE.

Países e continentes usam o catálogo real, com filtros e paginação. Um banco sem dados apresenta uma lista vazia. Cadastro exige os dois documentos legais vigentes publicados no banco (termos e privacidade), provisionados manualmente; sem eles o formulário não permite criar uma conta. Campings e os demais módulos ainda não integrados continuam identificados como demonstração.

A conexão HTTPS e a consulta do catálogo foram verificadas no simulador iOS. O fluxo completo de login com cookies ainda precisa de validação em dispositivo com uma conta e documentos legais de teste. Autenticação no navegador exige configuração própria de origem/CORS e cookies; o encaminhamento do frontend web não está configurado. Android e aparelhos físicos também exigem endereço acessível e confiança no certificado, ainda não configurados nesta etapa.

Testes do cliente HTTP:

```sh
npm run test:api
```
