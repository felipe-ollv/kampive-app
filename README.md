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
- Perfil: avaliações locais, favoritos, espaços, edição do nome e preferência de notificações.
- Login e cadastro: formulários e navegação demonstrativos, sem autenticação real.

## Organização

- `src/app`: rotas do Expo Router.
- `src/components`: componentes compartilhados e formulários.
- `src/data/campsites.ts`: catálogo fictício e busca.
- `src/lib/store.tsx`: estado local persistido com AsyncStorage.
- `src/theme/tokens.ts` e `tailwind.config.js`: tokens do design system.

## Escopo do protótipo

Nenhuma conta é criada e nenhuma senha é armazenada. Login social, SMS, recuperação de senha, contatos oficiais, publicação de avaliações e curadoria aguardam integração com backend. Os fluxos explicam esse estado ao usuário.

Favoritos, perfil, avaliações, rascunhos e preferência de notificações ficam apenas neste dispositivo. As fotos selecionadas são URIs locais (ou temporárias na web), não uploads permanentes. A sessão de demonstração dura apenas enquanto o app está aberto; “Lembrar de mim” é ilustrativo.

As imagens do Stitch são empacotadas localmente em `assets/stitch`, com suas URLs de origem em `sources.json`. A fonte Material Symbols tem licença incluída na mesma pasta. Nomes, preços, notas e verificações são dados demonstrativos; fotos dos formulários são exemplos removíveis. Avaliações aceitam comentários entre 50 e 1.000 caracteres. A localização é solicitada somente ao tocar em “Usar minha localização atual”; sempre é possível digitar o endereço.

## Verificações

```sh
npm run lint
npm run typecheck
npx expo install --check
npx expo export --platform android --platform ios --platform web
```

A exportação valida os bundles, não substitui teste em dispositivo. Permissões de localização, seletor de fotos, teclado e áreas seguras precisam de validação final em iOS/Android.
