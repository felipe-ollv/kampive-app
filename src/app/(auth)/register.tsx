import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { C, CTA, Input, Page, Pill, SIcon, TopBar, type SymbolName } from '../../components/stitch';
import { Check, Notice, Photo, T } from '../../components/ui';
import { Dialog, isEmail } from '../../components/forms';
import { pickProfilePhoto, Social } from '../../components/stitch-forms';
import { useStore } from '../../lib/store';
const experiences: { name: string; text: string; icon: SymbolName }[] = [
  { name: 'Iniciante', text: 'Campings estruturados', icon: 'wb_sunny' },
  { name: 'Selvagem', text: 'Mochilão e trilhas', icon: 'hiking' },
  { name: 'Vanlife', text: 'Motorhome & overland', icon: 'rv_hookup' },
];
export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [countries, setCountries] = useState(false);
  const [outdoor, setOutdoor] = useState('Selvagem');
  const [photo, setPhoto] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState('');
  const [success, setSuccess] = useState(false);
  const { setProfile, setSignedIn } = useStore();
  function submit() {
    if (name.trim().length < 3 || !isEmail(email) || password.length < 8 || !terms) {
      setError(
        'Informe nome, e-mail válido, senha com pelo menos 8 caracteres e aceite as diretrizes.',
      );
      return;
    }
    setProfile({ name: name.trim(), country, outdoor, photo });
    setSignedIn(true);
    setSuccess(true);
  }
  return (
    <Page top={16} header={<TopBar mode="register" />}>
      <View className="gap-3">
        <Pill icon="terrain" color="#370e00" background={C.peach}>
          Passaporte Outdoor
        </Pill>
        <T
          accessibilityRole="header"
          className="font-display text-[32px] leading-[38px] tracking-tight text-primary"
        >
          Junte-se à comunidade de exploradores selvagens
        </T>
        <T className="text-sm leading-6 text-ink-variant">
          Salve refúgios intocados, avalie pontos de acampamento e cadastre novos destinos
          autênticos no mapa colaborativo Kampive.
        </T>
      </View>
      <View className="items-center gap-3 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar foto de perfil"
          onPress={() =>
            pickProfilePhoto(setPhoto, () => setError('Não foi possível selecionar a foto.'))
          }
          className="relative h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-ink-muted bg-surface-high"
        >
          {photo ? (
            <Photo uri={photo} className="h-full w-full rounded-full" />
          ) : (
            <SIcon name="add_a_photo" size={32} color={C.border} />
          )}
          <View className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full bg-[#1e3a2f]">
            <SIcon name="photo_camera" size={20} color="#fff" />
          </View>
        </Pressable>
        <T className="text-xs">
          Adicionar Foto de Perfil <T className="text-xs text-ink-muted">(Opcional)</T>
        </T>
      </View>
      <View className="gap-4">
        <Input
          label="Nome Completo"
          icon="person"
          placeholder="ex: Lucas Silveira"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="E-mail"
          icon="mail"
          placeholder="seu.email@exemplo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View className="gap-2">
          <Input
            label="Senha"
            hint="Mín. 8 dígitos"
            icon="lock"
            placeholder="Crie uma senha forte"
            value={password}
            onChangeText={setPassword}
            password
          />
          <View className="flex-row items-center gap-1">
            <SIcon name="shield" size={14} />
            <T className="flex-1 text-xs leading-4 text-ink-variant">
              Use letras, números e símbolos para segurança em trilhas remotas.
            </T>
          </View>
        </View>
        <View className="gap-2">
          <T className="font-medium text-xs">País de Origem / Residência</T>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCountries(!countries)}
            className="min-h-12 flex-row items-center gap-3 rounded-lg bg-surface-container px-4"
          >
            <T className="text-xl">
              {country === 'Brasil' ? '🇧🇷' : country === 'Portugal' ? '🇵🇹' : '🇦🇷'}
            </T>
            <T className="flex-1 text-sm">
              {country}
              {country === 'Brasil' ? ' (América do Sul)' : ''}
            </T>
            <SIcon name="expand_more" size={18} color={C.outline} />
          </Pressable>
          {countries && (
            <View className="gap-2">
              {['Brasil', 'Argentina', 'Portugal'].map((c) => (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  onPress={() => {
                    setCountry(c);
                    setCountries(false);
                  }}
                  className="rounded-lg bg-white p-3"
                >
                  <T>{c}</T>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <T className="font-medium text-xs">Nível de Experiência</T>
          <T className="font-bold text-[10px] tracking-wider text-secondary">PERFIL OUTDOOR</T>
        </View>
        <View className="flex-row gap-2">
          {experiences.map((e) => (
            <Pressable
              key={e.name}
              accessibilityRole="radio"
              accessibilityState={{ checked: outdoor === e.name }}
              onPress={() => setOutdoor(e.name)}
              className="flex-1 items-center gap-1 rounded-lg border p-3"
              style={{
                backgroundColor: outdoor === e.name ? C.forest : C.low,
                borderColor: outdoor === e.name ? C.primary : C.border,
              }}
            >
              <SIcon name={e.icon} size={22} color={outdoor === e.name ? '#fff' : C.primary} />
              <T
                className="font-semibold text-xs"
                style={{ color: outdoor === e.name ? '#fff' : C.text }}
              >
                {e.name}
              </T>
              <T
                className="text-center font-semibold text-[10px] leading-3 tracking-[.4px]"
                style={{ color: outdoor === e.name ? '#aecebe' : C.outline }}
              >
                {e.text}
              </T>
            </Pressable>
          ))}
        </View>
      </View>
      <Check checked={terms} onChange={() => setTerms(!terms)}>
        Concordo com os{' '}
        <T
          className="text-xs underline"
          onPress={() =>
            setDialog(
              'Termos demonstrativos: respeite as comunidades, leve seu lixo e proteja a fauna. O cadastro desta prévia é apenas local.',
            )
          }
        >
          Termos de Uso
        </T>{' '}
        e as{' '}
        <T
          className="text-xs underline"
          onPress={() =>
            setDialog(
              'Leave No Trace: não deixe rastros, faça fogueiras apenas em locais permitidos e respeite a fauna.',
            )
          }
        >
          Diretrizes de Turismo Regenerativo
        </T>{' '}
        (Leave No Trace, fogueiras responsáveis e respeito à fauna).
      </Check>
      {error !== '' && <Notice error>{error}</Notice>}
      <CTA title="Criar Minha Conta" onPress={submit} />
      <Social register />
      <T className="py-6 text-center text-sm text-ink-variant">
        Já tem uma conta de aventureiro?{' '}
        <Link href="/login" className="font-bold text-secondary">
          Entrar
        </Link>
      </T>
      {dialog !== '' && (
        <Dialog title="Diretrizes da comunidade" text={dialog} onClose={() => setDialog('')} />
      )}
      {success && (
        <Dialog
          title="Perfil de demonstração criado"
          text="Seu perfil foi salvo neste dispositivo. Nenhuma conta real foi criada e sua senha não foi armazenada."
          onClose={() => router.replace('/profile')}
        />
      )}
    </Page>
  );
}
