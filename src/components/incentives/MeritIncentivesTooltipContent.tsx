import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';
import {
  ENABLE_SELF_CAMPAIGN,
  ExtendedReserveIncentiveResponse,
  MeritAction,
  MeritIncentivesBreakdown,
} from 'src/hooks/useMeritIncentives';
import { useModalContext } from 'src/hooks/useModal';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link, ROUTES } from '../primitives/Link';
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

const selfCampaignConfig: Map<MeritAction, { limit: string; token: string }> = new Map([
  [
    MeritAction.CELO_SUPPLY_USDT,
    {
      token: 'USDT',
      limit: 'the first $1,000 USDT supplied',
    },
  ],
  [
    MeritAction.CELO_SUPPLY_WETH,
    {
      token: 'WETH',
      limit: 'the first $35,000 of ETH supplied',
    },
  ],
]);
const isSelfVerificationCampaign = (action: MeritAction): boolean => {
  return selfCampaignConfig.has(action) && ENABLE_SELF_CAMPAIGN;
};

const isMultipleCampaigns = (actions: MeritAction[]): boolean => {
  return actions.length > 1;
};
const getRemainingMessagesWhenCombined = (
  actions: MeritAction[],
  mainAction: MeritAction,
  isCombined: boolean,
  actionMessages: Record<string, { customMessage?: string; customForumLink?: string }>
): string => {
  if (!isCombined) {
    return '';
  }

  const otherAction = actions.find((action) => action !== mainAction);
  return otherAction ? actionMessages[otherAction]?.customMessage || '' : '';
};

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
  onClose,
}: {
  meritIncentives: ExtendedReserveIncentiveResponse & {
    breakdown?: MeritIncentivesBreakdown;
    variants?: { selfAPY: number | null };
    activeActions: MeritAction[];
    actionMessages: Record<string, { customMessage?: string; customForumLink?: string }>;
  };
  onClose?: () => void;
}) => {
  const theme = useTheme();
  const { openClaimRewards } = useModalContext();
  const typographyVariant = 'secondary12';

  const handleClaimClick = () => {
    openClaimRewards();
    if (onClose) onClose();
  };
  const meritIncentivesFormatted = getSymbolMap(meritIncentives);
  const isCombinedMeritIncentives: boolean = meritIncentives.activeActions.length > 1;
  const campaignConfig = getCampaignConfig(meritIncentives.action);
  const selfConfig = selfCampaignConfig.get(meritIncentives.action);

  const remainingCustomMessage = getRemainingMessagesWhenCombined(
    meritIncentives.activeActions,
    meritIncentives.action,
    isCombinedMeritIncentives,
    meritIncentives.actionMessages
  );

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

      {campaignConfig.type === CampaignType.SELF_VERIFICATION && selfConfig && (
        <>
          <Typography variant="caption" color="text.secondary">
            <Trans>
              Supply {selfConfig.token} and double your yield by{' '}
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
              for {selfConfig.limit} per user.
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
      {isMultipleCampaigns(meritIncentives.activeActions) && remainingCustomMessage && (
        <Typography variant="caption" color="text.secondary">
          <Trans>{remainingCustomMessage}</Trans>
        </Typography>
      )}
      {meritIncentives.customMessage ? (
        <Typography variant="caption" color="text.secondary">
          <Trans>{meritIncentives.customMessage}</Trans>
        </Typography>
      ) : null}

      <Typography
        variant="caption"
        color="text.primary"
        fontSize={13}
        fontWeight={'600'}
        sx={{ display: 'inline' }}
      >
        {campaignConfig.type === CampaignType.SELF_VERIFICATION && selfConfig ? (
          <>
            <Trans>Merit Program and Self rewards can be claimed </Trans>
            <Typography
              component="span"
              onClick={handleClaimClick}
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '13px !important',
                fontWeight: 'bold',
                mx: 0.5,
              }}
              variant="caption"
              color="primary"
            >
              <Trans>here</Trans>
            </Typography>
            <Trans> or from the </Trans>
            <Link
              href={`${ROUTES.dashboard}`}
              sx={{
                textDecoration: 'underline',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '13px !important',
                mx: 0.5,
              }}
              variant="caption"
            >
              <Trans>dashboard</Trans>
            </Link>
            .
          </>
        ) : (
          <>
            <Trans>Merit Program rewards can be claimed </Trans>
            <Typography
              component="span"
              onClick={handleClaimClick}
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '13px !important',
                fontWeight: 'bold',
                mx: 0.5,
              }}
              variant="caption"
              color="primary"
            >
              <Trans>here</Trans>
            </Typography>
            <Trans> or from the </Trans>
            <Link
              href={`${ROUTES.dashboard}`}
              sx={{
                textDecoration: 'underline',
                fontWeight: 'bold !important',
                cursor: 'pointer',
                fontSize: '13px !important',
                mx: 0.5,
              }}
              variant="caption"
            >
              <Trans>dashboard</Trans>
            </Link>
          </>
        )}
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
              value={
                campaignConfig.type === CampaignType.SELF_VERIFICATION &&
                meritIncentives.variants?.selfAPY !== null &&
                meritIncentives.variants?.selfAPY !== undefined
                  ? +meritIncentivesFormatted.incentiveAPR + meritIncentives.variants.selfAPY
                  : +meritIncentivesFormatted.incentiveAPR
              }
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

          {campaignConfig.type === CampaignType.STANDARD && (
            <Row
              height={24}
              caption={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isMultipleCampaigns(meritIncentives.activeActions) ? (
                    <Typography variant={typographyVariant}>Merit Incentives Combined</Typography>
                  ) : (
                    <Typography variant={typographyVariant}>Merit Incentives</Typography>
                  )}

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
          )}

          {campaignConfig.type === CampaignType.CELO_STANDARD && (
            <Row
              height={24}
              caption={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isCombinedMeritIncentives ? (
                    <Typography variant={typographyVariant}>Merit Incentives Combined</Typography>
                  ) : (
                    <Typography variant={typographyVariant}>Merit Incentives</Typography>
                  )}

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
          )}

          {campaignConfig.type === CampaignType.SELF_VERIFICATION && selfConfig && (
            <>
              <Row
                height={24}
                caption={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isCombinedMeritIncentives ? (
                      <Typography variant={typographyVariant}>Merit Incentives Combined</Typography>
                    ) : (
                      <Typography variant={typographyVariant}>Merit Incentives</Typography>
                    )}

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
                    <Typography variant={typographyVariant}>Self Incentives</Typography>
                    <Typography variant={typographyVariant} sx={{ ml: 0.5 }}>
                      {meritIncentives.breakdown.isBorrow ? '(-)' : '(+)'}
                    </Typography>
                  </Box>
                }
                width="100%"
              >
                <FormattedNumber
                  value={
                    meritIncentives.variants?.selfAPY !== null &&
                    meritIncentives.variants?.selfAPY !== undefined
                      ? meritIncentives.variants.selfAPY
                      : meritIncentives.breakdown.meritIncentivesAPR
                  }
                  percent
                  variant={typographyVariant}
                />
              </Row>
            </>
          )}

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
              value={meritIncentives.breakdown?.totalAPY ?? 0}
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
