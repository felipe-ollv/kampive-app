import { useTranslation } from '../../lib/i18n';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Back, CTA, Input, Page, Surface } from '../../components/stitch';
import { Notice, T } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { errorMessage } from '../../lib/api';

export default function DeleteAccount() {
  const { t } = useTranslation();
  const { user, deleteAccount, busy } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const lock = useRef(false);
  async function remove() {
    if (lock.current || busy || confirmation !== 'EXCLUIR' || !password) return;
    lock.current = true;
    setError('');
    try {
      await deleteAccount(password);
      setPassword('');
      router.replace('/login');
    } catch (e) {
      setError(errorMessage(e));
      setPassword('');
    } finally {
      lock.current = false;
    }
  }
  return (
    <Page
      header={
        <View className="flex-row items-center gap-3 p-4">
          <Back />
          <T className="font-bold text-lg">{t('Excluir conta')}</T>
        </View>
      }
    >
      {user ? (
        <Surface>
          <T className="font-bold text-xl">{t('Deseja excluir sua conta?')}</T>
          <T>
            {t(
              'Seu nome, e-mail, foto, localização, apresentação e estilos de viagem serão removidos. Seu acesso será encerrado e seus favoritos e notificações serão removidos.',
            )}
          </T>
          <T>
            {t(
              'Campings e contribuições já enviados permanecerão associados a “Conta excluída”. Registros de aceite dos termos serão preservados.',
            )}
          </T>
          <Notice error>{t('Esta ação não pode ser desfeita.')}</Notice>
          <Input
            label={t('Senha atual')}
            password
            autoCapitalize="none"
            value={password}
            maxLength={128}
            editable={!busy}
            onChangeText={setPassword}
          />
          <Input
            label={t('Digite EXCLUIR para confirmar')}
            autoCapitalize="characters"
            autoCorrect={false}
            value={confirmation}
            editable={!busy}
            onChangeText={setConfirmation}
          />
          {!!error && <Notice error>{error}</Notice>}
          <CTA
            title={busy ? t('Excluindo...') : t('Excluir minha conta definitivamente')}
            color="#b3261e"
            disabled={busy || !password || confirmation !== 'EXCLUIR'}
            onPress={() => void remove()}
          />
          <CTA
            title={t('Manter minha conta')}
            outline
            disabled={busy}
            onPress={() => router.back()}
          />
        </Surface>
      ) : (
        <CTA title={t('Entrar')} onPress={() => router.replace('/login')} />
      )}
    </Page>
  );
}
