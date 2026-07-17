import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SHOWCASE_SECTIONS } from 'src/modules/dev/ComponentShowcase/utils/registry';

// `/dev/components` → redirect to the first section. Dev-only.
export default function ComponentShowcaseIndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      router.replace(`/dev/components/${SHOWCASE_SECTIONS[0].slug}`);
    }
  }, [router]);

  return null;
}
