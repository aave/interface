import { MainLayout } from 'src/layouts/MainLayout';

export default function Staking() {
  return <div>stake</div>;
}

Staking.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
