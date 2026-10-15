import type { ReactNode } from 'react';

/**
 * Hosts the products list plus a parallel `@modal` slot. Navigating to a
 * product from within the list is intercepted and shown as a modal; a direct
 * visit renders the standalone [id] page instead.
 */
export default function ProductsLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
