import { useTranslation } from '../lib/i18n';
import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { View } from 'react-native';
import { api, errorMessage } from '../lib/api';
import { useApiPage } from '../hooks/use-api-page';
import { profilePhoto } from '../lib/profile';
import { httpsPhoto } from '../lib/campsite-display';
import { CTA, Surface } from './stitch';
import { Notice, Photo, T } from './ui';

export function ReviewsList({ campsiteUuid }: { campsiteUuid?: string }) {
  const { t, locale } = useTranslation();
  const result = useApiPage(
    useCallback(
      (page: number) => (campsiteUuid ? api.reviews(campsiteUuid, page) : api.myReviews(page)),
      [campsiteUuid],
    ),
    false,
  );
  const { reload } = result;
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const deleteLock = useRef(false);
  async function remove(uuid: string) {
    if (deleteLock.current) return;
    deleteLock.current = true;
    setDeleting(true);
    setActionError('');
    setMessage('');
    try {
      await api.deleteReview(uuid);
      setConfirmDelete(null);
      setMessage('Avaliação excluída.');
      await reload();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      deleteLock.current = false;
      setDeleting(false);
    }
  }
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  return (
    <View className="gap-3">
      {!!actionError && <Notice error>{actionError}</Notice>}
      {!!message && <Notice>{message}</Notice>}
      {result.loading && <T>{t('Carregando avaliações...')}</T>}
      {!!result.error && (
        <>
          <Notice error>{result.error}</Notice>
          <CTA
            title={t('Tentar novamente')}
            disabled={result.loading}
            onPress={() => void reload()}
          />
        </>
      )}
      {result.data?.items.map((item) => (
        <Surface key={item.uuid}>
          <T className="font-bold">{campsiteUuid ? item.authorName : item.campsiteName}</T>
          <T>
            ★ {item.rating} · {new Date(item.date).toLocaleDateString(locale)}
          </T>
          {!campsiteUuid && (
            <T>
              {
                { pending: t('Em análise'), published: t('Publicada'), hidden: t('Oculta') }[
                  item.status
                ]
              }
            </T>
          )}
          {!!item.campingMethod && <T>{item.campingMethod}</T>}
          <T>{item.text}</T>
          {!!item.highlights.length && (
            <T className="text-xs text-secondary">{item.highlights.join(' · ')}</T>
          )}
          <View className="flex-row gap-2">
            {item.photos.map((photo, index) => {
              const uri = profilePhoto(photo) || httpsPhoto(photo);
              return uri ? (
                <Photo key={index} uri={uri} className="h-24 flex-1 rounded-xl" />
              ) : null;
            })}
          </View>
          {!campsiteUuid &&
            (confirmDelete === item.uuid ? (
              <View className="gap-3 border-t border-line pt-3">
                <T className="font-bold">{t('Excluir esta avaliação?')}</T>
                <T>
                  {t(
                    'O comentário, a nota e as fotos serão removidos. Esta ação não pode ser desfeita.',
                  )}
                </T>
                <CTA
                  title={deleting ? t('Excluindo...') : t('Confirmar exclusão')}
                  disabled={deleting}
                  onPress={() => void remove(item.uuid)}
                />
                <CTA
                  title={t('Cancelar')}
                  outline
                  disabled={deleting}
                  onPress={() => setConfirmDelete(null)}
                />
              </View>
            ) : (
              <View className="gap-2">
                <CTA
                  title={t('Editar avaliação')}
                  outline
                  disabled={deleting}
                  onPress={() =>
                    router.push({
                      pathname: '/campsite/[id]/review',
                      params: { id: item.campsiteUuid, reviewId: item.uuid },
                    })
                  }
                />
                <CTA
                  title={t('Excluir avaliação')}
                  outline
                  disabled={deleting}
                  onPress={() => {
                    setActionError('');
                    setMessage('');
                    setConfirmDelete(item.uuid);
                  }}
                />
              </View>
            ))}
        </Surface>
      ))}
      {!result.loading && !result.error && result.data?.totalElements === 0 && (
        <T>
          {campsiteUuid
            ? t('Este camping ainda não tem avaliações publicadas.')
            : t('Você ainda não enviou avaliações.')}
        </T>
      )}
      {result.data && result.data.page + 1 < result.data.totalPages && (
        <CTA
          title={t('Mais avaliações')}
          outline
          disabled={result.loading}
          onPress={result.loadMore}
        />
      )}
    </View>
  );
}
