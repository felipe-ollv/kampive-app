import type { CampsiteContent } from './api/campsite-types';
export type CampsiteUpload = { uri: string; name: string; type: string; file?: File };
export function campsiteMultipart(content: CampsiteContent, uploads: CampsiteUpload[]) {
  const data = new FormData();
  const existing = content.photos.filter(
    (photo) => !uploads.some((file) => file.uri === photo.url),
  );
  const files = uploads.filter((file) => content.photos.some((photo) => photo.url === file.uri));
  data.append('content', JSON.stringify({ ...content, photos: existing }));
  data.append(
    'order',
    JSON.stringify(
      content.photos.map((photo) => {
        const index = files.findIndex((file) => file.uri === photo.url);
        return index >= 0
          ? `file:${index}`
          : `existing:${existing.findIndex((p) => p.url === photo.url)}`;
      }),
    ),
  );
  for (const file of files) {
    if (file.file) data.append('photos', file.file, file.name);
    else
      data.append('photos', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  }
  return data;
}
