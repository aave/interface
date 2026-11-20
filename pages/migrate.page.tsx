import { MainLayout } from 'src/layouts/MainLayout';
import { V4MigrationPage } from 'src/modules/v4Migration/V4MigrationPage';
import {
  BORROW_POSITIONS,
  EARN_POSITIONS,
} from 'src/modules/v4Migration/V4MigrationPage/utils/mocks';

export default function Migrate() {
  return <V4MigrationPage earnPositions={EARN_POSITIONS} borrowPositions={BORROW_POSITIONS} />;
}

Migrate.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
