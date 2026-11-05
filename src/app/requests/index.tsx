import { useTranslation } from '../../lib/i18n';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Back, CTA, Page, Surface, TopBar } from '../../components/stitch';
import { Notice, T } from '../../components/ui';
import { useApiPage } from '../../hooks/use-api-page';
import { api } from '../../lib/api';
import { requestDate, requestStatusLabel, requestTypeLabel } from '../../lib/request-display';

export default function Requests() {
  const { t, locale } = useTranslation();
  const result = useApiPage(
    useCallback((page: number) => api.myRequests(page), []),
    false,
  );
  const { reload } = result;
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  return (
    <Page header={<TopBar />}>
      <Back />
      <View className="gap-2">
        <T className="font-bold text-2xl text-primary">{t('Minhas solicitações')}</T>
        <T>
          {t('Acompanhe suas indicações de campings e seus pedidos de vínculo de proprietário.')}
        </T>
      </View>
      {result.loading && <T>{t('Carregando solicitações...')}</T>}
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
      {!result.loading && !result.error && result.data?.totalElements === 0 && (
        <Surface>
          <T className="font-bold text-lg">{t('Você ainda não enviou solicitações')}</T>
          <T>{t('Conhece um camping? Envie uma indicação para nossa equipe analisar.')}</T>
          <CTA
            title={t('Indicar camping')}
            icon="add_location_alt"
            onPress={() => router.push('/campsite/suggest')}
          />
        </Surface>
      )}
      {result.data?.items.map((item) => (
        <Surface key={`${item.type}:${item.uuid}`}>
          <T className="text-xs text-ink-variant">
            {t(requestTypeLabel[item.type])} · {requestDate(item.createdAt, locale)}
          </T>
          <T className="font-bold text-lg text-primary">{item.name}</T>
          <View className="self-start rounded-full bg-surface-container px-3 py-1.5">
            <T className="font-semibold text-xs text-primary">
              {t(requestStatusLabel[item.status])}
            </T>
          </View>
          <CTA
            title={t('Ver detalhes')}
            outline
            onPress={() =>
              router.push({
                pathname: '/requests/[type]/[id]',
                params: { type: item.type, id: item.uuid },
              })
            }
          />
        </Surface>
      ))}
      {result.data && result.data.page + 1 < result.data.totalPages && (
        <CTA
          title={t('Carregar mais')}
          outline
          disabled={result.loading}
          onPress={result.loadMore}
        />
      )}
    </Page>
  );
}
