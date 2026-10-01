import { stitchImages as image } from './stitch-images';
export type Campsite = {
  id: string;
  name: string;
  location: string;
  country: string;
  region: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  tags: string[];
  image: string;
  gallery: string[];
  description: string;
  amenities: string[];
  meta?: string;
  featured?: boolean;
};
export const campsites: Campsite[] = [
  {
    id: 'pedra-da-mina',
    name: 'Camping Refúgio dos Cânions',
    location: 'Praia Grande - SC',
    country: 'Brasil',
    region: 'Serra Geral',
    price: 85,
    rating: 4.9,
    reviews: 128,
    category: 'Montanha',
    tags: ['Montanha', 'Pet Friendly', 'Perto de você'],
    image: image.home[1],
    gallery: [image.home[1], image.detail[2], image.detail[3]],
    description: 'Um refúgio para descobrir a vida selvagem.',
    amenities: ['Fogueira permitida', 'Chuveiro quente', 'Pet Friendly'],
    meta: '12 km do centro',
    featured: true,
  },
  {
    id: 'rio-sereno',
    name: 'Camping Cachoeira dos Cristais',
    location: 'Alto Paraíso de Goiás - GO',
    country: 'Brasil',
    region: 'Chapada dos Veadeiros',
    price: 65,
    rating: 4.8,
    reviews: 94,
    category: 'Beira de Rio / Lago',
    tags: ['Beira de Rio / Lago', 'Com Wi-Fi', 'Perto de você'],
    image: image.home[2],
    gallery: [image.home[2], image.detail[7]],
    description: 'Águas cristalinas e natureza por todos os lados.',
    amenities: ['Banho natural', 'Pontos de energia', 'Wi-Fi Starlink'],
    meta: 'Acesso ao rio',
    featured: true,
  },
  {
    id: 'vale-estrelas',
    name: 'Eco Camping Pedra do Baú',
    location: 'São Bento do Sapucaí - SP',
    country: 'Brasil',
    region: 'Serra da Mantiqueira',
    price: 110,
    rating: 4.95,
    reviews: 210,
    category: 'Montanha',
    tags: ['Montanha', 'Motorhome', 'Perto de você'],
    image: image.home[3],
    gallery: [image.home[3], image.detail[6]],
    description: 'O seu próximo horizonte na Serra da Mantiqueira.',
    amenities: ['Vaga Motorhome', 'Cafeteria rústica', 'Trilha direta'],
    meta: 'Altitude 1.600m',
    featured: true,
  },
  {
    id: 'mirante-da-mantiqueira',
    name: 'Camping Mirante da Mantiqueira',
    location: 'Estrada da Pedra Rajada, km 4, Gonçalves - MG, Serra da Mantiqueira',
    country: 'Brasil',
    region: 'Serra da Mantiqueira',
    price: 75,
    rating: 4.8,
    reviews: 142,
    category: 'Montanha',
    tags: ['Montanha', 'Com Wi-Fi', 'Pet Friendly'],
    image: image.detail[0],
    gallery: [
      image.detail[0],
      image.detail[2],
      image.detail[3],
      image.detail[4],
      image.detail[6],
      image.detail[7],
      image.review[0],
      image.review[1],
    ],
    description: 'Espaço preparado para barracas de teto, trailers leves e camping tradicional',
    amenities: [
      'Água Potável',
      'Ponto de Energia',
      'Wi-Fi via Satélite',
      'Ducha Quente',
      'Aceita Pets',
      'Cozinha Comum',
      'Área de Fogueira',
      'Estacionamento',
    ],
  },
  {
    id: 'patagonia',
    name: 'Patagonia Basecamp',
    location: 'El Chaltén · Argentina',
    country: 'Argentina',
    region: 'Patagônia',
    price: 120,
    rating: 4.9,
    reviews: 56,
    category: 'Montanha',
    tags: ['Montanha'],
    image: image.home[8],
    gallery: [image.home[8]],
    description: 'Seu ponto de partida na Patagônia.',
    amenities: ['Banho natural', 'Trilha direta'],
  },
];
export const countries = [
  {
    name: 'Canadá',
    flag: '🇨🇦',
    continent: 'América do Norte',
    region: 'América do Norte',
    count: 384,
    image: image.home[4],
  },
  {
    name: 'Noruega',
    flag: '🇳🇴',
    continent: 'Europa',
    region: 'Escandinávia',
    count: 219,
    image: image.home[5],
  },
  {
    name: 'Portugal',
    flag: '🇵🇹',
    continent: 'Europa',
    region: 'Europa',
    count: 178,
    image: image.home[6],
  },
  {
    name: 'Chile',
    flag: '🇨🇱',
    continent: 'América do Sul',
    region: 'América do Sul',
    count: 145,
    image: image.home[7],
  },
  {
    name: 'Argentina',
    flag: '🇦🇷',
    continent: 'América do Sul',
    region: 'América do Sul',
    count: 162,
    image: image.home[8],
  },
];
export const filters = [
  'Perto de você',
  'Beira de Rio / Lago',
  'Montanha',
  'Pet Friendly',
  'Motorhome',
  'Com Wi-Fi',
];
export const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export function filterCampsites(query: string, category = 'Todos', country = '') {
  const search = normalize(query.trim());
  return campsites.filter(
    (c) =>
      (!search || normalize(`${c.name} ${c.location} ${c.region}`).includes(search)) &&
      (category === 'Todos' || c.tags.includes(category)) &&
      (!country || c.country === country),
  );
}
