import { useTranslation } from '../lib/i18n';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { CTA, Input, Surface } from './stitch';
import { Notice, T } from './ui';
import { api, ApiError, errorMessage } from '../lib/api';
import { validateSuggestion } from '../lib/campsite-suggestion';

export function CampsiteSubmission({ campsiteUuid }: { campsiteUuid?: string }) {
  const { t } = useTranslation();
  const claim = !!campsiteUuid;
  const [name, setName] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const lock = useRef(false);
  async function send() {
    if (lock.current || receipt || uncertain) return;
    const suggestion = {
      name: name.trim(),
      instagramUrl: instagramUrl.trim(),
      googleMapsUrl: googleMapsUrl.trim(),
    };
    const problem = claim
      ? !contact.trim() || !notes.trim()
        ? t('Informe um contato e como podemos verificar seu vínculo.')
        : ''
      : validateSuggestion(suggestion);
    if (problem) {
      setError(problem);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const result = campsiteUuid
        ? await api.claimCampsite(campsiteUuid, { contact: contact.trim(), evidence: notes.trim() })
        : await api.suggestCampsite(suggestion);
      setReceipt(result.uuid);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 409
          ? t('Este camping não está disponível para solicitação de vínculo. Atualize os detalhes.')
          : errorMessage(e),
      );
      if (e instanceof ApiError && e.status === 0) setUncertain(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <Surface>
        <T className="font-bold text-xl">
          {claim ? t('Solicitação recebida') : t('Indicação recebida')}
        </T>
        <T>
          {claim
            ? t(
                'Nossa equipe analisará as informações e entrará em contato. A gestão será liberada somente após a aprovação do vínculo.',
              )
            : t(
                'Nossa equipe vai revisar sua indicação, cadastrar o camping e validar os dados antes de publicá-lo. A indicação não cria um vínculo de propriedade.',
              )}
        </T>
        <T selectable className="text-xs">
          {t('Protocolo:')}{' '}
          {receipt}
        </T>
        <CTA
          title={t('Acompanhar solicitação')}
          onPress={() =>
            router.replace({
              pathname: '/requests/[type]/[id]',
              params: { type: claim ? 'claim' : 'suggestion', id: receipt },
            })
          }
        />
      </Surface>
    );
  return (
    <Surface>
      <T>
        {claim
          ? t(
              'Informe como podemos entrar em contato e verificar que você é proprietário. Envie documentos apenas quando nossa equipe solicitar.',
            )
          : t(
              'Indique um camping com o perfil no Instagram, a localização no Google Maps e o nome. Você não precisa ser o proprietário; nossa equipe cuida do cadastro e da validação.',
            )}
      </T>
      <View
        pointerEvents={busy || uncertain ? 'none' : 'auto'}
        className="gap-4"
        accessibilityElementsHidden={false}
      >
        {!claim && (
          <>
            <Input
              label="URL do perfil no Instagram *"
              placeholder="https://www.instagram.com/seucamping/"
              value={instagramUrl}
              onChangeText={setInstagramUrl}
              maxLength={500}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!busy && !uncertain}
            />
            <Input
              label={t('Link da localização no Google Maps *')}
              placeholder="https://maps.app.goo.gl/..."
              value={googleMapsUrl}
              onChangeText={setGoogleMapsUrl}
              maxLength={2000}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!busy && !uncertain}
            />
            <Input
              label={t('Nome do camping *')}
              value={name}
              onChangeText={setName}
              maxLength={180}
              editable={!busy && !uncertain}
            />
          </>
        )}
        {claim && (
          <>
            <Input
              label={t('Seu telefone ou e-mail para contato *')}
              value={contact}
              onChangeText={setContact}
              maxLength={500}
              autoCapitalize="none"
              editable={!busy && !uncertain}
            />
            <Input
              label={t('Como podemos verificar seu vínculo? *')}
              value={notes}
              onChangeText={setNotes}
              maxLength={4000}
              multiline
              editable={!busy && !uncertain}
            />
          </>
        )}
      </View>
      {!!error && <Notice error>{error}</Notice>}
      {uncertain && (
        <Notice>
          {t(
            'Não foi possível confirmar o recebimento. Consulte Minhas solicitações antes de tentar novamente.',
          )}
        </Notice>
      )}
      {uncertain && (
        <CTA
          title={t('Consultar minhas solicitações')}
          outline
          onPress={() => router.push('/requests')}
        />
      )}
      <CTA
        title={busy ? t('Enviando...') : claim ? t('Solicitar verificação') : t('Enviar indicação')}
        disabled={busy || uncertain}
        onPress={() => void send()}
      />
    </Surface>
  );
}
