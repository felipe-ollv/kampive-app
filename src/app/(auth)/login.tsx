import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { C, Input, Page, SIcon, TopBar } from '../../components/stitch';
import { Notice, T } from '../../components/ui';
import { Dialog, isEmail } from '../../components/forms';
import { Social } from '../../components/stitch-forms';
import { useAuth } from '../../lib/auth';
import { errorMessage } from '../../lib/api';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState('');
  const { login, busy } = useAuth();
  async function submit() {
    if (busy) return;
    if (!isEmail(email.trim()) || !password) {
      setError('Preencha um e-mail válido e sua senha.');
      return;
    }
    setError('');
    try {
      await login(email, password);
      setPassword('');
      router.replace('/profile');
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <Page texture top={12} gap={24}>
      <View className="-mb-2">
        <TopBar mode="login" />
      </View>
      <View className="gap-2">
        {/* <Pill icon="camping">Acesso ao Acampamento</Pill> */}
        <T
          accessibilityRole="header"
          className="pt-1 font-display text-[28px] leading-[34px] tracking-tight text-primary"
        >
          Prepare sua mochila!
        </T>
        <T className="text-sm leading-5 text-ink-variant">
          Acesse seus refúgios salvos, acompanhe suas avaliações e explore campings pelo mundo.
        </T>
      </View>
      <View className="gap-4">
        <Input
          label="E-mail de aventureiro"
          icon="mail"
          placeholder="seu.email@exemplo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Senha de acesso"
          icon="lock"
          placeholder="Digite sua senha secreta"
          password
          value={password}
          onChangeText={setPassword}
        />
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            onPress={() => setDialog('A recuperação de senha estará disponível em breve.')}
          >
            <T className="font-bold text-xs text-secondary underline">Esqueceu a senha?</T>
          </Pressable>
        </View>
        {error !== '' && <Notice error>{error}</Notice>}
        <Pressable
          accessibilityRole="button"
          onPress={submit}
          disabled={busy}
          accessibilityState={{ disabled: busy, busy }}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3"
        >
          <T className="font-bold text-sm text-white">
            {busy ? 'Entrando...' : 'Entrar no Kampive'}
          </T>
          <SIcon name="arrow_forward" size={20} color="#fff" />
        </Pressable>
      </View>
      <View className="-mt-2 gap-2.5">
        <Social />
        <Pressable
          accessibilityRole="button"
          onPress={() => setDialog('O acesso via SMS ainda não está conectado nesta prévia.')}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-lg border border-[#c1c8c3]/40 bg-surface-container px-3"
        >
          <SIcon name="pin" size={18} />
          <T className="shrink font-semibold text-xs leading-4 text-ink-variant">
            Entrar com código via SMS / Sinal de Trilha
          </T>
        </Pressable>
      </View>
      <View className="mt-8 items-center gap-1 pt-2">
        <T className="text-sm text-ink-variant">Ainda não tem uma conta de aventureiro?</T>
        <Link href="/register" asChild>
          <Pressable accessibilityRole="link" className="flex-row items-center gap-1">
            <T className="font-bold text-sm text-secondary">Criar nova conta no Kampive</T>
            <SIcon name="north_east" size={16} color={C.secondary} />
          </Pressable>
        </Link>
      </View>
      <View className="self-center flex-row items-center gap-1.5 rounded-full border border-[#c1c8c3]/30 bg-surface-low/70 px-3 py-2">
        <SIcon name="verified_user" size={14} color={C.outline} />
        <T className="font-bold text-[10px] leading-3 text-ink-muted">
          Autenticação segura e criptografada Kampive
        </T>
      </View>
      {dialog !== '' && <Dialog title="Kampive" text={dialog} onClose={() => setDialog('')} />}
    </Page>
  );
}
