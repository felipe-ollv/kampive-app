import { useTranslation } from '../../lib/i18n';
import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Linking from 'expo-linking';
import { CTA, Input, Page, TopBar, ToggleChip } from '../../components/stitch';
import { Check, Notice, T } from '../../components/ui';
import { Dialog, isEmail } from '../../components/forms';
import { api, errorMessage, type LegalDocument } from '../../lib/api';
import { useCountries } from '../../hooks/use-countries';

export default function Register() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [countryUuid, setCountryUuid] = useState<string>();
  const [selectingCountry, setSelectingCountry] = useState(false);
  const [terms, setTerms] = useState(false);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docsError, setDocsError] = useState('');
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [success, setSuccess] = useState(false);
  const countries = useCountries();
  useEffect(() => {
    let active = true;
    setLoadingDocs(true);
    setDocsError('');
    setTerms(false);
    api
      .documents()
      .then((result) => {
        if (active) setDocuments(result);
      })
      .catch((e) => {
        if (active) setDocsError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoadingDocs(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const legalReady =
    documents.length === 2 &&
    ['terms_of_use', 'privacy_policy'].every((type) => documents.some((d) => d.type === type));
  async function submit() {
    if (lock.current) return;
    if (
      password.length < 8 ||
      password.length > 128 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError(
        t('A senha deve ter de 8 a 128 caracteres, pelo menos uma letra maiúscula e um número.'),
      );
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem. Confira a confirmação da senha.');
      return;
    }
    if (
      name.trim().length < 3 ||
      name.trim().length > 150 ||
      !isEmail(email.trim()) ||
      !terms ||
      !legalReady
    ) {
      setError('Confira nome, e-mail e aceite os documentos.');
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        countryUuid,
        acceptedDocumentUuids: documents.map((d) => d.uuid),
      });
      setPassword('');
      setConfirmation('');
      setSuccess(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function openDocument(document: LegalDocument) {
    if (!document.contentUrl.startsWith('https://')) {
      setError('Este documento não está disponível em um endereço seguro.');
      return;
    }
    try {
      await Linking.openURL(document.contentUrl);
    } catch {
      setError('Não foi possível abrir o documento.');
    }
  }
  return (
    <Page top={16} header={<TopBar mode="register" />}>
      <View className="gap-3">
        <T
          accessibilityRole="header"
          className="font-display text-[32px] leading-[38px] text-primary"
        >
          {t('Junte-se à comunidade de exploradores selvagens')}
        </T>
        <T className="text-sm text-ink-variant">
          {t('Crie sua conta para começar sua jornada no Kampive.')}
        </T>
      </View>
      <View className="gap-4">
        <Input
          label={t('Nome completo')}
          value={name}
          onChangeText={setName}
          maxLength={150}
          autoComplete="name"
        />
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          maxLength={254}
        />
        <Input
          label={t('Senha')}
          hint="8 a 128 caracteres"
          value={password}
          onChangeText={setPassword}
          password
          maxLength={128}
          autoComplete="new-password"
        />
        <T className="text-xs text-ink-variant">
          {t('Mínimo de 8 caracteres, uma letra maiúscula (A–Z) e um número.')}
        </T>
        <Input
          label={t('Confirmar senha')}
          value={confirmation}
          onChangeText={setConfirmation}
          password
          maxLength={128}
          autoComplete="new-password"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setSelectingCountry(!selectingCountry)}
          className="min-h-12 rounded-lg bg-surface-container p-3"
        >
          <T>
            {t('País (opcional):')}{' '}
            {countries.data?.items.find((c) => c.uuid === countryUuid)?.name || t('Selecionar')}
          </T>
        </Pressable>
        {selectingCountry && (
          <View className="gap-2">
            <ToggleChip
              icon="public"
              selected={!countryUuid}
              onPress={() => setCountryUuid(undefined)}
            >
              {t('Não informar')}
            </ToggleChip>
            {countries.loading && <T>{t('Carregando países...')}</T>}
            {countries.error ? (
              <>
                <Notice error>{countries.error}</Notice>
                <CTA title={t('Tentar novamente')} onPress={() => void countries.reload()} />
              </>
            ) : null}
            {!countries.loading && !countries.error && !countries.data?.items.length && (
              <T>{t('Nenhum país disponível no momento.')}</T>
            )}
            {countries.data?.items.map((c) => (
              <ToggleChip
                icon="public"
                key={c.uuid}
                selected={c.uuid === countryUuid}
                onPress={() => {
                  setCountryUuid(c.uuid);
                  setSelectingCountry(false);
                }}
              >
                {c.name}
              </ToggleChip>
            ))}
            {countries.data && countries.data.page + 1 < countries.data.totalPages && (
              <CTA
                title={t('Mais países')}
                disabled={countries.loading}
                onPress={countries.loadMore}
              />
            )}
          </View>
        )}
      </View>
      {loadingDocs && <T>{t('Carregando documentos...')}</T>}
      {docsError ? <Notice error>{docsError}</Notice> : null}
      {!loadingDocs && !docsError && !legalReady && (
        <Notice>
          {t(
            'O cadastro estará disponível assim que os termos e a política de privacidade forem publicados.',
          )}
        </Notice>
      )}
      {(!legalReady || docsError) && !loadingDocs && (
        <CTA title={t('Atualizar documentos')} outline onPress={() => setRevision((n) => n + 1)} />
      )}
      {legalReady && !loadingDocs && !docsError && (
        <View className="gap-3">
          {documents.map((document) => (
            <Pressable
              key={document.uuid}
              accessibilityRole="link"
              onPress={() => void openDocument(document)}
            >
              <T className="text-secondary underline">
                {document.type === 'terms_of_use'
                  ? t('Termos de Uso')
                  : t('Política de Privacidade')}{' '}
                {t('· versão')} {document.version}
              </T>
            </Pressable>
          ))}
          <Check checked={terms} onChange={() => setTerms(!terms)}>
            {t('Li e aceito os Termos de Uso e a Política de Privacidade.')}
          </Check>
        </View>
      )}
      {error ? <Notice error>{error}</Notice> : null}
      <CTA
        title={busy ? t('Criando conta...') : t('Criar Minha Conta')}
        disabled={busy || success || loadingDocs || !legalReady || !terms || !!docsError}
        onPress={() => void submit()}
      />
      <T className="text-center">
        {t('Já tem uma conta?')}{' '}
        <Link href="/login" className="text-secondary">
          {t('Entrar')}
        </Link>
      </T>
      {success && (
        <Dialog
          title={t('Conta criada')}
          text={t(
            'Sua conta foi criada. Preparamos um e-mail de confirmação. Entre para acompanhar o envio e participar da comunidade.',
          )}
          onClose={() => router.replace('/email-verification')}
        />
      )}
    </Page>
  );
}
