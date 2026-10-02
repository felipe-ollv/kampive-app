import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { CTA, Page, SIcon, Surface, TopBar } from '../../components/stitch';
import { Notice, Photo, T } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { api, errorMessage } from '../../lib/api';
export default function Profile() {
  const { user, loading, busy, error, refresh, logout } = useAuth();
  const [country, setCountry] = useState('');
  const [actionError, setActionError] = useState('');
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );
  useEffect(() => {
    let active = true;
    setCountry('');
    if (user?.countryUuid)
      api
        .country(user.countryUuid)
        .then((c) => {
          if (active) setCountry(c.name);
        })
        .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user?.countryUuid]);
  async function signOut() {
    setActionError('');
    try {
      await logout();
      router.replace('/login');
    } catch (e) {
      setActionError(errorMessage(e));
    }
  }
  return (
    <Page header={<TopBar />}>
      {loading && <T>Atualizando perfil...</T>}
      {error ? (
        <>
          <Notice error>{error}</Notice>
          <CTA title="Tentar novamente" onPress={() => void refresh()} disabled={loading} />
        </>
      ) : null}
      {user ? (
        <>
          <Surface className="items-center gap-5 p-6">
            {user.photoUrl?.startsWith('https://') ? (
              <Photo uri={user.photoUrl} className="h-28 w-28 rounded-full" />
            ) : (
              <View className="h-28 w-28 items-center justify-center rounded-full bg-surface-container">
                <SIcon name="person" size={48} />
              </View>
            )}
            <T
              accessibilityRole="header"
              className="font-display text-[28px] leading-[34px] text-primary"
            >
              {user.name}
            </T>
            {country ? <T>{country}</T> : null}
            <T>{user.email}</T>
            <T className="text-xs text-ink-variant">
              {user.emailVerified ? 'E-mail verificado' : 'E-mail ainda não verificado'}
            </T>
            {user.bio ? <T className="text-center">{user.bio}</T> : null}
          </Surface>
          <Surface>
            <T className="font-bold text-lg">Sua conta</T>
            <T>Notificações: {user.notificationsEnabled ? 'ativadas' : 'desativadas'}</T>
            <T className="text-xs text-ink-variant">
              A edição do perfil e da foto estará disponível em breve.
            </T>
            <CTA
              title={busy ? 'Saindo...' : 'Sair da conta'}
              outline
              icon="logout"
              disabled={busy}
              onPress={() => void signOut()}
            />
          </Surface>
          {actionError ? <Notice error>{actionError}</Notice> : null}
        </>
      ) : !loading && !error ? (
        <Surface>
          <T className="font-bold text-xl">Seu perfil Kampive</T>
          <T>Entre na sua conta para consultar seu perfil.</T>
          <CTA title="Entrar" onPress={() => router.push('/login')} />
          <CTA title="Criar conta" outline onPress={() => router.push('/register')} />
        </Surface>
      ) : null}
    </Page>
  );
}
