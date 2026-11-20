import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ExternalLinkButton } from 'src/components/ExternalLinkButton';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ReserveBorrowCard } from '../ReserveBorrowCard';
import { ReserveCard } from '../ReserveCard';
import { ReserveCollectorInfo } from '../ReserveCollectorInfo';

// import { SavingsGho } from './SavingsGho';

type GhoReserveConfigurationProps = {
  reserve: ReserveWithId;
};

export const GhoReserveConfiguration: React.FC<GhoReserveConfigurationProps> = ({ reserve }) => {
  return (
    <>
      <ReserveCard title={<Trans>About GHO</Trans>}>
        <Typography sx={{ mt: '1.375rem' }}>
          <Trans>
            GHO is a native decentralized, collateral-backed digital asset pegged to USD. It is
            created by users via borrowing against multiple collateral. When user repays their GHO
            borrow position, the protocol burns that user&apos;s GHO. All the interest payments
            accrued by minters of GHO would be directly transferred to the AaveDAO treasury.
          </Trans>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 6 }}>
          <ExternalLinkButton
            variant="tertiary"
            href="https://github.com/aave/gho/blob/main/techpaper/GHO_Technical_Paper.pdf"
          >
            <Trans>Techpaper</Trans>
          </ExternalLinkButton>
          <ExternalLinkButton variant="tertiary" href="https://gho.xyz">
            <Trans>Website</Trans>
          </ExternalLinkButton>
          <ExternalLinkButton variant="tertiary" href="https://docs.gho.xyz/concepts/faq">
            <Trans>FAQ</Trans>
          </ExternalLinkButton>
        </Box>
      </ReserveCard>
      {/* <Divider sx={{ my: { xs: 6, sm: 10 } }} /> */}
      {/* <PanelRow>
        <PanelTitle>
          <Trans>Savings GHO</Trans>
        </PanelTitle>
        <Box>
          <SavingsGho />
        </Box>
      </PanelRow> */}
      <ReserveBorrowCard reserve={reserve} showStats showChart={false} />
      <ReserveCollectorInfo reserve={reserve} variant="card" />
    </>
  );
};
