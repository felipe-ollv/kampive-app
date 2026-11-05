import { useTranslation } from '../../lib/i18n';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Back, C, CTA, Input, Page, Surface, ToggleChip } from '../../components/stitch';
import { Icon, Notice, Photo, T } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { api, errorMessage, type ApiUser, type City } from '../../lib/api';
import { hasProfileChanges, profilePhoto, travelStyles, validateProfile, type ProfileInput } from '../../lib/profile';
import { useCountries } from '../../hooks/use-countries';
import { useApiPage } from '../../hooks/use-api-page';

export default function EditProfile() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  return (
    <Page
      header={
        <View className="flex-row items-center gap-3 p-4">
          <Back />
          <T className="font-bold text-lg">{t('Editar perfil')}</T>
        </View>
      }
    >
      {user ? (
        <Editor key={user.uuid} user={user} />
      ) : (
        <Surface>
          <T>{loading ? t('Carregando perfil...') : t('Entre para editar seu perfil.')}</T>
          {!loading && <CTA icon={null} title={t('Entrar')} onPress={() => router.replace('/login')} />}
        </Surface>
      )}
    </Page>
  );
}
function Editor({ user }: { user: ApiUser }) {
  const { t } = useTranslation();
  const { updateProfile, busy } = useAuth();
  const [form, setForm] = useState<ProfileInput>({
    name: user.name,
    bio: user.bio || '',
    countryUuid: user.countryUuid,
    cityUuid: user.cityUuid || null,
    travelStyles: user.travelStyles || [],
    photoUrl: user.photoUrl,
  });
  const [countryName, setCountryName] = useState(user.countryName || '');
  const [cityName, setCityName] = useState(
    [user.cityName, user.divisionName].filter(Boolean).join(' · '),
  );
  const [selecting, setSelecting] = useState<'country' | 'city' | null>(null);
  const [error, setError] = useState('');
  const [picking, setPicking] = useState(false);
  const lock = useRef(false);
  const photo = profilePhoto(form.photoUrl);
  const hasChanges = hasProfileChanges(form, {
    name: user.name,
    bio: user.bio || '',
    countryUuid: user.countryUuid,
    cityUuid: user.cityUuid || null,
    travelStyles: user.travelStyles || [],
    photoUrl: user.photoUrl,
  });
  async function pickPhoto() {
    if (lock.current) return;
    lock.current = true;
    setPicking(true);
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        if (
          !asset.base64 ||
          asset.base64.length > 2_796_204 ||
          asset.width * asset.height > 16_000_000
        ) {
          setError('Escolha uma foto de até 2 MB e 16 megapixels.');
          return;
        }
        setForm((previous) => ({
          ...previous,
          photoUrl: `data:image/jpeg;base64,${asset.base64}`,
        }));
      }
    } catch {
      setError('Não foi possível abrir a foto. Tente novamente.');
    } finally {
      lock.current = false;
      setPicking(false);
    }
  }
  async function save() {
    if (lock.current || busy || !hasChanges) return;
    const message = validateProfile(form);
    if (message) {
      setError(message);
      return;
    }
    lock.current = true;
    setError('');
    try {
      await updateProfile({ ...form, name: form.name.trim(), bio: form.bio.trim() });
      router.back();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
    }
  }
  return (
    <>
      <Surface className="items-center">
        <View className="w-full flex-row items-center justify-center gap-2 py-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Remover foto')}
            accessibilityState={{ disabled: busy || picking || !form.photoUrl }}
            disabled={busy || picking || !form.photoUrl}
            onPress={() => setForm((previous) => ({ ...previous, photoUrl: null }))}
            className="h-12 w-12 items-center justify-center rounded-full bg-surface-container"
            style={({ pressed }) => ({
              opacity: busy || picking || !form.photoUrl ? 0.4 : pressed ? 0.6 : 1,
            })}
          >
            <Icon name="trash-can-outline" size={24} color={C.secondary} />
          </Pressable>
          <View style={{ width: '60%', maxWidth: 184, aspectRatio: 1 }}>
            {photo ? (
              <Photo uri={photo} className="h-full w-full rounded-full" />
            ) : (
              <View className="h-full w-full items-center justify-center gap-2 rounded-full bg-surface-container p-4">
                <Icon name="account-outline" size={48} color={C.primary} />
                <T className="text-center text-xs">{t('Adicione sua foto')}</T>
              </View>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={picking ? t('Abrindo foto...') : t('Escolher foto')}
            accessibilityState={{ disabled: busy || picking, busy: picking }}
            disabled={busy || picking}
            onPress={() => void pickPhoto()}
            className="h-12 w-12 items-center justify-center rounded-full bg-surface-container"
            style={({ pressed }) => ({ opacity: busy || picking ? 0.4 : pressed ? 0.6 : 1 })}
          >
            <Icon name="pencil-outline" size={24} color={C.primary} />
          </Pressable>
        </View>
      </Surface>
      <Surface>
        <Input
          label={t('Nome')}
          value={form.name}
          maxLength={150}
          editable={!busy}
          onChangeText={(name) => setForm({ ...form, name })}
        />
        <T className="font-bold">{t('Localização')}</T>
        <CTA icon={null}
          title={countryName || t('Selecionar país')}
          outline
          disabled={busy}
          onPress={() => setSelecting(selecting === 'country' ? null : 'country')}
        />
        {selecting === 'country' && (
          <Countries
            onSelect={(uuid, name) => {
              setForm({ ...form, countryUuid: uuid, cityUuid: null });
              setCountryName(name);
              setCityName('');
              setSelecting(null);
            }}
          />
        )}
        <CTA icon={null}
          title={cityName || t('Selecionar cidade e estado')}
          outline
          disabled={busy || !form.countryUuid}
          onPress={() => setSelecting(selecting === 'city' ? null : 'city')}
        />
        {selecting === 'city' && form.countryUuid && (
          <Cities
            countryUuid={form.countryUuid}
            onSelect={(city) => {
              setForm({ ...form, cityUuid: city.uuid });
              setCityName(`${city.name} · ${city.divisionName}`);
              setSelecting(null);
            }}
          />
        )}
        {!!form.countryUuid && (
          <CTA icon={null}
            title={t('Remover localização')}
            outline
            disabled={busy}
            onPress={() => {
              setForm({ ...form, countryUuid: null, cityUuid: null });
              setCountryName('');
              setCityName('');
              setSelecting(null);
            }}
          />
        )}
        <Input
          label={t('Apresentação (opcional)')}
          multiline
          maxLength={500}
          value={form.bio}
          editable={!busy}
          placeholder={t('Conte um pouco sobre você e suas viagens')}
          onChangeText={(bio) => setForm({ ...form, bio })}
        />
        <T className="text-xs text-ink-variant">
          {form.bio.length}
          {t('/500 caracteres')}
        </T>
      </Surface>
      <Surface>
        <T className="font-bold text-lg">{t('Estilos de viagem')}</T>
        <T>{t('Você pode selecionar mais de um.')}</T>
        <View className="flex-row flex-wrap gap-2" pointerEvents={busy ? 'none' : 'auto'}>
          {travelStyles.map((style) => (
            <ToggleChip
              key={style.value}
              icon="camping"
              selected={form.travelStyles.includes(style.value)}
              onPress={() =>
                setForm({
                  ...form,
                  travelStyles: form.travelStyles.includes(style.value)
                    ? form.travelStyles.filter((value) => value !== style.value)
                    : [...form.travelStyles, style.value],
                })
              }
            >
              {t(style.label)}
            </ToggleChip>
          ))}
        </View>
      </Surface>
      {!!error && <Notice error>{error}</Notice>}
      <CTA icon={null}
        title={busy ? t('Salvando...') : t('Salvar alterações')}
        disabled={!hasChanges || busy || picking || selecting !== null}
        onPress={() => void save()}
      />
    </>
  );
}
function useSearch() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  return { query, setQuery, debounced };
}
function Countries({ onSelect }: { onSelect: (uuid: string, name: string) => void }) {
  const { t } = useTranslation();
  const { query, setQuery, debounced } = useSearch();
  const { data, loading, error, reload, loadMore } = useCountries(undefined, debounced);
  return (
    <View className="gap-2">
      <Input label={t('Buscar país')} value={query} onChangeText={setQuery} />
      {loading && <T>{t('Carregando...')}</T>}
      {!!error && (
        <>
          <Notice error>{error}</Notice>
          <CTA icon={null} title={t('Tentar novamente')} onPress={() => void reload()} />
        </>
      )}
      {!loading &&
        data?.items.map((country) => (
          <CTA icon={null}
            key={country.uuid}
            title={country.name}
            outline
            onPress={() => onSelect(country.uuid, country.name)}
          />
        ))}
      {!loading && data?.items.length === 0 && <T>{t('Nenhum país encontrado.')}</T>}
      {!!data && data.page + 1 < data.totalPages && (
        <CTA icon={null} title={t('Mais países')} disabled={loading} onPress={loadMore} />
      )}
    </View>
  );
}
function Cities({
  countryUuid,
  onSelect,
}: {
  countryUuid: string;
  onSelect: (city: City) => void;
}) {
  const { t } = useTranslation();
  const { query, setQuery, debounced } = useSearch();
  const { data, loading, error, reload, loadMore } = useApiPage(
    useCallback(
      (page: number) => api.cities({ countryUuid, query: debounced, page, size: 20 }),
      [countryUuid, debounced],
    ),
  );
  return (
    <View className="gap-2">
      <Input label={t('Buscar cidade')} value={query} onChangeText={setQuery} />
      {loading && <T>{t('Carregando...')}</T>}
      {!!error && (
        <>
          <Notice error>{error}</Notice>
          <CTA icon={null} title={t('Tentar novamente')} onPress={() => void reload()} />
        </>
      )}
      {!loading &&
        data?.items.map((city) => (
          <CTA icon={null}
            key={city.uuid}
            title={`${city.name} · ${city.divisionName}`}
            outline
            onPress={() => onSelect(city)}
          />
        ))}
      {!loading && data?.items.length === 0 && <T>{t('Nenhuma cidade encontrada.')}</T>}
      {!!data && data.page + 1 < data.totalPages && (
        <CTA icon={null} title={t('Mais cidades')} disabled={loading} onPress={() => void loadMore()} />
      )}
    </View>
  );
}
