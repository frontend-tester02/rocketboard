'use client';

import { useParams } from 'next/navigation';
import { ProjectDetailsClient } from '@/features/projects/components/project-details-client';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <ProjectDetailsClient id={id} />;
}
