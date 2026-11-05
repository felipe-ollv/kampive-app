import { useTranslation } from '../../lib/i18n';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { CTA, Page, Surface, ToggleChip, TopBar } from '../../components/stitch';
import { Notice, T } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useAuth } from '../../lib/auth';
import { api, errorMessage } from '../../lib/api';
import { useApiPage } from '../../hooks/use-api-page';

export default function Notifications() {
  const { t } = useTranslation();
  const { user, loading, error, refresh } = useAuth();
  return (
    <Page header={<TopBar />}>
      <T className="font-bold text-[26px] text-primary">{t('Notificações')}</T>
      {user ? (
        <Inbox key={user.uuid} />
      ) : loading ? (
        <T>{t('Carregando conta...')}</T>
      ) : error ? (
        <>
          <Notice error>{error}</Notice>
          <CTA title={t('Tentar novamente')} onPress={() => void refresh()} />
        </>
      ) : (
        <>
          <T>{t('Entre para consultar suas notificações.')}</T>
          <CTA title={t('Entrar')} onPress={() => router.push('/login')} />
        </>
      )}
    </Page>
  );
}
function Inbox() {
  const { t, locale } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const lock = useRef(false);
  const { unreadCount, refreshUnread } = useStore();
  const result = useApiPage(
    useCallback((page: number) => api.notifications(page, filter), [filter]),
    false,
  );
  const { reload } = result;
  useFocusEffect(
    useCallback(() => {
      void reload();
      void refreshUnread();
    }, [reload, refreshUnread]),
  );
  async function mutate(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setActionError('');
    try {
      await action();
      await Promise.all([reload(), refreshUnread()]);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <T>
        {unreadCount
          ? t(
              unreadCount === 1 ? '{count} notificação não lida' : '{count} notificações não lidas',
              { count: unreadCount },
            )
          : t('Suas novidades aparecem aqui.')}
      </T>
      <View className="flex-row flex-wrap gap-2">
        {(
          [
            { value: 'all', label: t('Todas') },
            { value: 'unread', label: t('Não lidas') },
            { value: 'read', label: t('Lidas') },
          ] as const
        ).map((item) => (
          <ToggleChip
            icon="notifications"
            key={item.value}
            selected={filter === item.value}
            onPress={() => {
              if (!busy) setFilter(item.value);
            }}
          >
            {item.label}
          </ToggleChip>
        ))}
      </View>
      {unreadCount > 0 && (
        <CTA
          title={t('Marcar todas como lidas')}
          outline
          disabled={busy || result.loading}
          onPress={() => void mutate(api.readAllNotifications)}
        />
      )}
      {!!actionError && <Notice error>{actionError}</Notice>}
      {result.loading && <T>{t('Carregando notificações...')}</T>}
      {!!result.error && (
        <>
          <Notice error>{result.error}</Notice>
          <CTA
            title={t('Tentar novamente')}
            onPress={() => void reload()}
            disabled={result.loading}
          />
        </>
      )}
      {result.data?.items.map((item) => (
        <Surface key={item.uuid}>
          <T className="text-xs">
            {new Date(item.date).toLocaleDateString(locale)} ·{' '}
            {item.read ? t('Lida') : t('Não lida')}
          </T>
          <T className="font-bold text-lg text-primary">{item.title}</T>
          <T>{item.message}</T>
          {item.requestUuid &&
            (item.requestType === 'suggestion' || item.requestType === 'claim') && (
              <CTA
                title={t('Ver solicitação')}
                onPress={() =>
                  router.push({
                    pathname: '/requests/[type]/[id]',
                    params: { type: item.requestType!, id: item.requestUuid! },
                  })
                }
              />
            )}
          <CTA
            title={item.read ? t('Marcar como não lida') : t('Marcar como lida')}
            outline
            disabled={busy || result.loading}
            onPress={() => void mutate(() => api.setNotificationRead(item.uuid, !item.read))}
          />
        </Surface>
      ))}
      {!result.loading && !result.error && result.data?.totalElements === 0 && (
        <T>{t('Nenhuma notificação nesta categoria.')}</T>
      )}
      {result.data && result.data.page + 1 < result.data.totalPages && (
        <CTA
          title={t('Carregar mais')}
          outline
          disabled={busy || result.loading}
          onPress={result.loadMore}
        />
      )}
    </>
  );
}
