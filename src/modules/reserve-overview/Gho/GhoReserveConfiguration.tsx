import { Trans } from '@lingui/macro';
import { Box, Divider, Typography } from '@mui/material';
import { ExternalLinkButton } from 'src/components/ExternalLinkButton';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCapsSDK } from 'src/hooks/useAssetCapsSDK';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { BorrowInfo } from '../BorrowInfo';
import { ReserveEModePanel } from '../ReserveEModePanel';
import { PanelRow, PanelTitle } from '../ReservePanels';

// import { SavingsGho } from './SavingsGho';

type GhoReserveConfigurationProps = {
  reserve: ReserveWithId;
};

export const GhoReserveConfiguration: React.FC<GhoReserveConfigurationProps> = ({ reserve }) => {
  const [currentNetworkConfig, currentMarketData] = useRootStore(
    useShallow((store) => [store.currentNetworkConfig, store.currentMarketData])
  );
  const { borrowCap } = useAssetCapsSDK();
  const showBorrowCapStatus = reserve.borrowInfo?.borrowCap.amount.value !== '0';

  return (
    <>
      <PanelRow>
        <PanelTitle>
          <Trans>About GHO</Trans>
        </PanelTitle>
        <Box>
          <Typography gutterBottom>
            <Trans>
              GHO is a native decentralized, collateral-backed digital asset pegged to USD. It is
              created by users via borrowing against multiple collateral. When user repays their GHO
              borrow position, the protocol burns that user&apos;s GHO. All the interest payments
              accrued by minters of GHO would be directly transferred to the AaveDAO treasury.
            </Trans>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <ExternalLinkButton href="https://github.com/aave/gho/blob/main/techpaper/GHO_Technical_Paper.pdf">
              <Trans>Techpaper</Trans>
            </ExternalLinkButton>
            <ExternalLinkButton href="https://gho.xyz">
              <Trans>Website</Trans>
            </ExternalLinkButton>
            <ExternalLinkButton href="https://docs.gho.xyz/concepts/faq">
              <Trans>FAQ</Trans>
            </ExternalLinkButton>
          </Box>
        </Box>
      </PanelRow>
      {/* <Divider sx={{ my: { xs: 6, sm: 10 } }} /> */}
      {/* <PanelRow>
        <PanelTitle>
          <Trans>Savings GHO</Trans>
        </PanelTitle>
        <Box>
          <SavingsGho />
        </Box>
      </PanelRow> */}
      <Divider sx={{ my: { xs: 6, sm: 10 } }} />
      <PanelRow>
        <PanelTitle>
          <Trans>Borrow info</Trans>
        </PanelTitle>
        <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
          <BorrowInfo
            showBorrowCapStatus={showBorrowCapStatus}
            renderCharts={false}
            currentMarketData={currentMarketData}
            currentNetworkConfig={currentNetworkConfig}
            reserve={reserve}
            borrowCap={borrowCap}
          />
        </Box>
      </PanelRow>
      {reserve.eModeInfo?.length > 0 && (
        <>
          <Divider sx={{ my: { xs: 6, sm: 10 } }} />
          <ReserveEModePanel reserve={reserve} />
        </>
      )}
    </>
  );
};
