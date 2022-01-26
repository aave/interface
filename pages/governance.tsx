import { MainLayout } from 'src/layouts/MainLayout';

export default function Governance() {
  return <div>gov</div>;
}

Governance.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
