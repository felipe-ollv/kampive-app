export type AppNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
};

// Conteúdo demonstrativo enquanto a central não está conectada ao backend.
export const initialNotifications: AppNotification[] = [
  {
    id: 'welcome',
    title: 'Sua próxima aventura começa aqui',
    message:
      'Boas-vindas ao Kampive! Descubra campings, salve seus refúgios favoritos e compartilhe suas experiências.',
    date: '2026-10-02T12:00:00Z',
    read: false,
  },
  {
    id: 'explore-countries',
    title: 'Explore além das fronteiras',
    message: 'Na aba Países, escolha um continente e encontre inspiração para sua próxima viagem.',
    date: '2026-10-01T18:00:00Z',
    read: false,
  },
  {
    id: 'save-campsites',
    title: 'Seus refúgios em um só lugar',
    message: 'Toque no coração de um camping para encontrá-lo depois na aba Salvos.',
    date: '2026-10-01T12:00:00Z',
    read: true,
  },
];
