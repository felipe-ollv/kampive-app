import { useTranslation } from '../../lib/i18n';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { C, Input, Page, SIcon, TopBar } from '../../components/stitch';
import { Notice, T } from '../../components/ui';
import { isEmail } from '../../components/forms';
import { useAuth } from '../../lib/auth';
import { errorMessage } from '../../lib/api';
export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
        <T
          accessibilityRole="header"
          className="pt-1 font-display text-[28px] leading-[34px] tracking-tight text-primary"
        >
          {t('Prepare sua mochila!')}
        </T>
        <T className="text-sm leading-5 text-ink-variant">
          {t(
            'Acesse seus refúgios salvos, acompanhe suas avaliações e explore campings pelo mundo.',
          )}
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
          label={t('Senha de acesso')}
          icon="lock"
          placeholder={t('Digite sua senha secreta')}
          password
          value={password}
          onChangeText={setPassword}
        />
        <Link href="/forgot-password" asChild>
          <Pressable
            accessibilityRole="link"
            disabled={busy}
            className="min-h-11 self-end justify-center"
          >
            <T className="font-semibold text-sm text-secondary">{t('Esqueci minha senha')}</T>
          </Pressable>
        </Link>
        {error !== '' && <Notice error>{error}</Notice>}
        <Pressable
          accessibilityRole="button"
          onPress={submit}
          disabled={busy}
          accessibilityState={{ disabled: busy, busy }}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3"
        >
          <T className="font-bold text-sm text-white">
            {busy ? t('Entrando...') : t('Entrar no Kampive')}
          </T>
          <SIcon name="arrow_forward" size={20} color="#fff" />
        </Pressable>
      </View>
      <View className="mt-8 items-center gap-1 pt-2">
        <T className="text-sm text-ink-variant">{t('Ainda não tem uma conta de aventureiro?')}</T>
        <Link href="/register" asChild>
          <Pressable accessibilityRole="link" className="flex-row items-center gap-1">
            <T className="font-bold text-sm text-secondary">{t('Criar nova conta no Kampive')}</T>
            <SIcon name="north_east" size={16} color={C.secondary} />
          </Pressable>
        </Link>
      </View>
      <View className="self-center flex-row items-center gap-1.5 rounded-full border border-[#c1c8c3]/30 bg-surface-low/70 px-3 py-2">
        <SIcon name="verified_user" size={14} color={C.outline} />
        <T className="font-bold text-[10px] leading-3 text-ink-muted">
          {t('Autenticação segura e criptografada Kampive')}
        </T>
      </View>
    </Page>
  );
}
