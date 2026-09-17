import { Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { ShowcaseLayout } from 'src/modules/dev/ComponentShowcase/components/ShowcaseLayout';
import { SHOWCASE_SECTIONS } from 'src/modules/dev/ComponentShowcase/utils/registry';

/**
 * One route per showcase section: `/dev/components/<slug>`. Renders only the active
 * section (lazily loaded via the registry) inside the shared sidebar layout. Only built when
 * dev pages are enabled (see `pageExtensions` in next.config.js).
 */
export default function ComponentShowcaseSectionPage() {
  const router = useRouter();

  const slug = typeof router.query.section === 'string' ? router.query.section : '';
  const section = SHOWCASE_SECTIONS.find((s) => s.slug === slug);
  const ActiveSection = section?.Component;

  return (
    <ShowcaseLayout activeSlug={slug}>
      {ActiveSection ? (
        <ActiveSection />
      ) : router.isReady ? (
        <Typography variant="h2">Section not found</Typography>
      ) : null}
    </ShowcaseLayout>
  );
}
