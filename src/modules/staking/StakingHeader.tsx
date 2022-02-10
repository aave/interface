import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { ExternalLinkIcon } from '@heroicons/react/solid';

export const StakingHeader = () => {
  return (
    <>
      <Box sx={{ mt: 12, mb: 24, color: 'common.white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h1" sx={{ opacity: '0.7', mr: 3 }}>
            Staking
          </Typography>
          <MarketLogo size={32} logo={'/icons/networks/ethereum.svg'} withAAVELogo />
          <Typography variant="h1" color="dark.primary.main" sx={{ position: 'relative' }}>
            Aave V3
            <Button
              variant="surface"
              size="small"
              endIcon={
                <SvgIcon sx={{ width: '15px' }} fontSize="small">
                  <ExternalLinkIcon />
                </SvgIcon>
              }
              sx={{
                position: 'absolute',
                top: '0px',
                right: '-64px',
                px: '6px',
                '& .MuiButton-endIcon': { ml: '2px' },
                minWidth: '45px',
                fontSize: '10px',
              }}
            >
              FAQ
            </Button>
          </Typography>
        </Box>
        <Typography sx={{ mt: 4, opacity: '0.7', maxWidth: '824px' }}>
          <Trans>
            AAVE holders can stake their AAVE in the Safety Module to add more security to the
            protocol and earn Safety Incentives. In the case of a shortfall event, up to 30% of your
            stake can be slashed to cover the deficit, providing an additional layer of protection
            for the protocol. Learn more about risks involved.
          </Trans>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', mt: 4 }}>
          <TopInfoPanelItem title={<Trans>Funds in the Safety Module</Trans>}>
            {/** TBD value */}
            <FormattedNumber value={'10000000'} symbol="USD" variant="main21" />
          </TopInfoPanelItem>

          <TopInfoPanelItem title={<Trans>Total emission per day</Trans>}>
            {/** TBD value */}
            <FormattedNumber value={'1100'} symbol="AAVE" variant="main21" />
          </TopInfoPanelItem>
        </Box>
      </Box>
    </>
  );
};
