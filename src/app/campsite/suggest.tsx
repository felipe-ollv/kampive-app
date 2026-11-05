import { useTranslation } from '../../lib/i18n';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Back, CTA, Page } from '../../components/stitch';
import { T } from '../../components/ui';
import { CampsiteSubmission } from '../../components/campsite-submission';
import { useAuth } from '../../lib/auth';

export default function Suggest() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  return (
    <Page
      header={
        <View className="flex-row items-center gap-3 p-4">
          <Back />
          <T className="font-bold text-lg">{t('Indicar camping')}</T>
        </View>
      }
    >
      {loading ? (
        <T>{t('Verificando sessão...')}</T>
      ) : user ? (
        <CampsiteSubmission key={user.uuid} />
      ) : (
        <>
          <T>{t('Entre na sua conta para indicar um camping.')}</T>
          <CTA title={t('Entrar')} onPress={() => router.push('/login')} />
        </>
      )}
    </Page>
  );
}
