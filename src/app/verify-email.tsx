import { useTranslation } from '../lib/i18n';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { CTA, Page, Surface, TopBar } from '../components/stitch';
import { Notice, T } from '../components/ui';
import { api, ApiError, errorMessage } from '../lib/api';
import { validRecoveryToken } from '../lib/password-recovery';

export default function VerifyEmail() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token?: string | string[] }>();
  return (
    <Page texture header={<TopBar mode="login" />}>
      <T className="font-bold text-2xl text-primary">{t('Confirmar e-mail')}</T>
      <Confirm key={typeof token === 'string' ? token : 'invalid'} token={token} />
    </Page>
  );
}
function Confirm({ token }: { token?: string | string[] }) {
  const { t } = useTranslation();
  const [invalid, setInvalid] = useState(!validRecoveryToken(token));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  async function confirm() {
    if (lock.current || !validRecoveryToken(token)) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await api.confirmEmail(token);
      router.replace('/email-verified');
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) setInvalid(true);
      else setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Surface>
      {invalid ? (
        <>
          <Notice error>{t('Este link é inválido, expirou ou já foi utilizado.')}</Notice>
          <CTA
            title={t('Solicitar outro link')}
            onPress={() => router.replace('/email-verification')}
          />
        </>
      ) : (
        <>
          <T>
            {t(
              'Toque abaixo para confirmar o e-mail da sua conta Kampive e participar da comunidade.',
            )}
          </T>
          <CTA
            title={busy ? t('Confirmando...') : t('Confirmar e-mail')}
            disabled={busy}
            onPress={() => void confirm()}
          />
        </>
      )}
      {!!error && <Notice error>{error}</Notice>}
    </Surface>
  );
}
