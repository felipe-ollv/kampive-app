import { useTranslation } from '../lib/i18n';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { CTA, Input, Page, Surface, TopBar } from '../components/stitch';
import { Notice, T } from '../components/ui';
import { api, ApiError, errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { validateNewPassword, validRecoveryToken } from '../lib/password-recovery';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token?: string | string[] }>();
  return (
    <Page texture header={<TopBar mode="login" />}>
      <T className="font-bold text-2xl text-primary">{t('Definir nova senha')}</T>
      <ResetForm key={typeof token === 'string' ? token : 'invalid'} token={token} />
    </Page>
  );
}
function ResetForm({ token }: { token?: string | string[] }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(!validRecoveryToken(token));
  const [error, setError] = useState('');
  const lock = useRef(false);
  async function submit() {
    if (lock.current || !validRecoveryToken(token)) return;
    const problem = validateNewPassword(password, confirmation);
    if (problem) {
      setError(problem);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await api.resetPassword(token, password);
      setPassword('');
      setConfirmation('');
      router.replace('/password-reset-success');
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) {
        setInvalid(true);
        setPassword('');
        setConfirmation('');
      } else setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function requestAnother() {
    setError('');
    try {
      if (user) await logout();
      router.replace('/forgot-password');
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <Surface>
      {invalid ? (
        <>
          <Notice error>{t('Este link é inválido, expirou ou já foi utilizado.')}</Notice>
          <CTA title={t('Solicitar outro link')} onPress={() => void requestAnother()} />
        </>
      ) : (
        <>
          <T>{t('Use de 8 a 128 caracteres, incluindo uma letra maiúscula e um número.')}</T>
          <Input
            label={t('Nova senha')}
            password
            value={password}
            onChangeText={setPassword}
            maxLength={128}
            autoComplete="new-password"
            editable={!busy}
          />
          <Input
            label={t('Confirmar nova senha')}
            password
            value={confirmation}
            onChangeText={setConfirmation}
            maxLength={128}
            autoComplete="new-password"
            editable={!busy}
            onSubmitEditing={() => void submit()}
          />
          <CTA
            title={busy ? t('Salvando...') : t('Salvar nova senha')}
            disabled={busy}
            onPress={() => void submit()}
          />
        </>
      )}
      {!!error && <Notice error>{error}</Notice>}
    </Surface>
  );
}
