import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, SIcon, type SymbolName } from '../../components/stitch';
import { useStore } from '../../lib/store';
const tabs: { name: string; title: string; icon: SymbolName }[] = [
  { name: 'index', title: 'Explorar', icon: 'camping' },
  { name: 'countries', title: 'Países', icon: 'public' },
  { name: 'saved', title: 'Salvos', icon: 'favorite' },
  { name: 'notifications', title: 'Notificações', icon: 'notifications' },
  { name: 'profile', title: 'Perfil', icon: 'person' },
];
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { inbox } = useStore();
  const unreadCount = inbox.filter((item) => !item.read).length;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.secondary,
        tabBarInactiveTintColor: C.primary,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopWidth: 0,
          height: 72 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          shadowColor: C.forest,
          shadowOpacity: 0.07,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: 10,
          letterSpacing: 0.4,
          marginTop: 4,
        },
        sceneStyle: { backgroundColor: C.surface },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarBadge: t.name === 'notifications' && unreadCount > 0 ? unreadCount : undefined,
            tabBarBadgeStyle: { backgroundColor: C.secondary, color: '#fff', fontSize: 10 },
            tabBarIcon: ({ color }) => <SIcon name={t.icon} color={color} size={24} />,
          }}
        />
      ))}
    </Tabs>
  );
}
