import { FileViewer } from '@/features/files/components/file-viewer';

export default async function FileViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FileViewer fileId={id} />;
}
