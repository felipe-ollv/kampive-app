import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { C, Page, SIcon, ToggleChip, TopBar } from '../../components/stitch';
import { T } from '../../components/ui';
import { useStore } from '../../lib/store';

const filters = ['Todas', 'Não lidas', 'Lidas'] as const;

export default function Notifications() {
  const { inbox, setNotificationRead, markAllNotificationsRead } = useStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>('Todas');
  const unread = inbox.filter((item) => !item.read).length;
  const visible = inbox
    .filter((item) => filter === 'Todas' || (filter === 'Lidas' ? item.read : !item.read))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Page header={<TopBar />}>
      <View className="gap-1">
        <T className="font-bold text-[10px] uppercase tracking-wider text-secondary">
          Fique por dentro
        </T>
        <T className="font-bold text-[26px] leading-[32px] text-primary">Notificações</T>
        <T className="text-sm text-ink-variant" accessibilityLiveRegion="polite">
          {unread
            ? `Você tem ${unread} ${unread === 1 ? 'notificação não lida' : 'notificações não lidas'}.`
            : 'Você está em dia com suas novidades.'}
        </T>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        {filters.map((option) => (
          <ToggleChip
            key={option}
            icon={option === 'Lidas' ? 'check_circle' : 'notifications'}
            selected={filter === option}
            onPress={() => setFilter(option)}
          >
            {option}
          </ToggleChip>
        ))}
      </ScrollView>
      {unread > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={markAllNotificationsRead}
          className="min-h-11 flex-row items-center justify-end gap-2"
        >
          <SIcon name="checklist" size={18} color={C.secondary} />
          <T className="font-bold text-xs text-secondary">Marcar todas como lidas</T>
        </Pressable>
      )}
      <View className="gap-3">
        {visible.map((item) => (
          <View
            key={item.id}
            className={`gap-3 rounded-2xl border p-4 ${item.read ? 'border-line bg-white' : 'border-[#c1c8c3] bg-[#edf3ed]'}`}
          >
            <View className="flex-row items-start gap-3">
              <View
                className={`h-10 w-10 items-center justify-center rounded-full ${item.read ? 'bg-surface-container' : 'bg-[#caeada]'}`}
              >
                <SIcon
                  name={item.read ? 'check_circle' : 'notifications'}
                  size={22}
                  color={C.primary}
                />
              </View>
              <View className="flex-1 gap-1">
                <View className="flex-row items-center justify-between gap-2">
                  <T className="text-[10px] leading-4 text-ink-variant">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </T>
                  <T
                    className={`font-bold text-[10px] leading-4 ${item.read ? 'text-ink-variant' : 'text-secondary'}`}
                  >
                    {item.read ? 'Lida' : '● Não lida'}
                  </T>
                </View>
                <T className="font-bold text-sm leading-5 text-primary">{item.title}</T>
              </View>
            </View>
            <T className="text-sm leading-5 text-ink-variant">{item.message}</T>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.read ? 'Marcar como não lida' : 'Marcar como lida'}: ${item.title}`}
              onPress={() => setNotificationRead(item.id, !item.read)}
              className="min-h-11 justify-center self-start"
            >
              <T className="font-bold text-xs text-secondary">
                {item.read ? 'Marcar como não lida' : 'Marcar como lida'}
              </T>
            </Pressable>
          </View>
        ))}
        {visible.length === 0 && (
          <View className="items-center gap-3 rounded-2xl bg-surface-container px-6 py-10">
            <SIcon name="notifications" size={32} />
            <T className="text-center font-bold text-lg text-primary">
              {filter === 'Não lidas' ? 'Tudo em dia!' : 'Nenhuma notificação por aqui'}
            </T>
            <T className="text-center text-sm text-ink-variant">
              {filter === 'Não lidas'
                ? 'Você já leu todas as suas notificações.'
                : 'As notificações desta categoria aparecerão aqui.'}
            </T>
          </View>
        )}
      </View>
    </Page>
  );
}
