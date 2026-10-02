import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Linking from 'expo-linking';
import { CTA, Input, Page, TopBar, ToggleChip } from '../../components/stitch';
import { Check, Notice, T } from '../../components/ui';
import { Dialog, isEmail } from '../../components/forms';
import { Social } from '../../components/stitch-forms';
import { api, errorMessage, type LegalDocument } from '../../lib/api';
import { useCountries } from '../../hooks/use-countries';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      name.trim().length < 3 ||
      name.trim().length > 150 ||
      !isEmail(email.trim()) ||
      password.length < 15 ||
      password.length > 128 ||
      !terms ||
      !legalReady
    ) {
      setError('Confira nome, e-mail, senha de 15 a 128 caracteres e aceite os documentos.');
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
          Junte-se à comunidade de exploradores selvagens
        </T>
        <T className="text-sm text-ink-variant">
          Crie sua conta para começar sua jornada no Kampive.
        </T>
      </View>
      <View className="gap-4">
        <Input
          label="Nome completo"
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
          label="Senha"
          hint="15 a 128 caracteres"
          value={password}
          onChangeText={setPassword}
          password
          maxLength={128}
          autoComplete="new-password"
        />
        <T className="text-xs text-ink-variant">Use uma frase longa e exclusiva para sua conta.</T>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSelectingCountry(!selectingCountry)}
          className="min-h-12 rounded-lg bg-surface-container p-3"
        >
          <T>
            País (opcional):{' '}
            {countries.data?.items.find((c) => c.uuid === countryUuid)?.name || 'Selecionar'}
          </T>
        </Pressable>
        {selectingCountry && (
          <View className="gap-2">
            <ToggleChip
              icon="public"
              selected={!countryUuid}
              onPress={() => setCountryUuid(undefined)}
            >
              Não informar
            </ToggleChip>
            {countries.loading && <T>Carregando países...</T>}
            {countries.error ? (
              <>
                <Notice error>{countries.error}</Notice>
                <CTA title="Tentar novamente" onPress={() => void countries.reload()} />
              </>
            ) : null}
            {!countries.loading && !countries.error && !countries.data?.items.length && (
              <T>Nenhum país disponível no momento.</T>
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
              <CTA title="Mais países" disabled={countries.loading} onPress={countries.loadMore} />
            )}
          </View>
        )}
      </View>
      {loadingDocs && <T>Carregando documentos...</T>}
      {docsError ? <Notice error>{docsError}</Notice> : null}
      {!loadingDocs && !docsError && !legalReady && (
        <Notice>
          O cadastro estará disponível assim que os termos e a política de privacidade forem
          publicados.
        </Notice>
      )}
      {(!legalReady || docsError) && !loadingDocs && (
        <CTA title="Atualizar documentos" outline onPress={() => setRevision((n) => n + 1)} />
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
                {document.type === 'terms_of_use' ? 'Termos de Uso' : 'Política de Privacidade'} ·
                versão {document.version}
              </T>
            </Pressable>
          ))}
          <Check checked={terms} onChange={() => setTerms(!terms)}>
            Li e aceito os Termos de Uso e a Política de Privacidade.
          </Check>
        </View>
      )}
      {error ? <Notice error>{error}</Notice> : null}
      <CTA
        title={busy ? 'Criando conta...' : 'Criar Minha Conta'}
        disabled={busy || success || loadingDocs || !legalReady || !terms || !!docsError}
        onPress={() => void submit()}
      />
      <Social register />
      <T className="text-center">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-secondary">
          Entrar
        </Link>
      </T>
      {success && (
        <Dialog
          title="Conta criada"
          text="Sua conta foi criada. Entre com seu e-mail e senha para continuar."
          onClose={() => router.replace('/login')}
        />
      )}
    </Page>
  );
}
