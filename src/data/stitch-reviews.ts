import { stitchImages as images } from './stitch-images';
export const communityReviews = [
  {
    name: 'Camila Rocha',
    avatar: images.detail[1],
    when: 'Há 3 dias',
    equipment: 'Barraca de chão',
    rating: 5,
    text: 'O nascer do sol daqui compensa cada curva de serra! A estrutura é surpreendentemente limpa, chuveiro super quente no fim de tarde gelado da Mantiqueira e anfitriões acolhedores. O silêncio noturno é surreal. Recomendo levar lanterna de cabeça para as trilhas até o mirante superior.',
    photos: images.detail.slice(2, 5),
  },
  {
    name: 'Lucas Brandão',
    avatar: images.detail[5],
    when: 'Há 1 semana',
    equipment: 'Rooftop Camper (4x4)',
    rating: 4,
    text: 'Platôs muito bem nivelados com pontos de tomada 220V funcionando estável para manter a geladeira da van ligada. A subida final exige carro com boa tração em dias úmidos, mas vale 100% a pena. Nosso border collie foi muito bem recebido.',
    photos: images.detail.slice(6, 8),
  },
];
export const profileReviews = [
  {
    name: 'Camping Vale das Araucárias',
    location: 'Urubici, SC',
    date: '14 de Outubro, 2024',
    rating: '5.0',
    verdict: 'Excelente',
    text: '“Estrutura impecável com tomadas 220V bem distribuídas para barracas e trailers. A vista da nascente do sol entre as araucárias é surreal. Banheiros com água quente potente e área comunitária de fogueira fantástica.”',
    photos: images.profile.slice(2, 5),
  },
  {
    name: 'Eco Camping Cantinho da Serra',
    location: 'Campos do Jordão, SP',
    date: '02 de Agosto, 2024',
    rating: '4.8',
    verdict: 'Muito bom',
    text: '“Trilhas autoguiadas direto do terreno e cachoeira particular a 10 minutos de caminhada. Muito silencioso durante a noite, os proprietários são extremamente acolhedores. Sinal de celular é fraco, mas há Starlink na recepção.”',
    photos: images.profile.slice(5, 7),
  },
];
