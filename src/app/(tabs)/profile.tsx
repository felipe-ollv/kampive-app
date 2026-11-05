import { LanguageSettings } from '../../components/language-settings';
import { useTranslation } from '../../lib/i18n';
import { ReviewsList } from '../../components/reviews-list';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { CTA, Page, SIcon, Surface, TopBar } from '../../components/stitch';
import { profilePhoto, travelStyles } from '../../lib/profile';
import { Notice, Photo, T } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { api, errorMessage } from '../../lib/api';
export default function Profile() {
  const { t } = useTranslation();
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
      {loading && <T>{t('Atualizando perfil...')}</T>}
      {error ? (
        <>
          <Notice error>{error}</Notice>
          <CTA title={t('Tentar novamente')} onPress={() => void refresh()} disabled={loading} />
        </>
      ) : null}
      {user ? (
        <>
          <Surface className="items-center gap-5 p-6">
            {profilePhoto(user.photoUrl) ? (
              <Photo uri={profilePhoto(user.photoUrl)!} className="h-28 w-28 rounded-full" />
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
            <T className="text-center text-ink-variant">
              {[user.cityName, user.divisionName, user.countryName || country]
                .filter(Boolean)
                .join(' · ') || t('Localização não informada')}
            </T>
            <T className="text-center">
              {user.bio || t('Conte um pouco sobre você na sua apresentação.')}
            </T>
            <View className="gap-2 items-center">
              <T className="font-bold">{t('Estilos de viagem')}</T>
              <View className="flex-row flex-wrap justify-center gap-2">
                {travelStyles
                  .filter((style) => user.travelStyles?.includes(style.value))
                  .map((style) => (
                    <T
                      key={style.value}
                      className="rounded-full bg-surface-container px-3 py-2 text-xs"
                    >
                      {t(style.label)}
                    </T>
                  ))}
              </View>
              {!user.travelStyles?.length && (
                <T className="text-xs text-ink-variant">{t('Nenhum estilo selecionado')}</T>
              )}
            </View>
            <CTA
              title={t('Editar perfil')}
              icon="edit"
              outline
              onPress={() => router.push('/profile/edit')}
            />
          </Surface>
          <LanguageSettings />
          <CampingActions key={user.uuid} />
          <Surface>
            <T className="font-bold text-lg">{t('Minhas avaliações')}</T>
            <ReviewsList key={user.uuid} />
          </Surface>
          <Surface>
            <T className="font-bold text-lg">{t('Sua conta')}</T>
            <CTA
              title={busy ? t('Saindo...') : t('Sair da conta')}
              outline
              icon="logout"
              disabled={busy}
              onPress={() => void signOut()}
            />
            <CTA
              title={t('Excluir conta')}
              outline
              disabled={busy}
              onPress={() => router.push('/profile/delete')}
            />
          </Surface>
          {actionError ? <Notice error>{actionError}</Notice> : null}
        </>
      ) : !loading && !error ? (
        <Surface>
          <T className="font-bold text-xl">{t('Seu perfil Kampive')}</T>
          <T>{t('Entre na sua conta para consultar seu perfil.')}</T>
          <CTA title={t('Entrar')} onPress={() => router.push('/login')} />
          <CTA title={t('Criar conta')} outline onPress={() => router.push('/register')} />
        </Surface>
      ) : null}
    </Page>
  );
}

function CampingActions() {
  const { t } = useTranslation();
  return (
    <Surface>
      <T className="font-bold text-lg">{t('Campings')}</T>
      <CTA title={t('Minhas solicitações')} outline onPress={() => router.push('/requests')} />
      <CTA title={t('Meus campings')} outline onPress={() => router.push('/campsite/mine')} />
      <CTA
        title={t('Indicar camping')}
        icon="add_location_alt"
        outline
        onPress={() => router.push('/campsite/suggest')}
      />
      <CTA
        title={t('Cadastrar camping')}
        icon="add"
        onPress={() => router.push('/campsite/create')}
      />
    </Surface>
  );
}
