import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, View } from 'react-native';
import { Icon, Notice, Photo, T } from './ui';
import { Dialog } from './forms';
import { C, GoogleMark, SIcon } from './stitch';
export function Social({ register = false }: { register?: boolean }) {
  const [provider, setProvider] = useState('');
  return (
    <View className="gap-5">
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-[#c1c8c3]" />
        <T className="font-semibold text-xs text-ink-variant">
          {register ? 'ou cadastre-se com' : 'ou continue com'}
        </T>
        <View className="h-px flex-1 bg-[#c1c8c3]" />
      </View>
      <View className="flex-row gap-3">
        {['Google', 'Apple'].map((p) => (
          <Pressable
            key={p}
            accessibilityRole="button"
            onPress={() => setProvider(p)}
            className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-[#c1c8c3] ${register ? 'bg-surface-container' : 'bg-white'}`}
          >
            {p === 'Google' ? <GoogleMark /> : <Icon name="apple" size={24} color={C.primary} />}
            <T className="font-semibold text-xs">{p}</T>
          </Pressable>
        ))}
      </View>
      {provider !== '' && (
        <Dialog
          title={`Entrar com ${provider}`}
          text="Esta é uma prévia de layout. A autenticação social ainda não está conectada."
          onClose={() => setProvider('')}
        />
      )}
    </View>
  );
}
export function UploadPhotos({
  photos,
  onChange,
  labels = [],
  compact = false,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  labels?: string[];
  compact?: boolean;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function pick() {
    if (busy || photos.length >= 3) return;
    setBusy(true);
    setError('');
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 3 - photos.length,
        quality: 0.8,
      });
      if (!r.canceled) onChange([...photos, ...r.assets.map((a) => a.uri)].slice(0, 3));
    } catch {
      setError('Não foi possível abrir as fotos. Verifique as permissões do dispositivo.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <View className="gap-2">
      <View className="flex-row gap-3">
        {[0, 1, 2].map((i) => (
          <View key={i} className="flex-1" style={{ aspectRatio: 1 }}>
            {photos[i] ? (
              <View className="flex-1 overflow-hidden rounded-xl border border-line">
                <Photo uri={photos[i]} className="h-full w-full" />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover foto ${i + 1}`}
                  onPress={() => onChange(photos.filter((_, index) => index !== i))}
                  className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-[#30312e]/80"
                  hitSlop={8}
                >
                  <SIcon name="close" size={15} color="#fff" />
                </Pressable>
                {labels[i] && (
                  <T className="absolute bottom-1.5 left-1.5 rounded bg-[#07241a]/80 px-1.5 py-0.5 font-bold text-[10px] leading-3 text-white">
                    {labels[i]}
                  </T>
                )}
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Adicionar foto ${i + 1}`}
                disabled={busy}
                onPress={pick}
                className="flex-1 items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#c1c8c3] bg-surface-low"
              >
                <View
                  className={
                    compact
                      ? ''
                      : 'h-8 w-8 items-center justify-center rounded-full bg-surface-high'
                  }
                >
                  <SIcon name={compact ? 'add_a_photo' : 'add'} size={compact ? 26 : 22} />
                </View>
                <T className="font-bold text-[10px] leading-3 text-primary">
                  {busy ? 'Abrindo...' : compact ? '+ Foto' : '+ Adicionar'}
                </T>
                {!compact && <T className="text-[10px] leading-3 text-ink-variant">JPG ou PNG</T>}
              </Pressable>
            )}
          </View>
        ))}
      </View>
      {error !== '' && <Notice error>{error}</Notice>}
    </View>
  );
}
export async function pickProfilePhoto(onChange: (uri: string) => void, onError: () => void) {
  try {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!r.canceled) onChange(r.assets[0].uri);
  } catch {
    onError();
  }
}
