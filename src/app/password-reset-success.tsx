import { useTranslation } from '../lib/i18n';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { CTA, Page, Surface, TopBar } from '../components/stitch';
import { T } from '../components/ui';
import { useAuth } from '../lib/auth';

export default function PasswordResetSuccess() {
  const { t } = useTranslation();
  const { clearSession, user } = useAuth();
  useEffect(() => {
    clearSession();
  }, [clearSession]);
  return (
    <Page texture header={<TopBar mode="login" />}>
      <Surface>
        <T className="font-bold text-2xl text-primary">{t('Sua senha foi alterada')}</T>
        <T>{t('Entre novamente com sua nova senha. Os acessos anteriores foram encerrados.')}</T>
        <CTA
          title={t('Voltar ao login')}
          disabled={!!user}
          onPress={() => router.replace('/login')}
        />
      </Surface>
    </Page>
  );
}
