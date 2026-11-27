import { ROUTES } from 'src/components/primitives/Link';
import { FlowLayout } from 'src/layouts/FlowLayout';
import { V4MigrationBorrowFlow } from 'src/modules/v4Migration/V4MigrationBorrowFlow';

export default function MigrateBorrow() {
  return <V4MigrationBorrowFlow />;
}

MigrateBorrow.getLayout = function getLayout(page: React.ReactElement) {
  return <FlowLayout closeHref={ROUTES.migrationToolV4}>{page}</FlowLayout>;
};
