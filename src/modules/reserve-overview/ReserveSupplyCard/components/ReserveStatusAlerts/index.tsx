import { Trans } from '@lingui/macro';
import { Alert, Stack } from '@mui/material';
import { getFrozenProposalLink } from 'src/components/infoTooltips/FrozenTooltip';
import { PausedTooltipText } from 'src/components/infoTooltips/PausedTooltip';
import { Link } from 'src/components/primitives/Link';
import { AMPLWarning } from 'src/components/Warnings/AMPLWarning';
import {
  AssetsBeingOffboarded,
  OffboardingWarning,
} from 'src/components/Warnings/OffboardingWarning';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

interface ReserveStatusAlertsProps {
  reserve: ReserveWithId;
}

export const ReserveStatusAlerts = ({ reserve }: ReserveStatusAlertsProps) => {
  const currentMarket = useRootStore((store) => store.currentMarket);
  const symbol = reserve.underlyingToken.symbol;
  const offboardingDiscussion = AssetsBeingOffboarded[currentMarket]?.[symbol];

  const statusAlert =
    reserve.isFrozen && !offboardingDiscussion ? (
      <Alert severity="error">
        <Trans>
          This asset is frozen due to an Aave community decision.{' '}
          <Link
            href={getFrozenProposalLink(symbol.toLocaleLowerCase(), currentMarket)}
            sx={{ textDecoration: 'underline' }}
          >
            <Trans>More details</Trans>
          </Link>
        </Trans>
      </Alert>
    ) : offboardingDiscussion ? (
      <Alert severity="error">
        <OffboardingWarning discussionLink={offboardingDiscussion} />
      </Alert>
    ) : symbol === 'AMPL' ? (
      <Alert severity="warning">
        <AMPLWarning />
      </Alert>
    ) : null;

  const pausedAlert = !reserve.isPaused ? null : symbol === 'MAI' ? (
    <Alert severity="error">
      <Trans>
        MAI has been paused due to a community decision. Supply, borrows and repays are impacted.{' '}
        <Link
          href={'https://governance.aave.com/t/arfc-add-mai-to-arbitrum-aave-v3-market/12759/8'}
          sx={{ textDecoration: 'underline' }}
        >
          <Trans>More details</Trans>
        </Link>
      </Trans>
    </Alert>
  ) : (
    <Alert severity="error">
      <PausedTooltipText />
    </Alert>
  );

  if (!statusAlert && !pausedAlert) return null;

  return (
    <Stack gap="0.75rem" sx={{ mt: '1rem' }}>
      {statusAlert}
      {pausedAlert}
    </Stack>
  );
};
