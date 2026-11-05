import { useTranslation } from '../lib/i18n';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { CTA, Page, Surface, TopBar } from '../components/stitch';
import { T } from '../components/ui';
import { useAuth } from '../lib/auth';
export default function EmailVerified() {
  const { t } = useTranslation();
  const { user, refresh } = useAuth();
  const uuid = user?.uuid;
  useEffect(() => {
    if (uuid) void refresh();
  }, [uuid, refresh]);
  return (
    <Page texture header={<TopBar mode="login" />}>
      <Surface>
        <T className="font-bold text-2xl text-primary">{t('E-mail confirmado')}</T>
        <T>{t('A conta vinculada ao link já pode participar da comunidade Kampive.')}</T>
        <CTA
          title={user ? t('Continuar no app') : t('Entrar na minha conta')}
          onPress={() => router.replace(user ? '/(tabs)' : '/login')}
        />
      </Surface>
    </Page>
  );
}
