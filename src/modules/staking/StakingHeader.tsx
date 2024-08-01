import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ChainAvailabilityText } from 'src/components/ChainAvailabilityText';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { Link } from '../../components/primitives/Link';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';

interface StakingHeaderProps {
  tvl: {
    [key: string]: number;
  };
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
  const trackEvent = useRootStore((store) => store.trackEvent);

  const total = Object.values(tvl || {}).reduce((acc, item) => acc + item, 0);

  const TotalFundsTooltip = () => {
    return (
      <TextWithTooltip>
        <Box>
          {Object.entries(tvl)
            .sort((a, b) => b[1] - a[1])
            .map(([key, value]) => (
              <Row key={key} caption={key} captionVariant="caption">
                <FormattedNumber value={value} symbol="USD" visibleDecimals={2} variant="caption" />
              </Row>
            ))}
        </Box>
      </TextWithTooltip>
    );
  };

  return (
    <TopInfoPanel
      titleComponent={
        <Box mb={4}>
          <ChainAvailabilityText wrapperSx={{ mb: 4 }} chainId={ChainId.mainnet} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            {/* <img src={`/aave-logo-purple.svg`} width="64px" height="64px" alt="" /> */}
            <Typography
              variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'}
              sx={{ ml: 2, mr: 3 }}
            >
              <Trans>Staking</Trans>
            </Typography>
          </Box>

          <Typography sx={{ color: '#8E92A3', maxWidth: '824px' }}>
            <Trans>
              AAVE, GHO, and ABPT holders (Ethereum network only) can stake their assets in the
              Safety Module to add more security to the protocol and earn Safety Incentives. In the
              case of a shortfall event, your stake can be slashed to cover the deficit, providing
              an additional layer of protection for the protocol.
            </Trans>{' '}
            <Link
              href="https://docs.aave.com/faq/migration-and-staking"
              sx={{ textDecoration: 'underline', color: '#8E92A3' }}
              onClick={() =>
                trackEvent(GENERAL.EXTERNAL_LINK, {
                  Link: 'Staking Risks',
                })
              }
            >
              <Trans>Learn more about risks involved</Trans>
            </Link>
          </Typography>
        </Box>
      }
    >
      <TopInfoPanelItem
        hideIcon
        title={
          <Stack direction="row" alignItems="center">
            <Trans>Funds in the Safety Module</Trans>
            <TotalFundsTooltip />
          </Stack>
        }
        loading={loading}
      >
        <FormattedNumber
          value={total}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
          visibleDecimals={2}
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem hideIcon title={<Trans>Total emission per day</Trans>} loading={loading}>
        <FormattedNumber
          value={stkEmission || 0}
          symbol="AAVE"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
          visibleDecimals={2}
        />
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
