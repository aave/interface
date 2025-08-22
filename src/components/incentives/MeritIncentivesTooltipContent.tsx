import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';
import {
  ExtendedReserveIncentiveResponse,
  MeritAction,
  MeritIncentivesBreakdown,
} from 'src/hooks/useMeritIncentives';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link } from '../primitives/Link';
import { Row } from '../primitives/Row';
import { TokenIcon } from '../primitives/TokenIcon';
import { getSymbolMap } from './IncentivesTooltipContent';

export enum CampaignType {
  SELF_VERIFICATION = 'self_verification',
  CELO_STANDARD = 'celo_standard',
  STANDARD = 'standard',
}
interface CampaignConfig {
  type: CampaignType;
  title: string;
  hasSpecialContent: boolean;
}

const ENABLE_SAFE_CAMPAIGN = false;

const isCeloAction = (action: MeritAction): boolean => {
  return [
    MeritAction.CELO_SUPPLY_CELO,
    MeritAction.CELO_SUPPLY_USDT,
    MeritAction.CELO_SUPPLY_USDC,
    MeritAction.CELO_SUPPLY_WETH,
    MeritAction.CELO_SUPPLY_MULTIPLE_BORROW_USDT,
    MeritAction.CELO_BORROW_CELO,
    MeritAction.CELO_BORROW_USDT,
    MeritAction.CELO_BORROW_USDC,
    MeritAction.CELO_BORROW_WETH,
  ].includes(action);
};
const isSelfVerificationCampaign = (action: MeritAction): boolean =>
  ENABLE_SAFE_CAMPAIGN && action === MeritAction.CELO_SUPPLY_USDT;

const getCampaignConfig = (action: MeritAction): CampaignConfig => {
  if (isSelfVerificationCampaign(action)) {
    return {
      type: CampaignType.SELF_VERIFICATION,
      title: 'Eligible for Merit program and Boosted Yield via Self.',
      hasSpecialContent: true,
    };
  }
  if (isCeloAction(action)) {
    return {
      type: CampaignType.CELO_STANDARD,
      title: 'Eligible for Merit program.',
      hasSpecialContent: true,
    };
  }
  return {
    type: CampaignType.STANDARD,
    title: 'Eligible for the Merit program.',
    hasSpecialContent: false,
  };
};

