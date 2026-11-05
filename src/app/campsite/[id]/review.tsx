import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Back, C, CTA, Page, SIcon, Surface, ToggleChip } from '../../../components/stitch';
import { Empty, Notice, T } from '../../../components/ui';
import { Dialog } from '../../../components/forms';
import { UploadPhotos } from '../../../components/stitch-forms';
import { api, errorMessage } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { useApiResource } from '../../../hooks/use-api-resource';
export default function Review() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading, error, refresh } = useAuth();
  if (loading)
    return (
      <Page>
        <T>Carregando conta...</T>
      </Page>
    );
  if (error)
    return (
      <Page>
        <Notice error>{error}</Notice>
        <CTA title="Tentar novamente" onPress={() => void refresh()} />
      </Page>
    );
  if (!user)
    return (
      <Page>
        <Back />
        <T>Entre para avaliar este camping.</T>
        <CTA title="Entrar" onPress={() => router.push('/login')} />
      </Page>
    );
  return <ReviewForm key={`${user.uuid}:${id}`} id={id} />;
}
function ReviewForm({ id }: { id: string }) {
  const campsite = useApiResource(useCallback(() => api.campsite(id), [id]));
  const options = useApiResource(useCallback(() => api.reviewOptions(), []));
  const c = campsite.data?.summary;
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const submitted = useRef(false);
  if (campsite.loading || options.loading)
    return (
      <Page>
        <Back />
        <T>Carregando avaliação...</T>
      </Page>
    );
  if (campsite.error || options.error)
    return (
      <Page>
        <Back />
        <Notice error>{campsite.error || options.error}</Notice>
        <CTA
          title="Tentar novamente"
          onPress={() => {
            void campsite.reload();
            void options.reload();
          }}
        />
      </Page>
    );
  if (!c)
    return (
      <Page>
        <Empty
          title="Camping não encontrado"
          text="Escolha um camping para avaliar."
          action={() => router.replace('/')}
        />
      </Page>
    );
  async function submit() {
    if (submitted.current) return;
    if (!rating || text.trim().length < 50) {
      setError('Selecione uma nota e conte sua experiência em pelo menos 50 caracteres.');
      return;
    }
    submitted.current = true;
    setBusy(true);
    setError('');
    try {
      await api.createReview(id, {
        rating,
        text: text.trim(),
        photos,
        highlightUuids: selected,
        campingMethodUuid: method,
      });
      setDone(true);
    } catch (e) {
      submitted.current = false;
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      gap={36}
      header={
        <View className="flex-row items-center justify-between gap-3 border-b border-line/40 px-4 py-4">
          <View className="flex-1 flex-row items-center gap-3">
            <Back close />
            <View className="flex-1">
              <T className="font-semibold text-lg leading-6 text-primary">Avaliar Camping</T>
              <T numberOfLines={1} className="font-semibold text-xs leading-4 text-ink-variant">
                {c.name}
              </T>
            </View>
          </View>
        </View>
      }
      dock={
        <CTA
          title={busy ? 'Enviando...' : 'Enviar avaliação'}
          icon="rate_review"
          disabled={busy || done}
          onPress={() => void submit()}
        />
      }
    >
      <Surface className="gap-4 border border-line/40 p-5">
        <View className="items-center gap-1">
          <T className="font-bold text-xs uppercase tracking-wider text-secondary">
            Como foi sua estadia?
          </T>
          <T accessibilityRole="header" className="font-bold text-[22px] leading-7 text-primary">
            Classificação Geral
          </T>
          <T className="text-center text-xs leading-4 text-ink-variant">
            Toque nas estrelas para avaliar sua experiência
          </T>
        </View>
        <View className="flex-row items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              accessibilityRole="radio"
              accessibilityLabel={`${n} estrelas`}
              accessibilityState={{ checked: rating === n }}
              disabled={busy || done}
              onPress={() => setRating(n)}
              className="p-1"
            >
              <SIcon name="star" size={36} color={n <= rating ? C.orange : C.border} />
            </Pressable>
          ))}
        </View>
        <T className="text-center font-bold text-sm text-primary">
          {
            ['Selecione sua nota', 'Pode melhorar', 'Regular', 'Bom', 'Muito bom', 'Excelente'][
              rating
            ]
          }{' '}
          ({rating} de 5)
        </T>
        <View className="gap-2.5 border-t border-line/50 pt-2">
          <T className="font-semibold text-xs text-ink-variant">O que mais se destacou?</T>
          <View className="flex-row flex-wrap gap-2">
            {options.data?.highlights.map((h) => (
              <ToggleChip
                icon="check"
                key={h.uuid}
                selected={selected.includes(h.uuid)}
                onPress={() =>
                  !busy &&
                  !done &&
                  setSelected(
                    selected.includes(h.uuid)
                      ? selected.filter((s) => s !== h.uuid)
                      : [...selected, h.uuid],
                  )
                }
              >
                {h.name}
              </ToggleChip>
            ))}
          </View>
        </View>
      </Surface>
      {!!options.data?.campingMethods.length && (
        <View className="gap-2">
          <T>Como você acampou?</T>
          <View className="flex-row flex-wrap gap-2">
            {options.data.campingMethods.map((item) => (
              <ToggleChip
                icon="camping"
                key={item.uuid}
                selected={method === item.uuid}
                onPress={() => {
                  if (!busy && !done) setMethod(method === item.uuid ? null : item.uuid);
                }}
              >
                {item.name}
              </ToggleChip>
            ))}
          </View>
        </View>
      )}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <T className="font-semibold text-lg text-primary">Seu relato da aventura</T>
          <T className="text-xs text-ink-variant">Mín. 50 caracteres</T>
        </View>
        <View className="rounded-xl border border-line/40 bg-surface-container p-3">
          <TextInput
            contextMenuHidden={false}
            accessibilityLabel="Seu relato da aventura"
            placeholder="Conte como foi sua experiência, dicas de barraca, melhores pontos de montagem e facilidades do local..."
            placeholderTextColor={C.outline}
            editable={!busy && !done}
            value={text}
            onChangeText={setText}
            maxLength={1000}
            multiline
            className="min-h-[140px] p-1 font-jakarta text-sm leading-5 text-ink"
            style={{ textAlignVertical: 'top' }}
          />
          <View className="flex-row items-center justify-between gap-2 border-t border-line/30 pt-2">
            <View className="flex-1 flex-row items-center gap-1">
              <SIcon name="tips_and_updates" size={14} />
              <T className="flex-1 font-bold text-[10px] leading-3 tracking-[.4px] text-ink-variant">
                Dica: Mencione se há tomadas próximas e abrigo de vento
              </T>
            </View>
            <T className="w-10 font-bold text-[10px] leading-3 text-ink-muted">
              {text.length} / 1000
            </T>
          </View>
        </View>
      </View>
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <T className="font-semibold text-lg text-primary">Fotos da sua visita</T>
            <T className="font-bold text-xs leading-4 text-secondary">
              Adicione até 3 fotos da sua visita ({photos.length}/3 selecionadas)
            </T>
          </View>
          <SIcon name="add_photo_alternate" color={C.secondary} />
        </View>
        <UploadPhotos photos={photos} onChange={setPhotos} disabled={busy || done} />
      </View>
      <View className="flex-row items-start gap-3 rounded-xl border border-line bg-surface-high/70 p-3.5">
        <SIcon name="info" size={20} color={C.secondary} />
        <T className="flex-1 text-xs leading-4 text-ink-variant">
          Suas fotos e relato ajudam a manter o cadastro do camping atualizado para outros
          viajantes.
        </T>
      </View>
      {error !== '' && <Notice error>{error}</Notice>}
      {done && (
        <Dialog
          title="Avaliação enviada"
          text="Sua avaliação foi recebida e está em análise. Acompanhe o status no seu perfil."
          onClose={() => router.replace(`/campsite/${id}`)}
        />
      )}
    </Page>
  );
}
