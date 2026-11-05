import { useTranslation } from '../../lib/i18n';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { useApiPage } from '../../hooks/use-api-page';
import { CampsiteCard } from '../../components/campsite-card';
import { Back, CTA, Page, TopBar } from '../../components/stitch';
import { Notice, T } from '../../components/ui';
export default function Mine() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  return (
    <Page header={<TopBar />}>
      <Back />
      <T className="font-bold text-2xl">{t('Meus campings')}</T>
      {loading ? (
        <T>{t('Verificando sessão...')}</T>
      ) : user ? (
        <Owned key={user.uuid} />
      ) : (
        <>
          <T>{t('Entre para gerenciar seus campings.')}</T>
          <CTA title={t('Entrar')} onPress={() => router.push('/login')} />
        </>
      )}
    </Page>
  );
}
function Owned() {
  const { t } = useTranslation();
  const result = useApiPage(
    useCallback((page: number) => api.myCampsites(page), []),
    false,
  );
  const reload = result.reload;
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  return (
    <>
      <CTA
        title={t('Indicar um camping')}
        icon="add"
        onPress={() => router.push('/campsite/suggest')}
      />
      {result.loading && <T>{t('Carregando seus campings...')}</T>}
      {!!result.error && (
        <>
          <Notice error>{result.error}</Notice>
          <CTA title={t('Tentar novamente')} onPress={() => void result.reload()} />
        </>
      )}
      {!result.loading && !result.error && !result.data?.items.length && (
        <T>
          {t(
            'Você ainda não tem um camping com vínculo aprovado. Para solicitar um vínculo, abra o camping e toque em “Sou proprietário deste camping”.',
          )}
        </T>
      )}
      <View className="gap-4">
        {result.data?.items.map((c) => (
          <CampsiteCard key={c.uuid} campsite={c} owned />
        ))}
      </View>
      {result.data && result.data.page + 1 < result.data.totalPages && (
        <CTA
          title={t('Carregar mais')}
          outline
          disabled={result.loading}
          onPress={result.loadMore}
        />
      )}
    </>
  );
}
