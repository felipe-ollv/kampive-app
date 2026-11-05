import { useTranslation } from '../../../lib/i18n';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Back, CTA, Page, Surface, TopBar } from '../../../components/stitch';
import { Notice, T } from '../../../components/ui';
import { useApiResource } from '../../../hooks/use-api-resource';
import { api, type RequestKind } from '../../../lib/api';
import { requestDate, requestStatusLabel, requestTypeLabel } from '../../../lib/request-display';

export default function RequestDetail() {
  const { t } = useTranslation();
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const valid = (type === 'suggestion' || type === 'claim') && typeof id === 'string';
  return (
    <Page header={<TopBar />}>
      <Back />
      <T className="font-bold text-2xl text-primary">{t('Detalhes da solicitação')}</T>
      {valid ? (
        <Details key={`${type}:${id}`} type={type} id={id} />
      ) : (
        <Notice error>{t('Solicitação não encontrada.')}</Notice>
      )}
    </Page>
  );
}
function Details({ type, id }: { type: RequestKind; id: string }) {
  const { t, locale } = useTranslation();
  const result = useApiResource(
    useCallback(() => api.myRequest(type, id), [type, id]),
    false,
  );
  const { reload } = result;
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  const data = result.data;
  return (
    <>
      {result.loading && <T>{t('Atualizando solicitação...')}</T>}
      {!!result.error && (
        <>
          <Notice error>{result.error}</Notice>
          <CTA
            title={t('Tentar novamente')}
            outline
            disabled={result.loading}
            onPress={() => void reload()}
          />
        </>
      )}
      {data && (
        <>
          <Surface>
            <T className="text-xs text-ink-variant">{t(requestTypeLabel[data.summary.type])}</T>
            <T className="font-bold text-xl text-primary">{data.summary.name}</T>
            <T className="font-semibold text-primary">
              {t(requestStatusLabel[data.summary.status])}
            </T>
            <T className="text-xs">
              {t('Enviada em')} {requestDate(data.summary.createdAt, locale)}
            </T>
            {!!data.summary.reviewedAt && (
              <T className="text-xs">
                {t('Analisada em')} {requestDate(data.summary.reviewedAt, locale)}
              </T>
            )}
            <T selectable className="text-xs text-ink-variant">
              {t('Protocolo:')}{' '}
              {data.summary.uuid}
            </T>
          </Surface>
          <Surface>
            <T className="font-bold text-lg text-primary">{t('Resposta da equipe')}</T>
            <T>
              {data.response?.trim() ||
                (data.summary.status === 'pending_review'
                  ? t(
                      'Sua solicitação está na fila de análise. O resultado aparecerá aqui e nas suas notificações.',
                    )
                  : t(
                      'A análise foi concluída. A equipe não adicionou uma mensagem complementar.',
                    ))}
            </T>
            {data.summary.type === 'suggestion' &&
              data.summary.status === 'accepted' &&
              !data.summary.publishedCampsiteUuid && (
                <T>
                  {t(
                    'A indicação foi aceita. O camping ainda não está disponível no catálogo público.',
                  )}
                </T>
              )}
          </Surface>
          <Surface>
            <T className="font-bold text-lg text-primary">{t('Dados enviados')}</T>
            <Field label={t('Nome do camping')} value={data.summary.name} />
            <Field label="Instagram" value={data.instagramUrl} />
            <Field label="Google Maps" value={data.googleMapsUrl} />
            <Field label={t('Contato')} value={data.contact} />
            <Field label={t('Informações para verificar o vínculo')} value={data.evidence} />
          </Surface>
          {!!data.summary.publishedCampsiteUuid && (
            <CTA
              title={t('Ver camping')}
              onPress={() =>
                router.push({
                  pathname: '/campsite/[id]',
                  params: { id: data.summary.publishedCampsiteUuid! },
                })
              }
            />
          )}
          {data.summary.type === 'claim' && data.summary.status === 'approved' && (
            <CTA title={t('Meus campings')} outline onPress={() => router.push('/campsite/mine')} />
          )}
        </>
      )}
    </>
  );
}
function Field({ label, value }: { label: string; value: string | null }) {
  return value ? (
    <View className="gap-1">
      <T className="font-semibold text-xs text-ink-variant">{label}</T>
      <T selectable>{value}</T>
    </View>
  ) : null;
}
