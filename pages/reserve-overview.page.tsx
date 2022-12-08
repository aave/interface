import { useRouter } from 'next/router';
import { MainLayout } from 'src/layouts/MainLayout';
import { GhoReserveOverview } from 'src/modules/reserve-overview/Gho/GhoReserveOverview';
import { ReserveOverview as ReserveOverviewPage } from 'src/modules/reserve-overview/ReserveOverview';
import { useRootStore } from 'src/store/root';

export default function ReserveOverview() {
  const router = useRouter();
  const { ghoMarketConfig } = useRootStore();

  const underlyingAsset = router.query.underlyingAsset as string;
  if (underlyingAsset === ghoMarketConfig().ghoTokenAddress) {
    return <GhoReserveOverview />;
  } else {
    return <ReserveOverviewPage underlyingAsset={underlyingAsset} />;
  }
}

ReserveOverview.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
