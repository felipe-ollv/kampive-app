import { router } from 'expo-router';
import { View } from 'react-native';
import { CampsiteCard } from '../../components/campsite-card';
import { Page, TopBar } from '../../components/stitch';
import { Empty, T } from '../../components/ui';
import { campsites } from '../../data/campsites';
import { useStore } from '../../lib/store';
export default function Saved() {
  const { saved } = useStore();
  return (
    <Page header={<TopBar />}>
      <View className="gap-1">
        <T className="font-bold text-[10px] uppercase tracking-wider text-secondary">
          Próximas aventuras
        </T>
        <T className="font-bold text-[26px] leading-[32px] text-primary">Campings Salvos</T>
      </View>
      {saved.length ? (
        campsites
          .filter((c) => saved.includes(c.id))
          .map((c) => <CampsiteCard key={c.id} campsite={c} />)
      ) : (
        <Empty
          title="Guarde seus próximos destinos"
          text="Toque no coração de um camping para salvá-lo aqui."
          action={() => router.navigate('/')}
        />
      )}
    </Page>
  );
}
