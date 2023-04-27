import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Typography, useTheme } from '@mui/material';
import GhoBorrowApyRange from 'src/components/GhoBorrowApyRange';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { MarketAssetsListMobileItemLoader } from '../MarketAssetsListMobileItemLoader';

interface GhoMarketAssetsListMobileItemProps {
  reserve?: ComputedReserveData;
}

export const GhoMarketAssetsListMobileItem = ({ reserve }: GhoMarketAssetsListMobileItemProps) => {
  const { currentMarket } = useProtocolDataContext();
  const { ghoLoadingData, ghoReserveData } = useAppDataContext();
  const theme = useTheme();

  if (!reserve || ghoLoadingData) {
    return <MarketAssetsListMobileItemLoader />;
  }

  return (
    <Box
      sx={{
        paddingX: 6,
        height: 228,
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <Box
        sx={{
          borderRadius: 4,
          gap: 6,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#C9B3F94D',
          position: 'relative',
          p: 4,
        }}
      >
        <Box
          sx={{
            maxWidth: 250,
          }}
        >
          <Typography variant="subheader1">
            <Trans>Meet GHO</Trans>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            A decentralized, multi-collateralized stablecoin created by AaveDAO.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 16,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              alignItems: 'center',
            }}
          >
            <TokenIcon
              symbol="GHO"
              sx={{
                fontSize: '38px',
              }}
            />
            <Box>
              <FormattedNumber
                symbol="USD"
                compact
                variant="main14"
                value={ghoReserveData.aaveFacilitatorRemainingCapacity}
              />
              <Typography variant="caption" color="text.secondary">
                <Trans>Total borrowed</Trans>
              </Typography>
            </Box>
          </Box>
          <Box>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                alignItems: 'center',
              }}
            >
              <Box>
                <FormattedNumber
                  symbol="USD"
                  compact
                  variant="main14"
                  value={ghoReserveData.aaveFacilitatorRemainingCapacity}
                />
                <Typography variant="caption" color="text.secondary">
                  <Trans>Borrow APY, fixed rate</Trans>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Button variant="contained" size="large">
          <Trans>View details</Trans>
        </Button>
      </Box>
    </Box>
  );
};
