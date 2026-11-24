import { MainLayout } from 'src/layouts/MainLayout';
import { V4MigrationPageContainer } from 'src/modules/v4Migration/V4MigrationPageContainer';

export default function Migrate() {
  return <V4MigrationPageContainer />;
}

Migrate.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
