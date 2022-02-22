import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';

import { Link } from '../../components/primitives/Link';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';

interface StakingHeaderProps {
  tvl: string;
  stkEmission: string;
  loading: boolean;
}

export const StakingHeader: React.FC<StakingHeaderProps> = ({ tvl, stkEmission, loading }) => {
  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  return (
    <TopInfoPanel
      titleComponent={
        <Box mb={4}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
            <Typography variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'} sx={{ mr: 3 }}>
              <Trans>Stake</Trans>
            </Typography>

            <Button variant="surface" size="small" sx={{ minWidth: 'unset' }}>
              FAQ
              <SvgIcon sx={{ fontSize: '12px', ml: 0.5 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
          </Box>

          <Typography sx={{ color: '#FFFFFFB2', maxWidth: '824px' }}>
            <Trans>
              AAVE holders can stake their AAVE in the Safety Module to add more security to the
              protocol and earn Safety Incentives. In the case of a shortfall event, up to 30% of
              your stake can be slashed to cover the deficit, providing an additional layer of
              protection for the protocol.
            </Trans>{' '}
            <Link
              // TODO: need check link
              href="https://docs.aave.com/faq/"
              sx={{ textDecoration: 'underline', color: '#FFFFFFB2' }}
            >
              <Trans>Learn more about risks involved</Trans>
            </Link>
          </Typography>
        </Box>
      }
    >
      <TopInfoPanelItem title={<Trans>Funds in the Safety Module</Trans>} loading={loading}>
        {/** TBD value */}
        <FormattedNumber
          value={tvl || 0}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#FFFFFFB2"
          visibleDecimals={2}
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem title={<Trans>Total emission per day</Trans>} loading={loading}>
        {/** TBD value */}
        <FormattedNumber
          value={stkEmission || 0}
          symbol="AAVE"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#FFFFFFB2"
          visibleDecimals={2}
        />
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
