import { useTranslation } from '../../lib/i18n';
import { router, useLocalSearchParams } from 'expo-router';
import { Back, CTA, Page } from '../../components/stitch';
import { T } from '../../components/ui';
import { CampsiteSubmission } from '../../components/campsite-submission';
import { useAuth } from '../../lib/auth';
export default function Claim() {
  const { t } = useTranslation();
  const { uuid } = useLocalSearchParams<{ uuid?: string }>();
  const { user, loading } = useAuth();
  return (
    <Page>
      <Back />
      <T className="font-bold text-2xl">{t('Verificar propriedade')}</T>
      {!uuid ? (
        <T>{t('Abra um camping para solicitar seu vínculo.')}</T>
      ) : loading ? (
        <T>{t('Verificando sessão...')}</T>
      ) : user ? (
        <CampsiteSubmission key={`${user.uuid}:${uuid}`} campsiteUuid={uuid} />
      ) : (
        <>
          <T>{t('Entre na sua conta para solicitar a verificação.')}</T>
          <CTA title={t('Entrar')} onPress={() => router.push('/login')} />
        </>
      )}
    </Page>
  );
}
