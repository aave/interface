import { StakeDataProvider, useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';

export default function Staking() {
  const data = useStakeData();

  return <div>{JSON.stringify(data)}</div>;
}

Staking.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      <StakeDataProvider>{page}</StakeDataProvider>
    </MainLayout>
  );
};
