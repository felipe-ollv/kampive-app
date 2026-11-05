import { useTranslation } from '../../lib/i18n';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Back, CTA, Input, Page, Surface, TopBar } from '../../components/stitch';
import { Notice, T } from '../../components/ui';
import { isEmail } from '../../components/forms';
import { api, ApiError, errorMessage } from '../../lib/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  async function submit() {
    if (lock.current) return;
    if (!isEmail(email.trim())) {
      setError('Informe um e-mail válido.');
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await api.requestPasswordRecovery(email);
      setDone(true);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 503
          ? t(
              'A recuperação por e-mail está temporariamente indisponível. Tente novamente mais tarde.',
            )
          : errorMessage(e),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Page texture header={<TopBar mode="login" />}>
      <Back />
      <T className="font-bold text-2xl text-primary">{t('Recuperar senha')}</T>
      <Surface>
        {done ? (
          <>
            <T className="font-bold text-lg">{t('Solicitação recebida')}</T>
            <T>
              {t(
                'Se esse e-mail estiver associado a uma conta ativa, você receberá um link para redefinir sua senha. Confira também a caixa de spam.',
              )}
            </T>
            <CTA title={t('Voltar ao login')} onPress={() => router.replace('/login')} />
            <CTA
              title={t('Usar outro e-mail')}
              outline
              onPress={() => {
                setDone(false);
                setEmail('');
              }}
            />
          </>
        ) : (
          <>
            <T>{t('Informe o e-mail da sua conta para solicitar um link de recuperação.')}</T>
            <Input
              label="E-mail"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              maxLength={254}
              editable={!busy}
              onSubmitEditing={() => void submit()}
            />
            {!!error && <Notice error>{error}</Notice>}
            <CTA
              title={busy ? t('Solicitando...') : t('Solicitar recuperação')}
              disabled={busy}
              onPress={() => void submit()}
            />
          </>
        )}
      </Surface>
    </Page>
  );
}
