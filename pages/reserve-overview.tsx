import { useRouter } from 'next/router';
import { MainLayout } from 'src/layouts/MainLayout';

export default function ReserveOverview() {
  const router = useRouter();
  const underlyingAddress = router.query.underlyingAddress;

  return <div>{underlyingAddress}</div>;
}

ReserveOverview.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
