Design System & Especificação de Layout: Kampive (Wilderness Expedition)



Instruções para a IA: Este documento contém todos os design tokens, regras visuais, hierarquia tipográfica, layout mobile e especificações completas de tela para implementar o aplicativo mobile Kampive em React Native com Expo (Expo Router + NativeWind / Tailwind CSS).



1. Identidade & Filosofia Visual





Tema: Wilderness Expedition (Aventura ao ar livre, campings, montanhismo, estética funcional e autêntica).



Sensação do Produto: Acolhedor, robusto, conectado à natureza e direto ao ponto. Fundo off-white calmo, verde floresta profundo para ênfase institucional e terracota vibrante para chamadas de ação primárias (CTAs).



Target: Mobile portrait (~390px - 412px de largura).



2. Design Tokens (Paleta de Cores & Variáveis)

{
  "colors": {
    "primary": {
      "DEFAULT": "#1e3a2f",
      "dark": "#142921",
      "light": "#2d5444",
      "container": "#e1e9e2",
      "on_container": "#0c2018"
    },
    "secondary": {
      "DEFAULT": "#c04e18",
      "hover": "#a63e10",
      "container": "#ffdbce",
      "on_secondary": "#ffffff"
    },
    "surface": {
      "DEFAULT": "#fbf9f4",
      "container_low": "#f5f3ee",
      "container": "#efede8",
      "container_high": "#e9e7e1",
      "card": "#ffffff"
    },
    "text": {
      "main": "#111c16",
      "variant": "#49574d",
      "muted": "#758378",
      "inverse": "#fbf9f4"
    },
    "status": {
      "verified_bg": "#142921",
      "verified_text": "#4ade80",
      "warning": "#eab308",
      "error": "#dc2626"
    },
    "border": {
      "subtle": "#e6e3dc",
      "focus": "#1e3a2f"
    }
  },
  "radii": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "full": "9999px"
  },
  "shadows": {
    "card": "0 2px 8px rgba(17, 28, 22, 0.05)",
    "elevated": "0 6px 16px rgba(17, 28, 22, 0.08)",
    "docked_bottom": "0 -4px 20px rgba(17, 28, 22, 0.07)"
  }
}



3. Tipografia (Plus Jakarta Sans)





Família Padrão: Plus Jakarta Sans, sans-serif.



Hierarquia:





