import { useTranslation } from '../lib/i18n';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CTA, Page, Surface, TopBar } from '../components/stitch';
import { Notice, T } from '../components/ui';
import { api, errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function EmailVerification() {
  const { t, locale } = useTranslation();
  const { user, refresh } = useAuth();
  const [status, setStatus] = useState<Awaited<ReturnType<typeof api.verificationStatus>> | null>(
    null,
  );
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const lock = useRef(false);
  const load = useCallback(async () => {
    if (!user) return;
    try {
      setStatus(await api.verificationStatus());
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [user]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!remaining) return;
    const timer = setTimeout(() => setRemaining((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);
  async function resend() {
    if (lock.current || remaining) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api.resendVerification();
      setRemaining(60);
      setMessage(
        t('Solicitação recebida. Confira sua caixa de entrada e o spam. Use o link mais recente.'),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function check() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await refresh();
      const current = await api.verificationStatus();
      setStatus(current);
      setMessage(
        current.verified
          ? t('Seu e-mail está confirmado.')
          : t(
              'A confirmação ainda está pendente. Abra o link recebido e toque em Confirmar e-mail.',
            ),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Page texture header={<TopBar mode="login" />}>
      <T className="font-bold text-2xl text-primary">
        {status?.verified ? t('E-mail confirmado') : t('Confirme seu e-mail')}
      </T>
      <Surface>
        <T>
          {user
            ? t('Enviaremos a confirmação para {email}.', { email: user.email })
            : t(
                'Sua conta pode ser acessada normalmente. Entre para acompanhar a confirmação e solicitar outro e-mail.',
              )}
        </T>
        {!status?.verified && (
          <T>
            {t(
              'Confirme seu e-mail para avaliar, indicar e reivindicar campings. O link vale 24 horas.',
            )}
          </T>
        )}
        {status && !status.verified && status.contributionsAllowed && status.requiredAt && (
          <Notice>
            {t('Você pode continuar contribuindo até')}{' '}
            {new Date(status.requiredAt).toLocaleDateString(locale)}
            {t('. Confirme seu e-mail antes dessa data.')}
          </Notice>
        )}
        {status && !status.deliveryAvailable && !status.verified && (
          <Notice>
            {t('O envio está temporariamente indisponível. Tente novamente mais tarde.')}
          </Notice>
        )}
        {!!message && <Notice>{message}</Notice>}
        {!!error && <Notice error>{error}</Notice>}
        {user ? (
          <>
            {!status?.verified && (
              <CTA
                title={
                  busy
                    ? t('Aguarde...')
                    : remaining
                      ? t('Reenviar em {seconds}s', { seconds: remaining })
                      : t('Enviar confirmação')
                }
                disabled={busy || remaining > 0 || !status?.deliveryAvailable}
                onPress={() => void resend()}
              />
            )}
            {!status?.verified && (
              <CTA
                title={t('Já confirmei meu e-mail')}
                outline
                disabled={busy}
                onPress={() => void check()}
              />
            )}
            <CTA title={t('Continuar no app')} outline onPress={() => router.replace('/(tabs)')} />
          </>
        ) : (
          <CTA title={t('Entrar na minha conta')} onPress={() => router.replace('/login')} />
        )}
      </Surface>
    </Page>
  );
}
