import { useTranslation } from '../../lib/i18n';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Back, CTA, Page } from '../../components/stitch';
import { T } from '../../components/ui';
import { CampsiteEditor } from '../../components/campsite-editor';
import { useAuth } from '../../lib/auth';
export default function Create() {
  const { t } = useTranslation();
  const { uuid } = useLocalSearchParams<{ uuid?: string }>();
  const { user, loading } = useAuth();
  return (
    <Page
      header={
        <View className="flex-row items-center gap-3 p-4">
          <Back />
          <T className="font-bold text-lg">
            {uuid ? t('Gerenciar camping') : t('Cadastrar camping')}
          </T>
        </View>
      }
    >
      {loading ? (
        <T>{t('Verificando sessão...')}</T>
      ) : user ? (
        <CampsiteEditor key={`${user.uuid}:${uuid || 'new'}`} initialUuid={uuid} />
      ) : (
        <>
          <T>
            {t('Entre na sua conta para cadastrar um camping ou gerenciar um vínculo aprovado.')}
          </T>
          <CTA title={t('Entrar')} onPress={() => router.push('/login')} />
        </>
      )}
    </Page>
  );
}
