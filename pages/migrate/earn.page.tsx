import { ROUTES } from 'src/components/primitives/Link';
import { FlowLayout } from 'src/layouts/FlowLayout';
import { V4MigrationEarnFlow } from 'src/modules/v4Migration/V4MigrationEarnFlow';

export default function MigrateEarn() {
  return <V4MigrationEarnFlow />;
}

MigrateEarn.getLayout = function getLayout(page: React.ReactElement) {
  return <FlowLayout closeHref={ROUTES.migrationToolV4}>{page}</FlowLayout>;
};
