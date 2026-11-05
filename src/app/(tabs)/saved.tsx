import { useTranslation } from '../../lib/i18n';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { CampsiteCard } from '../../components/campsite-card';
import { CTA, Page, TopBar } from '../../components/stitch';
import { Empty, Notice, T } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { api, errorMessage } from '../../lib/api';
import { useApiResource } from '../../hooks/use-api-resource';
export default function Saved() {
  const { t } = useTranslation();
  const { saved, toggleSaved, savedLoading, savedError, saving, refreshSaved } = useStore();
  const { user, loading, error: authError, refresh } = useAuth();
  const [actionError, setActionError] = useState('');
  useFocusEffect(
    useCallback(() => {
      void refreshSaved();
    }, [refreshSaved]),
  );
  async function remove(uuid: string) {
    setActionError('');
    try {
      await toggleSaved(uuid);
    } catch (e) {
      setActionError(errorMessage(e));
    }
  }
  const [visible, setVisible] = useState(10);
  return (
    <Page header={<TopBar />}>
      <View className="gap-1">
        <T className="text-xs text-secondary">{t('PRÓXIMAS AVENTURAS')}</T>
        <T className="font-bold text-[22px] text-primary">{t('Campings Salvos')}</T>
        <T>{t('Seus favoritos')}</T>
      </View>
      {(loading || savedLoading) && <T>{t('Carregando favoritos...')}</T>}
      {!!authError && (
        <>
          <Notice error>{authError}</Notice>
          <CTA title={t('Tentar novamente')} onPress={() => void refresh()} />
        </>
      )}
      {!user && !loading && !authError && (
        <>
          <T>{t('Entre para acessar os campings salvos na sua conta.')}</T>
          <CTA title={t('Entrar')} onPress={() => router.push('/login')} />
        </>
      )}
      {!!savedError && (
        <>
          <Notice error>{savedError}</Notice>
          <CTA title={t('Tentar novamente')} onPress={() => void refreshSaved()} />
        </>
      )}
      {!!actionError && <Notice error>{actionError}</Notice>}
      {user &&
        saved.slice(0, visible).map((uuid) => (
          <SavedItem
            key={uuid}
            uuid={uuid}
            remove={() => {
              if (!saving) void remove(uuid);
            }}
          />
        ))}
      {saved.length > visible && (
        <CTA title={t('Carregar mais salvos')} outline onPress={() => setVisible((n) => n + 10)} />
      )}
      {user && !savedLoading && !savedError && !saved.length && (
        <Empty
          title={t('Guarde seus próximos destinos')}
          text={t('Toque no coração de um camping para salvá-lo aqui.')}
          action={() => router.navigate('/')}
        />
      )}
    </Page>
  );
}
function SavedItem({ uuid, remove }: { uuid: string; remove: () => void }) {
  const { t } = useTranslation();
  const result = useApiResource(
    useCallback(() => api.campsite(uuid), [uuid]),
    false,
  );
  const { reload } = result;
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  return (
    <View className="gap-2">
      {result.loading && <T>{t('Carregando camping salvo...')}</T>}
      {result.error ? (
        <>
          <Notice error>{result.error}</Notice>
          <CTA title={t('Tentar novamente')} outline onPress={() => void result.reload()} />
          <CTA title={t('Remover item indisponível dos salvos')} outline onPress={remove} />
        </>
      ) : result.data ? (
        <CampsiteCard campsite={result.data.summary} />
      ) : null}
    </View>
  );
}
