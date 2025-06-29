'use client';

import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { type ReactNode } from 'react';
import { useSidebar } from 'fumadocs-ui/contexts/sidebar';
import { usePathname } from 'next/navigation';
import { baseOptions } from '@/app/layout.config';
import type { PageTree as FumaPageTree } from 'fumadocs-core/server';

type PageTree = FumaPageTree.Root;

export interface DocsLayoutWrapperProps {
  children: ReactNode;
  tree: PageTree;
}

export function DocsLayoutWrapper({ children, tree }: DocsLayoutWrapperProps) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();

  return (
    <DocsLayout
      {...baseOptions}
      tree={tree}
      // Customize sidebar behavior
      sidebar={{
        enabled: true,
        collapsible: true,
        defaultOpenLevel: 1,
      }}
      // Add custom container props
      containerProps={{
        className: 'max-w-[90rem] mx-auto',
      }}
    >
      {children}
    </DocsLayout>
  );
}
