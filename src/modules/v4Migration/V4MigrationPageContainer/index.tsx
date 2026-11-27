import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useMemo } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { ROUTES } from 'src/components/primitives/Link';
import { Spinner } from 'src/components/Spinner';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { useMigrationOpportunities } from '../hooks/useMigrationApi';
import { V4MigrationPage } from '../V4MigrationPage';
import { MIGRATION_MARKETS } from '../V4MigrationPage/utils/markets';
import { toMigrationPositions } from '../V4MigrationPage/utils/opportunities';

const Placeholder = ({ children }: { children: ReactNode }) => (
  <V4MigrationPage earnPositions={[]} borrowPositions={[]} placeholder={children} />
);

/** The migrate page on live data: the connected wallet's V3 positions that can move to V4. */
export const V4MigrationPageContainer = () => {
  const { currentAccount } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', { 'Page Name': 'V4 Migration' });
  }, [trackEvent]);

  if (!currentAccount) {
    return (
      <Placeholder>
        <ConnectWalletPaper
          description={
            <Trans>Please connect your wallet to see the positions you can migrate.</Trans>
          }
        />
      </Placeholder>
    );
  }

  return <ConnectedV4MigrationPage user={currentAccount} />;
};

const ConnectedV4MigrationPage = ({ user }: { user: string }) => {
  const router = useRouter();
  const { data, loading, error } = useMigrationOpportunities({
    markets: MIGRATION_MARKETS,
    user: user,
  });

  const positions = useMemo(() => toMigrationPositions(data ?? []), [data]);

  if (loading) {
    return (
      <Placeholder>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: '4rem' }}>
          <Spinner size={24} />
        </Box>
      </Placeholder>
    );
  }

  if (error) {
    return (
      <Placeholder>
        <EmptyStatePaper
          title={<Trans>Something went wrong</Trans>}
          description={<Trans>We couldn&apos;t load your positions. Please try again later.</Trans>}
        />
      </Placeholder>
    );
  }

  if (positions.earnPositions.length === 0 && positions.borrowPositions.length === 0) {
    return (
      <Placeholder>
        <EmptyStatePaper
          title={<Trans>Nothing to migrate</Trans>}
          description={<Trans>You have no Aave V3 positions that can move to Aave V4.</Trans>}
        />
      </Placeholder>
    );
  }

  return (
    <V4MigrationPage
      {...positions}
      onMigrateEarn={(position) => router.push(ROUTES.migrationEarnV4(position.id))}
      onMigrateBorrow={(position) => router.push(ROUTES.migrationBorrowV4(position.id))}
    />
  );
};
