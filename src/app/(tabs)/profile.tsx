import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import {
  C,
  CTA,
  Input,
  Page,
  SIcon,
  Surface,
  TopBar,
  type SymbolName,
} from '../../components/stitch';
import { Notice, Photo, T } from '../../components/ui';
import { Dialog } from '../../components/forms';
import { pickProfilePhoto } from '../../components/stitch-forms';
import { stitchImages } from '../../data/stitch-images';
import { profileReviews } from '../../data/stitch-reviews';
import { campsites } from '../../data/campsites';
import { useStore } from '../../lib/store';
export default function Profile() {
  const params = useLocalSearchParams<{ section?: string }>();
  const {
    profile,
    setProfile,
    reviews,
    spaces,
    notifications,
    setNotifications,
    signedIn,
    setSignedIn,
  } = useStore();
  const name = profile.name === 'Explorador' ? 'Lucas Silveira' : profile.name;
  const [tab, setTab] = useState('reviews');
  const [editName, setEditName] = useState(name);
  const [dialog, setDialog] = useState('');
  useEffect(() => {
    if (params.section === 'spaces') setTab('account');
  }, [params.section]);
  const photo = profile.photo || stitchImages.profile[1];
  return (
    <Page header={<TopBar />}>
      <Surface className="items-center gap-6 p-6">
        <View className="relative">
          <Photo uri={photo} className="h-28 w-28 rounded-full border-4 border-surface-low" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar foto de perfil"
            onPress={() =>
              pickProfilePhoto(
                (uri) => setProfile({ ...profile, photo: uri }),
                () => setDialog('Não foi possível abrir suas fotos.'),
              )
            }
            className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full bg-secondary"
          >
            <SIcon name="photo_camera" size={16} color="#fff" />
          </Pressable>
        </View>
        <View className="w-full items-center">
          <View className="mb-1.5 flex-row flex-wrap items-center justify-center gap-2">
            <T
              accessibilityRole="header"
              className="font-display text-[28px] leading-[34px] text-primary"
            >
              {name}
            </T>
            <T className="rounded-full bg-surface-container px-2.5 py-0.5 font-semibold text-xs leading-4 text-ink-variant">
              {profile.country} 🇧🇷
            </T>
          </View>
          <View className="mb-3 flex-row items-center gap-1.5 rounded-full bg-[#ffdbce] px-3 py-1">
            <SIcon name="military_tech" size={14} color="#7f2b00" />
            <T className="shrink text-center font-bold text-xs leading-4 text-[#7f2b00]">
              Campista Nível 3 - 8 acampamentos visitados
            </T>
          </View>
          <T className="mb-4 text-center text-sm leading-5 text-ink-variant">
            Apaixonado por acampamento selvagem, vanlife e noites estreladas na Serra da Mantiqueira
            e no Litoral Sul. Deixando apenas pegadas.
          </T>
          <View className="w-full">
            <CTA
              title="Sugerir / Cadastrar Novo Camping"
              icon="add_location_alt"
              onPress={() => router.push('/campsite/create')}
            />
          </View>
        </View>
      </Surface>
      <View className="flex-row gap-3">
        {(
          [
            { count: 8, label: 'Campings visitados', icon: 'forest' },
            { count: 12 + reviews.length, label: 'Avaliações publicadas', icon: 'reviews' },
            {
              count: 24 + reviews.reduce((n, r) => n + r.photos.length, 0),
              label: 'Fotos enviadas',
              icon: 'photo_library',
            },
          ] as { count: number; label: string; icon: SymbolName }[]
        ).map((s, i) => (
          <View
            key={s.label}
            className="flex-1 items-center justify-center rounded-xl border border-[#c1c8c3]/30 bg-surface-low p-4"
          >
            <SIcon name={s.icon} color={i === 1 ? C.secondary : C.primary} />
            <T className="font-display text-[28px] leading-[34px] text-primary">{s.count}</T>
            <T className="text-center font-bold text-[10px] leading-3 tracking-[.4px] text-ink-variant">
              {s.label}
            </T>
          </View>
        ))}
      </View>
      <View className="mt-2 flex-row gap-4 border-b border-line px-1">
        {[
          { id: 'reviews', title: 'Avaliações & Fotos', icon: 'rate_review' as SymbolName },
          {
            id: 'account',
            title: 'Conta / Cadastro',
            icon: 'manage_accounts' as SymbolName,
          },
        ].map((t) => (
          <Pressable
            key={t.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.id }}
            onPress={() => setTab(t.id)}
            className="flex-1 flex-row items-center justify-center gap-2 border-b-2 pb-3 pt-1"
            style={{ borderBottomColor: tab === t.id ? C.secondary : 'transparent' }}
          >
            <SIcon name={t.icon} size={20} />
            <T
              className={`flex-1 text-center text-lg leading-6 text-primary ${tab === t.id ? 'font-bold' : 'font-semibold'}`}
            >
              {t.title}
            </T>
          </Pressable>
        ))}
      </View>
      {tab === 'reviews' ? (
        <View className="gap-6">
          {[
            ...reviews.map((r) => ({
              name: campsites.find((c) => c.id === r.campsiteId)?.name || 'Camping',
              location: 'Salva localmente',
              date: new Date(r.date).toLocaleDateString('pt-BR'),
              rating: r.rating.toFixed(1),
              verdict: 'Sua avaliação',
              text: r.text,
              photos: r.photos,
            })),
            ...profileReviews,
          ].map((r, i) => (
            <Surface key={`${r.name}-${i}`} className="gap-3 border border-line/50 p-5">
              <View>
                <View className="flex-row items-center gap-2">
                  <T className="flex-1 font-bold text-lg leading-6 text-primary">{r.name}</T>
                  <T className="max-w-[105px] rounded-full bg-surface-container px-2 py-0.5 font-bold text-[10px] leading-3">
                    {r.location}
                  </T>
                </View>
                <T className="text-xs leading-4 text-ink-variant">Avaliado em {r.date}</T>
              </View>
              <View className="self-start flex-row items-center gap-1.5 rounded-full bg-surface-high px-3 py-1">
                <SIcon name="star" size={16} color={C.secondary} />
                <T className="font-bold text-xs text-primary">{r.rating}</T>
                <T className="font-bold text-[10px] leading-3 text-ink-variant">({r.verdict})</T>
              </View>
              <T className="text-sm leading-5">{r.text}</T>
              <View className="gap-2">
                <T className="font-bold text-[10px] leading-3 tracking-[.4px] text-ink-variant">
                  Fotos enviadas ({r.photos.length})
                </T>
                <View className="flex-row gap-2">
                  {r.photos.map((uri, i) => (
                    <Photo
                      key={i}
                      uri={uri}
                      style={{ width: '31.5%', height: 112 }}
                      className="rounded-lg"
                    />
                  ))}
                </View>
              </View>
            </Surface>
          ))}
        </View>
      ) : (
        <View className="gap-5">
          <Surface>
            <Input label="Nome completo" value={editName} onChangeText={setEditName} />
            <CTA
              title="Salvar perfil"
              icon="check"
              onPress={() => {
                if (editName.trim().length < 3) {
                  setDialog('Informe um nome com pelo menos 3 caracteres.');
                  return;
                }
                setProfile({ ...profile, name: editName.trim() });
                setDialog('Nome atualizado neste dispositivo.');
              }}
            />
            <View className="flex-row items-center justify-between">
              <T>Notificações</T>
              <Switch
                accessibilityLabel="Preferência de notificações"
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: C.forest, false: C.border }}
              />
            </View>
            <CTA
              title={signedIn ? 'Sair da conta' : 'Entrar na conta'}
              outline
              icon={signedIn ? 'logout' : 'person'}
              onPress={() => {
                setSignedIn(false);
                router.push('/login');
              }}
            />
          </Surface>
          <Notice>
            Perfil e avaliações de exemplo do Stitch. Suas alterações são salvas localmente;
            autenticação e notificações ainda não estão conectadas.
          </Notice>
          <T className="font-bold text-lg">Meus espaços</T>
          {spaces.length ? (
            spaces.map((s) => (
              <Surface key={s.id}>
                <Photo uri={s.photos[0]} className="h-40 rounded-lg" />
                <T className="font-bold">{s.name}</T>
                <T className="text-xs text-ink-variant">{s.address}</T>
                <T className="text-xs text-secondary">Rascunho local · não enviado à curadoria</T>
              </Surface>
            ))
          ) : (
            <T className="text-ink-variant">Você ainda não cadastrou um espaço.</T>
          )}
        </View>
      )}
      <View className="mt-2 flex-row items-center gap-4 rounded-xl border border-line bg-surface-low p-5">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#bceed3]">
          <SIcon name="share_location" />
        </View>
        <View className="flex-1 items-center gap-2">
          <T className="text-center font-bold text-lg leading-6 text-primary">
            Conhece um refúgio incrível?
          </T>
          <T className="text-center text-xs leading-4 text-ink-variant">
            Compartilhe um link da internet (Instagram, Google Maps ou site oficial) para
            catalogarmos na comunidade Kampive.
          </T>
          <CTA
            compact
            title="Cadastrar Agora"
            icon="add_location_alt"
            color={C.primary}
            onPress={() => router.push('/campsite/create')}
          />
        </View>
      </View>
      {dialog !== '' && <Dialog title="Seu perfil" text={dialog} onClose={() => setDialog('')} />}
    </Page>
  );
}
