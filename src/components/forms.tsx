import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Button, Icon, IconButton, Notice, Photo, Section, T } from './ui';
export function Dialog({
  title,
  text,
  onClose,
}: {
  title: string;
  text: string;
  onClose: () => void;
}) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View
          accessibilityViewIsModal
          className="w-full max-w-[440px] gap-5 rounded-3xl bg-surface p-6"
        >
          <Icon name="compass-outline" size={36} />
          <Section>{title}</Section>
          <T className="text-ink-variant">{text}</T>
          <Button title="Entendi" icon="check" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
export function SocialButtons() {
  const [provider, setProvider] = useState('');
  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-line" />
        <T className="text-[11px] text-ink-muted">ou continue com</T>
        <View className="h-px flex-1 bg-line" />
      </View>
      <View className="flex-row gap-3">
        {(['Google', 'Apple'] as const).map((p) => (
          <Pressable
            key={p}
            onPress={() => setProvider(p)}
            accessibilityRole="button"
            className="min-h-14 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-line bg-white"
          >
            <Icon name={p === 'Google' ? 'google' : 'apple'} />
            <T className="font-bold">{p}</T>
          </Pressable>
        ))}
      </View>
      {provider !== '' && (
        <Dialog
          title={`Entrar com ${provider}`}
          text="Este layout está em modo de demonstração. A autenticação social estará disponível após a integração com o serviço de contas."
          onClose={() => setProvider('')}
        />
      )}
    </View>
  );
}
export function PhotoSlots({
  photos,
  onChange,
  max = 3,
  title = 'Fotos da sua experiência',
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  title?: string;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function pick() {
    if (busy || photos.length >= max) return;
    setBusy(true);
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: max - photos.length,
        quality: 0.8,
      });
      if (!result.canceled) onChange([...photos, ...result.assets.map((a) => a.uri)].slice(0, max));
    } catch {
      setError(
        'Não foi possível abrir suas fotos. Verifique a permissão de acesso e tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <View className="gap-3">
      <Section>{title}</Section>
      <View className="flex-row flex-wrap gap-3">
        {Array.from({ length: max }, (_, i) => (
          <View key={i} style={{ width: max === 1 ? 112 : '30%', aspectRatio: 1 }}>
            {photos[i] ? (
              <View className="flex-1">
                <Photo
                  uri={photos[i]}
                  className={max === 1 ? 'flex-1 rounded-full' : 'flex-1 rounded-xl'}
                />
                <View className="absolute right-0 top-0">
                  <IconButton
                    icon="close"
                    label={`Remover foto ${i + 1}`}
                    light
                    onPress={() => onChange(photos.filter((_, index) => index !== i))}
                  />
                </View>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Adicionar foto ${i + 1}`}
                disabled={busy}
                onPress={pick}
                className={`flex-1 items-center justify-center gap-1 border border-dashed border-ink-muted bg-surface-low ${max === 1 ? 'rounded-full' : 'rounded-xl'}`}
              >
                <Icon name={max === 1 ? 'camera-plus-outline' : 'plus'} size={25} />
                <T className="text-[10px] text-ink-variant">
                  {busy ? 'Abrindo...' : `Foto ${i + 1}`}
                </T>
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <T className="text-xs text-ink-muted">
        Adicionadas: {photos.length} de {max} fotos permitidas
      </T>
      {error !== '' && <Notice error>{error}</Notice>}
    </View>
  );
}
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export const isHttpsUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !!url.hostname.includes('.');
  } catch {
    return false;
  }
};
