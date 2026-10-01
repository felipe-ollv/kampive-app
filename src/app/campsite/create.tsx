import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import {
  Back,
  C,
  CTA,
  Heading,
  Input,
  Page,
  SIcon,
  Surface,
  ToggleChip,
  type SymbolName,
} from '../../components/stitch';
import { Notice, T } from '../../components/ui';
import { Dialog, isHttpsUrl } from '../../components/forms';
import { UploadPhotos } from '../../components/stitch-forms';
import { stitchImages } from '../../data/stitch-images';
import { useStore } from '../../lib/store';
const kinds: { text: string; icon: SymbolName }[] = [
  { text: 'Camping Tradicional', icon: 'camping' },
  { text: 'Glamping & Cabana', icon: 'cabin' },
  { text: 'Vans & Motorhome', icon: 'rv_hookup' },
  { text: 'Camping Selvagem', icon: 'forest' },
];
const features: { text: string; icon: SymbolName }[] = [
  { text: 'Energia (110V/220V)', icon: 'bolt' },
  { text: 'Água Potável', icon: 'water_drop' },
  { text: 'Chuveiro Quente', icon: 'shower' },
  { text: 'Cozinha Comunitária', icon: 'soup_kitchen' },
  { text: 'Wi-Fi / Starlink', icon: 'wifi' },
  { text: 'Aceita Pets', icon: 'pets' },
  { text: 'Área de Fogueira', icon: 'local_fire_department' },
  { text: 'Acesso 4x4 apenas', icon: 'terrain' },
];
export default function Create() {
  const { addSpace } = useStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(kinds[0].text);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [maps, setMaps] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [price, setPrice] = useState('75');
  const [amenities, setAmenities] = useState([
    'Energia (110V/220V)',
    'Água Potável',
    'Chuveiro Quente',
    'Wi-Fi / Starlink',
  ]);
  const [photos, setPhotos] = useState(stitchImages.create);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const submitted = useRef(false);
  function submit() {
    const coords = maps.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    const validCoords =
      coords && Math.abs(Number(coords[1])) <= 90 && Math.abs(Number(coords[2])) <= 180;
    const ig = instagram.trim().replace(/^https?:\/\//, '');
    const money = Number(price.replace(',', '.'));
    if (
      name.trim().length < 3 ||
      state.trim().length < 2 ||
      city.trim().length < 2 ||
      !/^(@[\w.]+|(?:www\.)?instagram\.com\/[\w.]+\/?)/.test(ig) ||
      (!isHttpsUrl(maps) && !validCoords) ||
      whatsapp.replace(/\D/g, '').length < 10 ||
      photos.length === 0 ||
      !Number.isFinite(money) ||
      money < 0 ||
      (website && !isHttpsUrl(website))
    ) {
      setError(
        'Confira nome, estado, cidade, Instagram, localização, WhatsApp e fotos. Use um valor de diária válido e links HTTPS.',
      );
      return;
    }
    if (submitted.current) return;
    submitted.current = true;
    addSpace({
      name: name.trim(),
      category,
      address: `${address}, ${city} - ${state}`,
      instagram,
      maps,
      whatsapp,
      website,
      price: money,
      amenities,
      photos,
    });
    setDone(true);
  }
  return (
    <Page
      top={8}
      header={
        <View className="flex-row items-center justify-between px-4 py-2">
          <View className="flex-row items-center gap-2">
            <Back />
            <View>
              <T className="text-base leading-6 text-primary">Cadastrar Espaço</T>
              <T className="font-bold text-[10px] leading-3 uppercase tracking-wider text-secondary">
                Etapa 1 de 2: Informações & Presença
              </T>
            </View>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-[#caeada]">
            <T className="font-bold text-xs text-primary">1/2</T>
          </View>
        </View>
      }
      dock={
        <>
          <CTA title="Enviar para Verificação" icon="send" onPress={submit} />
          <View className="flex-row items-center justify-center gap-1">
            <SIcon name="schedule" size={14} color={C.secondary} />
            <T className="shrink text-center font-bold text-[10px] leading-3 text-ink-variant">
              Nossa equipe avalia os links em até 24h para inserção no mapa.
            </T>
          </View>
        </>
      }
    >
      <View className="flex-row items-start gap-2 rounded-xl bg-[#1e3a2f] p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#fe8450]">
          <SIcon name="camping" size={22} color="#6c2400" />
        </View>
        <View className="flex-1 gap-1">
          <T className="font-semibold text-lg leading-6 text-white">Torne seu refúgio visível</T>
          <T className="text-xs leading-[19px] text-[#86a496]">
            Conecte seu camping a milhares de exploradores. Para manter nossa comunidade segura,
            cadastramos espaços com presença verificável na internet (Instagram, Google Maps ou Site
            Oficial).
          </T>
        </View>
      </View>
      <Surface className="gap-2">
        <View className="flex-row items-center justify-between">
          <Heading icon="verified">Presença Digital</Heading>
          <T className="rounded-full bg-[#ffdbce] px-2 py-0.5 font-bold text-[10px] leading-3 text-[#370e00]">
            Obrigatório
          </T>
        </View>
        <T className="text-xs leading-4 text-ink-variant">
          Estes links são auditados pela nossa curadoria para garantir a autenticidade das
          coordenadas e comodidades.
        </T>
        <Input
          label="Instagram do Camping"
          icon="photo_camera"
          placeholder="instagram.com/seucamping ou @usuario"
          autoCapitalize="none"
          value={instagram}
          onChangeText={setInstagram}
        />
        <Input
          label="Localização no Google Maps ou Coordenadas"
          icon="explore"
          placeholder="https://maps.app.goo.gl/... ou -22.90, -43.17"
          autoCapitalize="none"
          value={maps}
          onChangeText={setMaps}
        />
        <Input
          label="WhatsApp para Reservas & Contato"
          icon="chat"
          placeholder="+55 (11) 98765-4321"
          keyboardType="phone-pad"
          value={whatsapp}
          onChangeText={setWhatsapp}
        />
        <Input
          label="Site Oficial ou Linktree (Opcional)"
          icon="language"
          placeholder="https://www.meucamping.com.br"
          keyboardType="url"
          autoCapitalize="none"
          value={website}
          onChangeText={setWebsite}
        />
      </Surface>
      <Surface className="gap-2">
        <Heading icon="signpost">Identificação do Espaço</Heading>
        <Input
          label="Nome do Camping / Refúgio"
          placeholder="Ex: Refúgio Serra da Mantiqueira"
          value={name}
          onChangeText={setName}
        />
        <T className="font-medium text-xs">Tipo Principal de Acomodação</T>
        <View className="flex-row flex-wrap gap-2">
          {kinds.map((k) => (
            <Pressable
              key={k.text}
              accessibilityRole="radio"
              accessibilityState={{ checked: category === k.text }}
              onPress={() => setCategory(k.text)}
              style={{
                width: '48.5%',
                backgroundColor: category === k.text ? C.primary : C.container,
                borderColor: category === k.text ? C.primary : C.border,
              }}
              className="flex-row items-center gap-2 rounded-lg border p-3"
            >
              <SIcon name={k.icon} size={18} color={category === k.text ? '#fff' : C.primary} />
              <T
                className="flex-1 font-semibold text-xs leading-4"
                style={{ color: category === k.text ? '#fff' : C.text }}
              >
                {k.text}
              </T>
            </Pressable>
          ))}
        </View>
        <T className="pt-2 font-medium text-xs">Região e Território</T>
        <View className="flex-row gap-2">
          <View className="flex-1 flex-row items-center gap-2 rounded-lg bg-surface-container px-3">
            <T>🇧🇷</T>
            <T className="font-bold text-xs">Brasil</T>
          </View>
          <View className="flex-1">
            <Input
              accessibilityLabel="Estado"
              placeholder="Estado (ex: MG, SP)"
              value={state}
              onChangeText={setState}
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>
        </View>
        <Input
          accessibilityLabel="Cidade"
          placeholder="Cidade (ex: Gonçalves, Aiuruoca)"
          value={city}
          onChangeText={setCity}
        />
        <Input
          accessibilityLabel="Ponto de referência"
          placeholder="Ponto de Referência ou Km da Estrada (ex: Estrada Rural km 8)"
          value={address}
          onChangeText={setAddress}
        />
      </Surface>
      <Surface className="gap-2">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Heading icon="checklist">Comodidades Disponíveis</Heading>
          </View>
          <T className="w-20 font-bold text-[10px] leading-3 text-ink-muted">Toque para marcar</T>
        </View>
        <View className="flex-row flex-wrap gap-2 pt-1">
          {features.map((f) => (
            <ToggleChip
              key={f.text}
              icon={f.icon}
              selected={amenities.includes(f.text)}
              onPress={() =>
                setAmenities(
                  amenities.includes(f.text)
                    ? amenities.filter((a) => a !== f.text)
                    : [...amenities, f.text],
                )
              }
            >
              {f.text}
            </ToggleChip>
          ))}
        </View>
      </Surface>
      <Surface className="gap-2">
        <View className="flex-row items-center justify-between">
          <Heading icon="add_photo_alternate">Fotografias do Local</Heading>
          <T className="font-bold text-[10px] leading-3 text-secondary">
            {photos.length} adicionadas
          </T>
        </View>
        <UploadPhotos compact photos={photos} onChange={setPhotos} labels={['Capa']} />
        <View className="flex-row items-start gap-2 rounded-lg bg-surface-container p-3">
          <SIcon name="lightbulb" size={18} color={C.secondary} />
          <T className="flex-1 text-xs leading-4 text-ink-variant">
            <T className="font-semibold text-xs">Dica do Curador:</T> Fotos com iluminação natural
            da área de barracas, banheiros limpos e vista panorâmica aumentam em 3x o interesse de
            viajantes.
          </T>
        </View>
      </Surface>
      <Surface className="gap-2">
        <Heading icon="payments">Preço Médio por Diária</Heading>
        <T className="text-xs leading-4 text-ink-variant">
          Informe o valor aproximado para orientar campistas e mochileiros.
        </T>
        <View className="flex-row items-center gap-2 rounded-lg bg-surface-container px-4 py-3.5">
          <T className="font-semibold text-lg">R$</T>
          <TextInput
            accessibilityLabel="Preço médio por diária"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            className="min-w-0 flex-1 font-bold text-[22px] leading-7 text-primary"
          />
          <T className="font-semibold text-xs text-ink-muted">/ pessoa ou noite</T>
        </View>
      </Surface>
      <View className="items-center gap-1 px-2">
        <View className="flex-row items-center gap-1.5">
          <SIcon name="shield" size={18} />
          <T className="shrink text-center font-semibold text-xs leading-4 text-ink-variant">
            Sem taxas de comissão no plano comunitário Kampive
          </T>
        </View>
        <T className="text-center text-xs leading-4 text-ink-muted">
          Ao prosseguir, você concorda com nossos termos de preservação ambiental e diretrizes de
          turismo regenerativo.
        </T>
      </View>
      {error !== '' && <Notice error>{error}</Notice>}
      {done && (
        <Dialog
          title="Seu espaço está registrado"
          text="Etapa 2 de 2: rascunho salvo neste dispositivo. Esta prévia não envia dados à curadoria nem publica o camping no mapa."
          onClose={() => router.replace({ pathname: '/profile', params: { section: 'spaces' } })}
        />
      )}
    </Page>
  );
}
