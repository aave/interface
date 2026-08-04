import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SHOWCASE_SECTIONS } from 'src/modules/dev/ComponentShowcase/utils/registry';

// `/dev/components` → redirect to the first section. Only built when dev pages are enabled
// (see `pageExtensions` in next.config.js).
export default function ComponentShowcaseIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dev/components/${SHOWCASE_SECTIONS[0].slug}`);
  }, [router]);

  return null;
}
