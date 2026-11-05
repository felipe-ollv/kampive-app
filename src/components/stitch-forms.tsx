import { useTranslation } from '../lib/i18n';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, View } from 'react-native';
import { Notice, Photo, T } from './ui';
import { SIcon } from './stitch';
export function UploadPhotos({
  photos,
  onChange,
  labels = [],
  compact = false,
  disabled = false,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  labels?: string[];
  compact?: boolean;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function pick() {
    if (disabled || busy || photos.length >= 3) return;
    setBusy(true);
    setError('');
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 3 - photos.length,
        quality: 0.5,
        base64: true,
      });
      if (!r.canceled) {
        if (
          r.assets.some(
            (a) => !a.base64 || a.base64.length > 2_796_204 || a.width * a.height > 16_000_000,
          )
        ) {
          setError('Escolha fotos de até 2 MB e 16 megapixels.');
          return;
        }
        onChange(
          [...photos, ...r.assets.map((a) => `data:image/jpeg;base64,${a.base64}`)].slice(0, 3),
        );
      }
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
                  accessibilityLabel={t('Remover foto {number}', { number: i + 1 })}
                  disabled={disabled || busy}
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
                accessibilityLabel={t('Adicionar foto {number}', { number: i + 1 })}
                disabled={disabled || busy}
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
                  {busy ? t('Abrindo...') : compact ? t('+ Foto') : t('+ Adicionar')}
                </T>
                {!compact && (
                  <T className="text-[10px] leading-3 text-ink-variant">{t('JPG ou PNG')}</T>
                )}
              </Pressable>
            )}
          </View>
        ))}
      </View>
      {error !== '' && <Notice error>{error}</Notice>}
    </View>
  );
}
