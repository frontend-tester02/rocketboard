import { Suspense } from 'react';
import { ProjectsPageClient } from '@/features/projects/components/projects-page-client';

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsPageClient />
    </Suspense>
  );
}
