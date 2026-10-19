import { Suspense } from 'react';
import { FilesPageClient } from '@/features/files/components/files-page-client';

export default async function FilesPage({
  params,
}: {
  params: Promise<{ folderId?: string[] }>;
}) {
  const { folderId } = await params;
  const current = folderId?.[folderId.length - 1];
  return (
    <Suspense fallback={null}>
      <FilesPageClient folderId={current} />
    </Suspense>
  );
}