export const MeritIncentivesTooltipContent = ({
  meritIncentives,
}: {
  meritIncentives: ExtendedReserveIncentiveResponse & { breakdown?: MeritIncentivesBreakdown };
}) => {
  const theme = useTheme();
  const typographyVariant = 'secondary12';
  const meritIncentivesFormatted = getSymbolMap(meritIncentives);

  const campaignConfig = getCampaignConfig(meritIncentives.action);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <img
        src={
          theme.palette.mode === 'dark'
            ? `/icons/other/aci-white.svg`
            : `/icons/other/aci-black.svg`
        }
        width="100px"
        height="40px"
        alt=""
      />

      <Typography variant="caption" color="text.primary" fontSize={13}>
        <Trans>{campaignConfig.title}</Trans>
      </Typography>

      <Typography variant="caption" color="text.secondary">
        <Trans>
          This is a program initiated and implemented by the Aave Chan Initiative (ACI). Aave Labs
          does not guarantee the program and accepts no liability.
        </Trans>{' '}
        <Link
          href={
            meritIncentives.customForumLink
              ? meritIncentives.customForumLink
              : 'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898'
          }
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          Learn more
        </Link>
      </Typography>

      {campaignConfig.type === CampaignType.SELF_VERIFICATION && (
        <>
          <Typography variant="caption" color="text.secondary">
            <Trans>
              Supply USDT and double your yield by{' '}
              <span>
                <Link
                  href="https://aave.self.xyz/"
                  sx={{ textDecoration: 'underline' }}
                  variant="caption"
                  color="text.secondary"
                >
                  verifying your humanity through Self
                </Link>
              </span>{' '}
              for the first $1,000 USDT supplied per user.
            </Trans>{' '}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <Trans>
              Visit{' '}
              <span>
                <Link
                  href="https://aave.self.xyz/"
                  sx={{ textDecoration: 'underline' }}
                  variant="caption"
                  color="text.secondary"
                >
                  https://aave.self.xyz/
                </Link>
              </span>{' '}
              to get started with Self’s ZK-powered proof-of-humanity authentication.
            </Trans>{' '}
          </Typography>
        </>
      )}
      {/* Show if SpecialContent is needed */}
      {/* {campaignConfig.type === CampaignType.SELF_VERIFICATION &&
        campaignConfig.hasSpecialContent &&
        ''} */}
      {/* Show if SpecialContent is needed */}
      {/* {campaignConfig.type === CampaignType.CELO_STANDARD && campaignConfig.hasSpecialContent && ''} */}

      {meritIncentives.customMessage ? (
        <Typography variant="caption" color="text.secondary">
          <Trans>{meritIncentives.customMessage}</Trans>
        </Typography>
      ) : null}

      <Typography variant="caption" color="text.primary" fontSize={13} fontWeight={'600'}>
        <Trans>Merit Program rewards are claimed through the</Trans>
        <Link
          href={`https://apps.aavechan.com/merit/${meritIncentives.action}`}
          sx={{ textDecoration: 'underline', ml: 1 }}
          variant="caption"
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {'Aave Chan Initiative interface'}
          </span>
        </Link>
        <span
          style={{
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          {'.'}
        </span>
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Box>
          <Typography
            variant={typographyVariant}
            // color="text.primary"
            // fontSize={13}
            fontWeight={'600'}
            sx={{ mb: 1, mt: 1 }}
          >
            <Trans>Reward Token</Trans>
          </Typography>
        </Box>
        <Row
          height={32}
          caption={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 0,
              }}
            >
              <TokenIcon
                aToken={meritIncentivesFormatted.aToken}
                symbol={meritIncentivesFormatted.tokenIconSymbol}
                sx={{ fontSize: '20px', mr: 1 }}
              />
              <Typography variant={typographyVariant}>{meritIncentivesFormatted.symbol}</Typography>
            </Box>
          }
          width="100%"
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <FormattedNumber
              value={+meritIncentivesFormatted.incentiveAPR}
              percent
              variant={typographyVariant}
            />
            {/* <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APY</Trans>
            </Typography> */}
          </Box>
        </Row>
      </Box>

      {/* Show breakdown if available */}
      {meritIncentives.breakdown && (
        <Box sx={{ width: '100%', mt: 2 }}>
          {/* <Typography
            variant="caption"
            color="text.primary"
            fontSize={13}
            fontWeight={'600'}
            sx={{ mb: 1 }}
          >
            <Trans>APY Breakdown</Trans>
          </Typography> */}

          <Row
            height={24}
            caption={<Typography variant={typographyVariant}>Protocol APY</Typography>}
            width="100%"
          >
            <FormattedNumber
              value={meritIncentives.breakdown.protocolAPY}
              percent
              variant={typographyVariant}
            />
          </Row>

          {meritIncentives.breakdown.protocolIncentivesAPR > 0 && (
            <Row
              height={24}
              caption={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant={typographyVariant}>Protocol Incentives</Typography>
                  <Typography variant={typographyVariant} sx={{ ml: 0.5 }}>
                    {meritIncentives.breakdown.isBorrow ? '(-)' : '(+)'}
                  </Typography>
                </Box>
              }
              width="100%"
            >
              <FormattedNumber
                value={meritIncentives.breakdown.protocolIncentivesAPR}
                percent
                variant={typographyVariant}
              />
            </Row>
          )}

          <Row
            height={24}
            caption={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant={typographyVariant}>Merit Incentives</Typography>
                <Typography variant={typographyVariant} sx={{ ml: 0.5 }}>
                  {meritIncentives.breakdown.isBorrow ? '(-)' : '(+)'}
                </Typography>
              </Box>
            }
            width="100%"
          >
            <FormattedNumber
              value={meritIncentives.breakdown.meritIncentivesAPR}
              percent
              variant={typographyVariant}
            />
          </Row>

          <Row
            height={24}
            caption={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant={typographyVariant} fontWeight="600">
                  Total APY
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({meritIncentives.breakdown.isBorrow ? 'Borrow Rate' : 'Supply Rate'})
                </Typography>
              </Box>
            }
            width="100%"
          >
            <FormattedNumber
              value={meritIncentives.breakdown.totalAPY}
              percent
              variant={typographyVariant}
              fontWeight="600"
            />
          </Row>
        </Box>
      )}
    </Box>
  );
};
