import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Share, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  C,
  CTA,
  Dock,
  Heading,
  Pill,
  RoundButton,
  SIcon,
  cardShadow,
  type SymbolName,
} from '../../../components/stitch';
import { Empty, Photo, T } from '../../../components/ui';
import { Dialog } from '../../../components/forms';
import { campsites } from '../../../data/campsites';
import { communityReviews } from '../../../data/stitch-reviews';
import { useStore } from '../../../lib/store';
const amenities: { title: string; text: string; icon: SymbolName }[] = [
  { title: 'Água Potável', text: 'Mina nativa tratada', icon: 'water_drop' },
  { title: 'Ponto de Energia', text: '220V / 110V nos platôs', icon: 'power' },
  { title: 'Wi-Fi', text: 'Quiosques e sede', icon: 'wifi' },
  { title: 'Ducha Quente', text: 'Aquecedor a gás 24h', icon: 'shower' },
  { title: 'Aceita Pets', text: 'Pet friendly com guia', icon: 'pets' },
  { title: 'Cozinha Comum', text: 'Fogão, pia e geladeira', icon: 'skillet' },
  { title: 'Área de Fogueira', text: 'Pit fire demarcado', icon: 'local_fire_department' },
  { title: 'Estacionamento', text: 'Próximo aos platôs', icon: 'directions_car' },
];
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = campsites.find((c) => c.id === id);
  const { saved, toggleSaved, reviews, profile } = useStore();
  const [index, setIndex] = useState(0);
  const [gallery, setGallery] = useState(false);
  const [dialog, setDialog] = useState('');
  if (!c)
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <Empty
          title="Camping não encontrado"
          text="Volte para explorar os destinos disponíveis."
          action={() => router.replace('/')}
        />
      </SafeAreaView>
    );
  async function map() {
    try {
      await Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c!.location)}`,
      );
    } catch {
      setDialog('Não foi possível abrir o mapa.');
    }
  }
  async function share() {
    try {
      await Share.share({
        message: `${c!.name} — ${c!.location}. Descubra este refúgio no Kampive.`,
      });
    } catch {
      setDialog('Não foi possível compartilhar neste dispositivo.');
    }
  }
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-surface">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 56 }}
      >
        <View style={{ height: 380 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ampliar galeria"
            onPress={() => setGallery(true)}
            className="h-full"
          >
            <Photo uri={c.gallery[index]} className="h-full w-full" />
          </Pressable>
          <LinearGradient
            pointerEvents="none"
            colors={['#07241a66', 'transparent', '#07241acc']}
            style={{ position: 'absolute', inset: 0 }}
          />
          <View className="absolute inset-x-4 top-4 flex-row justify-between">
            <RoundButton
              icon="arrow_back"
              label="Voltar"
              background="#ffffffee"
              size={48}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            />
            <View className="flex-row gap-2">
              <RoundButton
                icon="share"
                label="Compartilhar"
                background="#ffffffee"
                size={48}
                onPress={share}
              />
              <RoundButton
                icon="favorite"
                label={saved.includes(c.id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                background="#ffffffee"
                color={C.secondary}
                size={48}
                onPress={() => toggleSaved(c.id)}
              />
            </View>
          </View>
          <View className="absolute inset-x-4 bottom-10 flex-row justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Próxima foto"
              onPress={() => setIndex((index + 1) % c.gallery.length)}
            >
              <Pill icon="photo_camera" color="#fff" background="#07241ab3">
                {index + 1}/{c.gallery.length} Fotos
              </Pill>
            </Pressable>
            <Pill icon="partly_cloudy_day" color={C.mint} background="#1e3a2fcc">
              19°C Mantiqueira
            </Pill>
          </View>
        </View>
        <View
          className="mx-4 -mt-6 rounded-xl border border-line bg-surface p-5"
          style={cardShadow}
        >
          <View className="gap-3 border-b border-line pb-6">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <View className="flex-row items-center gap-1 rounded-full bg-[#0b3c2a] px-2.5 py-1">
                <SIcon name="verified" size={12} color="#78a78f" />
                <T className="font-bold text-[10px] leading-3 uppercase tracking-wider text-[#fff]">
                  Verificado pela Kampive
                </T>
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
                <SIcon name="star" size={16} color={C.secondary} />
                <T className="font-semibold text-lg text-primary">{c.rating}</T>
                <T className="text-xs text-ink-variant">({c.reviews} avaliações)</T>
              </View>
            </View>
            <T
              accessibilityRole="header"
              className="font-bold text-[20px] leading-[30px] tracking-tight text-primary"
            >
              {c.name}
            </T>
            <View className="flex-row items-center gap-1.5 pt-1">
              <SIcon name="location_on" color={C.secondary} />
              <T className="flex-1 text-sm leading-5 text-ink-variant">{c.location}</T>
            </View>
            <Pressable accessibilityRole="button" onPress={map} className="self-start">
              <Pill icon="map">Ver no mapa</Pill>
            </Pressable>
          </View>
          <View className="gap-3 border-b border-line py-6">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Heading icon="hub">Digital & Contato</Heading>
              </View>
              <T className="w-20 font-bold text-[10px] leading-3 text-ink-variant">
                Canais Verificados
              </T>
            </View>
            {(
              [
                {
                  title: 'WhatsApp Reservas',
                  text: 'Atendimento rápido',
                  icon: 'chat',
                  bg: C.forest,
                  color: C.mint,
                },
                {
                  title: 'Instagram',
                  text: '@campingmirante...',
                  icon: 'camera_alt',
                  bg: C.peach,
                  color: '#370e00',
                },
                {
                  title: 'Site Oficial',
                  text: 'Tarifário & Regras',
                  icon: 'language',
                  bg: C.high,
                  color: C.primary,
                },
                {
                  title: 'Google Maps',
                  text: 'Rota GPS direta',
                  icon: 'near_me',
                  bg: C.high,
                  color: C.secondary,
                },
              ] as { title: string; text: string; icon: SymbolName; bg: string; color: string }[]
            ).map((contact) => (
              <Pressable
                key={contact.title}
                accessibilityRole="button"
                onPress={() =>
                  contact.title === 'Google Maps'
                    ? map()
                    : setDialog(
                        'Os contatos reproduzem o projeto do Stitch. Este catálogo é demonstrativo e ainda não está conectado a contatos oficiais.',
                      )
                }
                className="flex-row items-center gap-3 rounded-xl border border-line bg-surface-low p-3.5"
                style={cardShadow}
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: contact.bg }}
                >
                  <SIcon name={contact.icon} color={contact.color} />
                </View>
                <View className="flex-1">
                  <T className="font-bold text-xs leading-4 text-primary">{contact.title}</T>
                  <T className="text-xs leading-4 text-ink-variant">{contact.text}</T>
                </View>
              </Pressable>
            ))}
          </View>
          <View className="gap-4 border-b border-line py-6">
            <View>
              <Heading icon="cottage">Infraestrutura & Comodidades</Heading>
              <T className="mt-0.5 text-xs leading-4 text-ink-variant">
                Espaço preparado para barracas de teto, trailers leves e camping tradicional
              </T>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {amenities.map((a) => (
                <View
                  key={a.title}
                  className="w-[48%] flex-row items-center gap-2 rounded-lg border border-line/70 bg-surface-low p-3"
                  style={cardShadow}
                >
                  <View className="rounded-full bg-surface-container p-1">
                    <SIcon
                      name={a.icon}
                      size={20}
                      color={a.icon === 'local_fire_department' ? C.secondary : C.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <T className="font-semibold text-xs leading-4 text-primary">{a.title}</T>
                    <T className="text-xs leading-4 text-ink-variant">{a.text}</T>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <View className="gap-4 py-6">
            <View>
              <Heading icon="rate_review">Avaliações da Comunidade</Heading>
              <T className="mt-0.5 text-xs leading-4 text-ink-variant">
                Depoimentos verificados e fotos reais de quem esteve aqui
              </T>
            </View>
            {[
              ...reviews
                .filter((r) => r.campsiteId === c.id)
                .map((r) => ({
                  name: profile.name,
                  avatar: profile.photo || communityReviews[0].avatar,
                  when: 'Salva localmente',
                  equipment: 'Sua avaliação',
                  rating: r.rating,
                  text: r.text,
                  photos: r.photos,
                })),
              ...communityReviews,
            ].map((r, i) => (
              <View
                key={`${r.name}-${i}`}
                className="gap-3 rounded-xl border border-line/60 bg-surface-low p-4"
                style={cardShadow}
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1 flex-row items-center gap-3">
                    <Photo
                      uri={r.avatar}
                      className="h-11 w-11 rounded-full border border-[#c1c8c3]"
                    />
                    <View className="flex-1">
                      <T className="font-semibold text-sm leading-[18px] text-primary">{r.name}</T>
                      <View className="flex-row flex-wrap items-center gap-1">
                        <View className="flex-row">
                          {[0, 1, 2, 3, 4].map((n) => (
                            <SIcon
                              key={n}
                              name="star"
                              size={12}
                              color={n < r.rating ? C.secondary : C.outline}
                            />
                          ))}
                        </View>
                        <T className="text-xs leading-4 text-ink-variant">• {r.when}</T>
                      </View>
                    </View>
                  </View>
                  <T className="max-w-[112px] rounded bg-[#07241a]/10 px-2 py-0.5 font-bold text-[10px] leading-3 text-primary">
                    {r.equipment}
                  </T>
                </View>
                <T className="text-sm leading-[23px]">{r.text}</T>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingTop: 4 }}
                >
                  {r.photos.map((uri, i) => (
                    <Photo key={i} uri={uri} className="h-24 w-24 rounded-lg" />
                  ))}
                </ScrollView>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <Dock>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <CTA title="Rota" outline icon="directions" onPress={map} />
          </View>
          <View style={{ flex: 1.5 }}>
            <CTA
              title="Escrever Avaliação"
              color={C.orange}
              icon="star"
              onPress={() => router.push(`/campsite/${c.id}/review`)}
            />
          </View>
        </View>
      </Dock>
      {dialog !== '' && (
        <Dialog title="Informações do camping" text={dialog} onClose={() => setDialog('')} />
      )}
      <Modal visible={gallery} onRequestClose={() => setGallery(false)}>
        <SafeAreaProvider style={{ flex: 1, backgroundColor: C.primary }}>
          <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={{ flex: 1 }}>
            <View className="items-end p-4">
              <RoundButton label="Fechar galeria" icon="close" onPress={() => setGallery(false)} />
            </View>
            <View className="flex-1 justify-center">
              <Photo uri={c.gallery[index]} style={{ width: '100%', aspectRatio: 1 }} />
              <View className="flex-row items-center justify-between p-4">
                <RoundButton
                  label="Foto anterior"
                  icon="arrow_back"
                  onPress={() => setIndex((index - 1 + c.gallery.length) % c.gallery.length)}
                />
                <T className="text-white">
                  {index + 1} / {c.gallery.length}
                </T>
                <RoundButton
                  label="Próxima foto"
                  icon="arrow_forward"
                  onPress={() => setIndex((index + 1) % c.gallery.length)}
                />
              </View>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </SafeAreaView>
  );
}
