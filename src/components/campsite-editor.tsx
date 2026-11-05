import { useAuth } from '../lib/auth';
import { useTranslation } from '../lib/i18n';
import * as ImagePicker from 'expo-image-picker';
import { campsiteMultipart, type CampsiteUpload } from '../lib/campsite-upload';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { CTA, Heading, Input, Surface, ToggleChip } from './stitch';
import { Notice, Photo, T } from './ui';
import {
  api,
  ApiError,
  errorMessage,
  type CampsiteContent,
  type CampsiteDetail,
  type CampsiteStatus,
} from '../lib/api';
import { useApiResource } from '../hooks/use-api-resource';
import { blankCampsite, decimalInput, validateCampsite } from '../lib/campsite-form';
import { campsiteStatus, httpsPhoto } from '../lib/campsite-display';
export function CampsiteEditor({ initialUuid }: { initialUuid?: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const countryUuid = user?.countryUuid;
  const country = useApiResource(
    useCallback(() => countryUuid ? api.country(countryUuid) : Promise.resolve(null), [countryUuid]),
  );
  const options = useApiResource(useCallback(() => api.campsiteOptions(), []));
  const currency = country.data?.uuid === countryUuid
    ? options.data?.currencies.find((item) => item.isoCode === country.data?.currencyCode)
    : undefined;
  const currencyMessage = !countryUuid
    ? 'Defina seu país no perfil para informar a diária.'
    : 'Não foi possível identificar a moeda do seu país. Tente novamente mais tarde.';
  const existing = useApiResource(
    useCallback(
      () => (initialUuid ? api.ownedCampsite(initialUuid) : Promise.resolve(null)),
      [initialUuid],
    ),
  );
  const [form, setForm] = useState<CampsiteContent>(blankCampsite);
  const [uuid, setUuid] = useState(initialUuid);
  const [registrationReceipt, setRegistrationReceipt] = useState('');
  const [status, setStatus] = useState<CampsiteStatus>('draft');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [altitude, setAltitude] = useState('');
  const [price, setPrice] = useState('');
  const [uploads, setUploads] = useState<CampsiteUpload[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const editable = status === 'draft' || status === 'rejected';
  function adopt(detail: CampsiteDetail) {
    setUuid(detail.summary.uuid);
    setStatus(detail.summary.status);
    setForm({
      ...detail.content,
      cityName: detail.content.cityName || detail.summary.cityName || '',
    });
    setUploads([]);
    setLatitude(detail.content.latitude?.toString() || '');
    setLongitude(detail.content.longitude?.toString() || '');
    setAltitude(detail.content.altitudeMeters?.toString() || '');
    setPrice(detail.content.startingPricePerNight?.toString() || '');
  }
  useEffect(() => {
    if (existing.data) adopt(existing.data);
  }, [existing.data]);
  function change<K extends keyof CampsiteContent>(key: K, value: CampsiteContent[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setMessage('');
  }
  async function addPhotos() {
    if (lock.current || form.photos.length >= 9) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 9 - form.photos.length,
        quality: 1,
      });
      if (result.canceled) return;
      if (
        result.assets.some(
          (asset) =>
            (asset.fileSize || 0) > 10 * 1024 * 1024 || asset.width * asset.height > 40_000_000,
        )
      ) {
        setError('Selecione fotos de até 10 MB e 40 megapixels.');
        return;
      }
      const selected = result.assets
        .slice(0, 9 - form.photos.length)
        .filter((asset) => !form.photos.some((photo) => photo.url === asset.uri));
      setUploads((previous) => [
        ...previous,
        ...selected.map((asset, index) => ({
          uri: asset.uri,
          name: asset.fileName || `foto-${index}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          file: asset.file,
        })),
      ]);
      change('photos', [
        ...form.photos,
        ...selected.map((asset) => ({ url: asset.uri, description: '' })),
      ]);
    } catch {
      setError('Não foi possível selecionar as fotos. Tente novamente.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save(submit: boolean) {
    if (lock.current || !editable || uncertain || registrationReceipt) return;
    setError('');
    setMessage('');
    let body: CampsiteContent;
    try {
      const startingPricePerNight = decimalInput(price, 0, 9999999999.99, 2);
      if (startingPricePerNight !== null && !currency) {
        setError(currencyMessage);
        return;
      }
      body = {
        ...form,
        name: form.name.trim(),
        latitude: decimalInput(latitude, -90, 90, 6),
        longitude: decimalInput(longitude, -180, 180, 6),
        altitudeMeters: decimalInput(altitude, -999999.99, 999999.99, 2),
        startingPricePerNight,
        currencyUuid: startingPricePerNight === null ? null : currency!.uuid,
        contacts: form.contacts
          .filter((c) => c.value.trim())
          .map((c) => ({ ...c, value: c.value.trim() })),
      };
      const problem = validateCampsite(
        body,
        !initialUuid || submit,
        uploads.map((file) => file.uri),
      );
      if (problem) {
        setError(problem);
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Confira os valores.'));
      return;
    }
    lock.current = true;
    setBusy(true);
    let savedUuid = uuid;
    try {
      if (!savedUuid) {
        const receipt = await api.registerCampsite(campsiteMultipart(body, uploads));
        setRegistrationReceipt(receipt.uuid);
        return;
      }
      const saved = await api.updateCampsite(savedUuid, campsiteMultipart(body, uploads));
      savedUuid = saved.summary.uuid;
      adopt(saved);
      if (submit) {
        const result = await api.submitCampsite(savedUuid);
        adopt(result);
      }
      setMessage(
        submit
          ? t('Camping enviado para análise. Ele será exibido após aprovação.')
          : t('Rascunho salvo na sua conta.'),
      );
    } catch (e) {
      setError(errorMessage(e));
      if (e instanceof ApiError && e.status === 401) setSessionExpired(true);
      // A timeout can happen after a committed POST. Do not allow blind duplicate creation.
      if (!savedUuid && e instanceof ApiError && e.status === 0) setUncertain(true);
      if (savedUuid && e instanceof ApiError && (e.status === 409 || e.status === 0)) {
        try {
          adopt(await api.ownedCampsite(savedUuid));
        } catch {
          setUncertain(true);
        }
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function archive() {
    if (!uuid || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      adopt(await api.archiveCampsite(uuid));
      setMessage('Camping arquivado.');
      setConfirmArchive(false);
    } catch (e) {
      setError(errorMessage(e));
      if (e instanceof ApiError && e.status === 401) setSessionExpired(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (registrationReceipt)
    return (
      <Surface>
        <T className="font-bold text-xl">{t('Cadastro recebido')}</T>
        <T>
          {t(
            'Nossa equipe vai validar os dados antes de publicar o camping. Este cadastro não cria um vínculo de propriedade nem libera acesso à gestão.',
          )}
        </T>
        <T selectable className="text-xs">
          {t('Protocolo:')}{' '}
          {registrationReceipt}
        </T>
        <CTA title={t('Voltar ao perfil')} onPress={() => router.replace('/(tabs)/profile')} />
      </Surface>
    );
  if (existing.loading || options.loading)
    return <T>{t('Carregando informações do camping...')}</T>;
  if (existing.error || options.error)
    return (
      <>
        <Notice error>{existing.error || options.error}</Notice>
        <CTA
          title={t('Tentar novamente')}
          onPress={() => {
            void existing.reload();
            void options.reload();
          }}
        />
        <CTA title={t('Entrar novamente')} outline onPress={() => router.push('/login')} />
      </>
    );
  return (
    <>
      <T className="font-bold text-secondary">
        {uuid ? t(campsiteStatus[status]) : t('Cadastrar camping')}
      </T>
      {!initialUuid && (
        <Notice>
          {t(
            'Preencha os dados do camping para análise da equipe. A publicação e a propriedade dependem de validações separadas.',
          )}
        </Notice>
      )}
      {!!message && <Notice>{message}</Notice>}
      {!!error && <Notice error>{error}</Notice>}
      {sessionExpired && (
        <CTA title={t('Entrar novamente')} onPress={() => router.push('/login')} />
      )}
      {uncertain && (
        <Notice>
          {initialUuid
            ? t(
                'Não foi possível confirmar a gravação. Confira Meus campings antes de tentar novamente.',
              )
            : t(
                'Não foi possível confirmar o recebimento. Seu cadastro pode ter sido enviado; evite reenviá-lo agora.',
              )}
        </Notice>
      )}
      <View
        pointerEvents={busy || !editable || uncertain ? 'none' : 'auto'}
        style={{ opacity: busy || !editable || uncertain ? 0.65 : 1 }}
      >
        <View className="gap-6">
          <Surface>
            <Heading icon="camping">{t('Dados do camping')}</Heading>
            <Input
              label={t('Nome do camping')}
              value={form.name}
              onChangeText={(v) => change('name', v)}
              maxLength={180}
            />
            <Input
              label={t('Descrição')}
              multiline
              value={form.description}
              onChangeText={(v) => change('description', v)}
              maxLength={10000}
            />
            <T className="font-bold">{t('Categoria')}</T>
            {!options.data?.categories.length && (
              <Notice>
                {t(
                  'As categorias ainda não estão disponíveis. O cadastro será liberado após sua configuração.',
                )}
              </Notice>
            )}
            <View className="flex-row flex-wrap gap-2">
              {options.data?.categories.map((c) => (
                <ToggleChip
                  key={c.uuid}
                  icon="camping"
                  selected={form.categoryUuid === c.uuid}
                  onPress={() => change('categoryUuid', c.uuid)}
                >
                  {c.name}
                </ToggleChip>
              ))}
            </View>
          </Surface>
          <Surface>
            <Heading icon="location_on">{t('Localização')}</Heading>
            <Input
              label={t('Cidade')}
              placeholder={t('Digite o nome da cidade')}
              value={form.cityName || ''}
              maxLength={120}
              onChangeText={(value) =>
                setForm((previous) => ({ ...previous, cityName: value, cityUuid: null }))
              }
            />
            <Input
              label={t('Endereço')}
              value={form.streetAddress}
              maxLength={200}
              onChangeText={(v) => change('streetAddress', v)}
            />
            <Input
              label={t('Número')}
              value={form.addressNumber}
              maxLength={30}
              onChangeText={(v) => change('addressNumber', v)}
            />
            <Input
              label={t('Complemento')}
              value={form.addressComplement}
              maxLength={150}
              onChangeText={(v) => change('addressComplement', v)}
            />
            <Input
              label={t('Bairro')}
              value={form.neighborhood}
              maxLength={120}
              onChangeText={(v) => change('neighborhood', v)}
            />
            <Input
              label={t('CEP / código postal')}
              value={form.postalCode}
              maxLength={20}
              onChangeText={(v) => change('postalCode', v)}
            />
            <Input
              label={t('Latitude (opcional, −90 a 90)')}
              value={latitude}
              maxLength={15}
              onChangeText={setLatitude}
              placeholder="-23.550520"
            />
            <Input
              label={t('Longitude (opcional, −180 a 180)')}
              value={longitude}
              maxLength={15}
              onChangeText={setLongitude}
              placeholder="-46.633308"
            />
            <Input
              label={t('Altitude em metros (opcional)')}
              value={altitude}
              maxLength={15}
              onChangeText={setAltitude}
            />
            <Input
              label={t('Como chegar / observações (opcional)')}
              multiline
              value={form.locationNotes}
              maxLength={2000}
              onChangeText={(v) => change('locationNotes', v)}
            />
          </Surface>
          <Surface>
            <Heading icon="payments">{t('Diária')}</Heading>
            <Input
              label={t('Valor a partir de (opcional)')}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              maxLength={16}
            />
            <T className="text-sm text-primary">
              {currency ? `${currency.symbol} · ${currency.isoCode}` : t(
                country.loading || options.loading ? 'Carregando...' : currencyMessage,
              )}
            </T>
          </Surface>
          <Surface>
            <Heading icon="hub">{t('Digital & Contato')}</Heading>
            <T>{t('O número de WhatsApp será adicionado após a validação do camping.')}</T>
            {!options.data?.contactTypes.length && (
              <T>{t('Os tipos de contato ainda não estão disponíveis.')}</T>
            )}
            {options.data?.contactTypes
              .filter((t) => !/whats\s*app/i.test(t.name))
              .map((t) => (
                <Input
                  key={t.uuid}
                  label={t.name}
                  value={form.contacts.find((c) => c.typeUuid === t.uuid)?.value || ''}
                  maxLength={500}
                  autoCapitalize="none"
                  onChangeText={(value) =>
                    change('contacts', [
                      ...form.contacts.filter((c) => c.typeUuid !== t.uuid),
                      { typeUuid: t.uuid, value },
                    ])
                  }
                />
              ))}
          </Surface>
          <Surface>
            <Heading icon="cottage">{t('Infraestrutura & Comodidades')}</Heading>
            <View className="flex-row flex-wrap gap-2">
              {options.data?.amenities.map((a) => (
                <ToggleChip
                  key={a.uuid}
                  icon="check"
                  selected={form.amenityUuids.includes(a.uuid)}
                  onPress={() =>
                    change(
                      'amenityUuids',
                      form.amenityUuids.includes(a.uuid)
                        ? form.amenityUuids.filter((id) => id !== a.uuid)
                        : [...form.amenityUuids, a.uuid],
                    )
                  }
                >
                  {a.name}
                </ToggleChip>
              ))}
            </View>
            <T className="font-bold">{t('Ambiente natural')}</T>
            <View className="flex-row flex-wrap gap-2">
              {options.data?.settings.map((a) => (
                <ToggleChip
                  key={a.uuid}
                  icon="forest"
                  selected={form.settingUuids.includes(a.uuid)}
                  onPress={() =>
                    change(
                      'settingUuids',
                      form.settingUuids.includes(a.uuid)
                        ? form.settingUuids.filter((id) => id !== a.uuid)
                        : [...form.settingUuids, a.uuid],
                    )
                  }
                >
                  {a.name}
                </ToggleChip>
              ))}
            </View>
          </Surface>
          <Surface>
            <Heading icon="photo_camera">
              {t('Fotos (')}
              {form.photos.length}/9)
            </Heading>
            <T>
              {t(
                'Selecione até 9 fotos e escolha a capa. As imagens serão salvas com qualidade de 70%, preservando boa visualização ao abrir. JPEG ou PNG, até 10 MB por foto.',
              )}
            </T>
            <View className="flex-row flex-wrap gap-3">
              {form.photos.map((p, i) => (
                <View key={p.url} style={{ width: '30%' }} className="gap-2">
                  <Photo
                    uri={
                      uploads.some((file) => file.uri === p.url) ? p.url : httpsPhoto(p.url) || ''
                    }
                    style={{ aspectRatio: 1 }}
                  />
                  <T className="text-xs">
                    {i === 0 ? t('Capa selecionada') : t('Foto {number}', { number: i + 1 })}
                  </T>
                  {i > 0 && (
                    <CTA
                      title={t('Capa')}
                      icon={null}
                      compact
                      outline
                      onPress={() =>
                        change('photos', [p, ...form.photos.filter((_, n) => n !== i)])
                      }
                    />
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Remover foto {number}', { number: i + 1 })}
                    onPress={() =>
                      change(
                        'photos',
                        form.photos.filter((_, n) => n !== i),
                      )
                    }
                  >
                    <T className="text-secondary">{t('Remover')}</T>
                  </Pressable>
                </View>
              ))}
            </View>
            {form.photos.length < 9 && (
              <CTA
                title={t('Selecionar fotos')}
                icon={null}
                outline
                disabled={busy}
                onPress={() => void addPhotos()}
              />
            )}
          </Surface>
        </View>
      </View>
      {editable && (
        <>
          {initialUuid && (
            <CTA
              title={busy ? t('Salvando...') : t('Salvar rascunho')}
              outline
              disabled={busy || uncertain || !options.data?.categories.length}
              onPress={() => void save(false)}
            />
          )}
          <CTA
            title={busy ? t('Enviando...') : t('Enviar para análise')}
            icon="send"
            disabled={busy || uncertain || !options.data?.categories.length}
            onPress={() => void save(true)}
          />
        </>
      )}
      {!editable && (
        <Notice>
          {status === 'pending_review'
            ? t('Seu camping está em análise. Aguarde a decisão antes de editar.')
            : status === 'published'
              ? t('Este camping está publicado. Você pode arquivá-lo para removê-lo da busca.')
              : t('Este camping está arquivado.')}
        </Notice>
      )}
      {uuid && status !== 'archived' && (
        <CTA
          title={t('Arquivar camping')}
          outline
          disabled={busy}
          onPress={() => setConfirmArchive(true)}
        />
      )}
      {confirmArchive && (
        <Surface>
          <T>
            {t('Arquivar este camping? Ele deixará de aparecer na busca e não poderá ser editado.')}
          </T>
          <CTA title={t('Confirmar arquivamento')} disabled={busy} onPress={() => void archive()} />
          <CTA
            title={t('Cancelar')}
            outline
            disabled={busy}
            onPress={() => setConfirmArchive(false)}
          />
        </Surface>
      )}
      {initialUuid && (
        <CTA
          title={t('Meus campings')}
          outline
          disabled={busy}
          onPress={() => router.replace('/campsite/mine')}
        />
      )}
    </>
  );
}
