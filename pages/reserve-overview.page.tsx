import { useRouter } from 'next/router';
import { MainLayout } from 'src/layouts/MainLayout';
import { GhoReserveOverview } from 'src/modules/reserve-overview/Gho/GhoReserveOverview';
import { ReserveOverview as ReserveOverviewPage } from 'src/modules/reserve-overview/ReserveOverview';

// Just a temporary solution to render gho overview page
// Either fetch this from a util function, or we'll put GHO info in the global store
const ghoAddress = '0xa48ddcca78a09c37b4070b3e210d6e0234911549';

export default function ReserveOverview() {
  const router = useRouter();

  const underlyingAsset = router.query.underlyingAsset as string;
  if (underlyingAsset === ghoAddress) {
    return <GhoReserveOverview />;
  } else {
    return <ReserveOverviewPage underlyingAsset={underlyingAsset} />;
  }
}

ReserveOverview.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