Display / Hero Headline: text-2xl font-extrabold tracking-tight text-[#111c16] (24px - 28px).



Section Titles (H2): text-lg font-bold text-[#111c16] (18px - 20px).



Card Titles (H3): text-base font-bold text-[#111c16] (16px).



Body / Parágrafos: text-sm font-normal leading-relaxed text-[#49574d] (14px).



Labels, Badges e Metadados: text-xs font-semibold text-[#49574d] (11px - 12px).



Badges de Pílula: text-[11px] font-bold uppercase tracking-wider.



4. Componentes Globais Compartilhados

4.1 Top App Bar





Altura: 56px - 64px.



Estrutura: Botão voltar circular com fundo sutil (bg-[#f5f3ee]), logotipo centralizado "Kampive" acompanhado de ícone de bússola (explore), e badge de status/avatar no canto direito.



Fundo: #fbf9f4 com leve divisão de borda ou sombra sutil.

4.2 Bottom Navigation Bar (Tab Bar)





Posição: Fixa inferior (fixed bottom-0 left-0 w-full), altura ~64px + safe area padding.



Fundo: #fbf9f4 ou #ffffff com sombra shadow-[0_-4px_20px_rgba(17,28,22,0.07)].



4 Destinos:





Explorar (Ícone: barraca de camping / terrain) - Ativo



Países (Ícone: globo / public)



Salvos (Ícone: coração / favorite_border)



Perfil (Ícone: avatar / person)



Estilo Ativo: Ícone e rótulo em terracota (#c04e18) ou verde floresta (#1e3a2f) com indicador em negrito.



Estilo Inativo: Ícone e rótulo em tom atenuado (#758378).

4.3 Botões & Controles





Botão Primário (CTA Principal):





Classes: bg-[#c04e18] active:bg-[#a63e10] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm



Botão Secundário / Outline:





Classes: bg-transparent border border-[#1e3a2f] text-[#1e3a2f] font-semibold py-3 px-5 rounded-xl



Inputs & Textareas:





Fundo #f5f3ee com borda sutil #e6e3dc, raio de 12px (rounded-xl), texto em #111c16, placeholder em #758378, padding interno p-3.5 e ícone decorativo à esquerda.



Chips de Amenidades:





Fundo #f5f3ee, texto #1e3a2f, raio rounded-full ou rounded-xl, ícone no início. Estado ativo: bg-[#1e3a2f] text-white.



5. Especificação Detalhada das 7 Telas

📱 1. Login (app/(auth)/login.tsx)





Cabeçalho: Botão de voltar, logo Kampive com badge "● Online".



Badge: Pílula superior "⚠️ Acesso ao Acampamento" em fundo suave.



Título & Subtítulo: "Prepare sua mochila e entre na sua conta" / "Acesse seus refúgios salvos, acompanhe suas avaliações e explore campings pelo mundo."



Campos:





E-mail com ícone de envelope (seu.email@exemplo.com).



Senha com ícone de cadeado e botão toggle de visualização (olho aberto/fechado).



Ações:





Checkbox "Lembrar de mim" e link "Esqueceu a senha?".



Botão principal: "Entrar no Kampive →" (Terracota #c04e18).



Divisor "ou continue com".



Botões sociais: Google e Apple.



Opção alternativa: "Entrar com código via SMS / Sinal de Trilha".



Rodapé: Link para criar conta e selo de segurança com criptografia.



📱 2. Cadastro de Usuário (app/(auth)/register.tsx)





Badge: "⛺ Passaporte Outdoor".



Título: "Junte-se à comunidade de exploradores selvagens".



Foto de Perfil: Círculo pontilhado para upload com ícone de câmera e tag "Adicionar Foto de Perfil (Opcional)".



Campos:





Nome Completo (ex: Lucas Silveira).



E-mail.



Senha com dica: "Use letras, números e símbolos para segurança em trilhas remotas".



País de Origem / Residência: Seletor com bandeira (Brasil 🇧🇷) e dropdown.



Perfil Outdoor (Cards de Seleção Rápida):





Iniciante: Campings estruturados.



Selvagem: Mochilão e trilhas (Destaque selecionado: fundo #1e3a2f, texto branco).



Vanlife: Motorhome & overland.



Compliance: Checkbox concordando com Termos de Uso e Diretrizes de Turismo Regenerativo (Leave No Trace).



Botão CTA: "Criar Minha Conta →".



Social & Rodapé: Social login e link de redirecionamento para Login.



📱 3. Explorar Campings - Home (app/(tabs)/index.tsx)





Top Bar: Logotipo Kampive, saudação ao explorador e avatar de perfil com chapéu de trilha.



Barra de Pesquisa: Input com busca rápida por nome de camping, cidade ou país ("Buscar refúgios, campings e trilhas...").



Filtros Rápidos (Chips Horizontais): Todos, Na Floresta, Beira-Rio, Montanha, Glamping, Pet Friendly.



Banner de Curadoria: Card em destaque "Espaço para seu Acampamento? Cadastre seu camping" direcionando para a rota de cadastro de camping.



Feed de Campings (Cards Verticais):





Imagem do camping em 16:9 com badge flutuante "Verificado Online" e badge de valor da diária (R$ 85 /noite).



Título do local, localização com pin (cidade, estado, país).



Avaliação média com estrela (ex: ★ 4.9 (42 avaliações)).



Tags de infraestrutura (Fogueira permitida, Banheiro, Wi-Fi via Satélite).



Navegação: Docked Bottom Navigation Bar.



📱 4. Detalhes do Camping & Redes (app/campsite/[id].tsx)





Hero Image: Galeria com foto principal expansível e indicador de imagens (1/6).



Header Flutuante: Botão voltar transparente e botão salvar/favoritar (coração).



Informações Principais:





Nome do Camping (ex: "Refúgio Pedra da Mina").



Localização com link para abrir no Google Maps / Waze.



Preço por diária e status de reserva.



Presença Digital & Contatos Oficiais (Cards clicáveis):





Instagram oficial do camping (@nomedocamping).



WhatsApp direto para confirmação de vagas.



Website oficial ou linktree verificado.



Infraestrutura Completa (Grid de Ícones): Cozinha comunitária, pontos de energia, banho quente, área para motorhome, trilhas guiadas.



Seção de Avaliações Comunitárias: Resumo de notas e botão "Avaliar este camping".



📱 5. Nova Avaliação do Camping (app/campsite/[id]/review.tsx)





Título da Tela: "Nova Avaliação do Camping".



Cabeçalho de Identificação: Mini card mostrando o camping que está sendo avaliado.



Avaliação por Estrelas: Seletor interativo de 1 a 5 estrelas grandes com feedback textual (ex: "Experiência Incrível!").



Área de Texto: Input multilinha para comentários sinceros sobre água, segurança, receptividade e condições do terreno.



Upload de Fotos (Regra estrita: Máximo 3 imagens):





3 slots visuais quadrados com ícone de adição (+ Foto 1, + Foto 2, + Foto 3).



Contador dinâmico: "Adicionadas: 0 de 3 fotos permitidas".



Botão CTA: "Publicar Avaliação na Comunidade" em terracota #c04e18.



📱 6. Cadastrar Meu Espaço de Camping (app/campsite/create.tsx)





Objetivo: Permitir que donos de propriedades ou campistas indiquem e cadastrem novos espaços.



Campos do Formulário:





Nome comercial do espaço / camping.



Categoria: Camping Rústico, Parque de Motorhome, Glamping, Área Selvagem.



Endereço / Coordenadas GPS (com botão "Usar minha localização atual").



Presença Digital Obrigatória: Links do Instagram, Google Maps e WhatsApp.



Seleção de Comodidades (Checklist com fogueira, eletricidade, água potável, etc.).



Upload de foto de capa e fotos do local.



Selo de Moderação: Aviso informando que a curadoria do Kampive avalia a autenticidade dos links digitais em até 24 horas antes de publicar.



Botão CTA: "Enviar Camping para Curadoria".



📱 7. Perfil & Minhas Avaliações (app/(tabs)/profile.tsx)





Header do Usuário:





Foto de perfil circular, nome do aventureiro, nível da comunidade ("Explorador Veterano - Nível 4").



Contador de conquistas: 14 Campings visitados, 8 Avaliações feitas, 2 Espaços cadastrados.



Abas Internas (Segmented Control):





Minhas Avaliações (Lista de avaliações enviadas com as fotos e notas dadas).



Campings Salvos (Favoritos para futuras expedições).



Meus Espaços (Campings cadastrados pelo usuário e status de aprovação).



Configurações e Segurança: Botões de edição de perfil, preferências de notificação e botão de logout.