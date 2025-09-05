import { normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Skeleton,
  Typography,
} from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { CollateralType } from 'src/helpers/types';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { getDebtCeilingData } from 'src/hooks/useAssetCaps';
import { ModalType } from 'src/hooks/useModal';
import { calculateHFAfterSwap } from 'src/utils/hfUtils';

import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { getAssetCollateralType } from '../utils';
import { CollateralSwapModalDetails } from './CollateralSwap/CollateralSwapModalDetails';
import { isCowProtocolRates, SwitchRatesType } from './switch.types';

export const SwitchModalTxDetails = ({
  switchRates,
  selectedOutputToken,
  safeSlippage,
  gasLimit,
  selectedChainId,
  customReceivedTitle,
  reserves,
  user,
  selectedInputToken,
  modalType,
  loading,
}: {
  switchRates?: SwitchRatesType;
  selectedOutputToken: TokenInfoWithBalance;
  safeSlippage: number;
  gasLimit: string;
  selectedChainId: number;
  showGasStation: boolean | undefined;
  customReceivedTitle?: React.ReactNode;
  reserves: ComputedReserveData[];
  user?: ExtendedFormattedUser;
  selectedInputToken: TokenInfoWithBalance;
  modalType: ModalType;
  loading?: boolean;
}) => {
  if (!switchRates || !user) return null;

  if (loading)
    return (
      <TxModalDetails chainId={selectedChainId} showGasStation={false}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="rounded" height={18} width="40%" />
            <Skeleton variant="rounded" height={18} width="30%" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="rounded" height={18} width="35%" />
            <Skeleton variant="rounded" height={18} width="25%" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="rounded" height={18} width="50%" />
            <Skeleton variant="rounded" height={18} width="20%" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="rounded" height={18} width="40%" />
            <Skeleton variant="rounded" height={18} width="30%" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="rounded" height={18} width="20%" />
            <Skeleton variant="rounded" height={18} width="20%" />
          </Box>
        </Box>
      </TxModalDetails>
    );

  return (
    <TxModalDetails
      gasLimit={gasLimit}
      chainId={selectedChainId}
      showGasStation={switchRates.provider !== 'cowprotocol'}
    >
      {modalType === ModalType.CollateralSwap && (
        <CollateralSwapModalTxDetailsContent
          switchRates={switchRates}
          selectedOutputToken={selectedOutputToken}
          safeSlippage={safeSlippage}
          customReceivedTitle={customReceivedTitle}
          reserves={reserves}
          user={user}
          selectedInputToken={selectedInputToken}
        />
      )}

      {switchRates.provider === 'cowprotocol' ? (
        <IntentTxDetails
          switchRates={switchRates}
          selectedOutputToken={selectedOutputToken}
          safeSlippage={safeSlippage}
          customReceivedTitle={customReceivedTitle}
        />
      ) : (
        <MarketOrderTxDetails
          switchRates={switchRates}
          selectedOutputToken={selectedOutputToken}
          safeSlippage={safeSlippage}
          customReceivedTitle={customReceivedTitle}
        />
      )}
    </TxModalDetails>
  );
};
const IntentTxDetails = ({
  switchRates,
  selectedOutputToken,
  safeSlippage,
  customReceivedTitle,
}: {
  switchRates: SwitchRatesType;
  selectedOutputToken: TokenInfoWithBalance;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
}) => {
  const [costBreakdownExpanded, setCostBreakdownExpanded] = useState(false);

  if (!isCowProtocolRates(switchRates)) {
    throw new Error('Invalid switch rates');
  }

  const networkFee = switchRates.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString();
  const networkFeeFormatted = normalize(networkFee, switchRates.destDecimals);
  const networkFeeUsd = Number(networkFeeFormatted) * switchRates.destTokenPriceUsd;

  const partnerFee = switchRates.amountAndCosts.costs.partnerFee.amount.toString();
  const partnerFeeFormatted = normalize(partnerFee, switchRates.destDecimals);
  const partnerFeeUsd = Number(partnerFeeFormatted) * switchRates.destTokenPriceUsd;

  const totalCostsInUsd = networkFeeUsd + partnerFeeUsd; // + costs.slippageInUsd;

  const receivingInUsd = Number(switchRates?.destUSD) * (1 - safeSlippage);
  const sendingInUsd = Number(switchRates?.srcUSD);

  const priceImpact = !switchRates ? undefined : (1 - receivingInUsd / sendingInUsd) * 100;

  const networkCostsTooltip = (
    <TextWithTooltip variant="caption" text={<Trans>Network costs</Trans>}>
      <Trans>
        This is the cost of settling your order on-chain, including gas and any LP fees.
      </Trans>
    </TextWithTooltip>
  );

  const feeTooltip = (
    <TextWithTooltip variant="caption" text={<Trans>Fee</Trans>}>
      <Trans>
        Fees help support the user experience and security of the Aave application.{' '}
        <Link
          href="https://aave.com/docs/developers/smart-contracts/swap-features"
          target="_blank"
          rel="noopener"
        >
          Learn more.
        </Link>
      </Trans>
    </TextWithTooltip>
  );

  const destAmountAfterSlippage = normalizeBN(switchRates.destAmount, switchRates.destDecimals)
    .multipliedBy(1 - safeSlippage)
    .decimalPlaces(switchRates.destDecimals, BigNumber.ROUND_UP)
    .toString();

  return (
    <>
      <Accordion
        sx={{
          mb: 4,
          boxShadow: 'none',
          '&:before': { display: 'none' },
          '.MuiAccordionSummary-root': { minHeight: '24px', maxHeight: '24px' },
          backgroundColor: 'transparent',
        }}
        onChange={(_, expanded) => {
          setCostBreakdownExpanded(expanded);
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            padding: 0,
            minHeight: '24px',
            height: '24px',
            '.MuiAccordionSummary-content': { margin: 0 },
          }}
        >
          <Row
            caption={<Trans>{`Costs & Fees`}</Trans>}
            captionVariant="description"
            align="flex-start"
            width="100%"
          >
            {!costBreakdownExpanded && (
              <FormattedNumber
                sx={{ mt: 0.5 }}
                compact={false}
                symbol="usd"
                symbolsVariant="caption"
                roundDown={false}
                variant="caption"
                visibleDecimals={2}
                value={totalCostsInUsd}
              />
            )}
          </Row>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <Row
            mx={2}
            mb={2}
            mt={2}
            caption={networkCostsTooltip}
            captionVariant="caption"
            align="flex-start"
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ExternalTokenIcon
                  symbol={selectedOutputToken.symbol}
                  logoURI={selectedOutputToken.logoURI}
                  sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                />
                <FormattedNumber value={networkFeeFormatted} variant="secondary12" compact />
              </Box>
              <FormattedNumber
                value={networkFeeUsd}
                variant="helperText"
                compact
                symbol="USD"
                symbolsColor="text.secondary"
                color="text.secondary"
              />
            </Box>
          </Row>
          <Row mx={2} mb={2} caption={feeTooltip} captionVariant="caption" align="flex-start">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ExternalTokenIcon
                  symbol={selectedOutputToken.symbol}
                  logoURI={selectedOutputToken.logoURI}
                  sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                />
                <FormattedNumber value={partnerFeeFormatted} variant="secondary12" compact />
              </Box>
              <FormattedNumber
                value={partnerFeeUsd}
                variant="helperText"
                compact
                symbol="USD"
                symbolsColor="text.secondary"
                color="text.secondary"
              />
            </Box>
          </Row>
        </AccordionDetails>
      </Accordion>

      <Row
        mb={4}
        caption={
          customReceivedTitle || <Trans>{`Minimum ${selectedOutputToken.symbol} received`}</Trans>
        }
        captionVariant="description"
        align="flex-start"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ExternalTokenIcon
              symbol={selectedOutputToken.symbol}
              logoURI={selectedOutputToken.logoURI}
              sx={{ mr: 2, ml: 4, fontSize: '16px' }}
            />
            <FormattedNumber
              value={destAmountAfterSlippage}
              variant="secondary14"
              compact
              roundDown={true}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormattedNumber
              value={Number(switchRates.destUSD) * (1 - safeSlippage)}
              variant="helperText"
              compact
              symbol="USD"
              symbolsColor="text.secondary"
              color="text.secondary"
              roundDown={true}
            />
            {/* Price impact */}
            {priceImpact && priceImpact > 0 && priceImpact < 100 && (
              <Typography
                variant="helperText"
                style={{ marginLeft: 4 }}
                color={priceImpact > 10 ? 'error' : priceImpact > 5 ? 'warning' : 'text.secondary'}
              >
                (-{priceImpact.toFixed(priceImpact > 3 ? 0 : priceImpact > 1 ? 1 : 2)}%)
              </Typography>
            )}
          </Box>
        </Box>
      </Row>
    </>
  );
};
const MarketOrderTxDetails = ({
  switchRates,
  selectedOutputToken,
  safeSlippage,
  customReceivedTitle,
}: {
  switchRates: SwitchRatesType;
  selectedOutputToken: TokenInfoWithBalance;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
}) => {
  return (
    <>
      <Row
        caption={
          customReceivedTitle || <Trans>{`Minimum ${selectedOutputToken.symbol} received`}</Trans>
        }
        captionVariant="description"
        align="flex-start"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ExternalTokenIcon
              symbol={selectedOutputToken.symbol}
              logoURI={selectedOutputToken.logoURI}
              sx={{ mr: 2, ml: 4, fontSize: '16px' }}
            />
            <FormattedNumber
              value={Number(
                normalize(
                  Number(switchRates.destAmount) * (1 - safeSlippage),
                  switchRates.destDecimals
                )
              )}
              variant="secondary14"
              compact
              roundDown={true}
            />
          </Box>
          <FormattedNumber
            value={Number(switchRates.destUSD) * (1 - safeSlippage)}
            variant="helperText"
            compact
            symbol="USD"
            symbolsColor="text.secondary"
            color="text.secondary"
            roundDown={true}
          />
        </Box>
      </Row>
    </>
  );
};

const CollateralSwapModalTxDetailsContent = ({
  switchRates,
  selectedOutputToken,
  safeSlippage,
  reserves,
  user,
  selectedInputToken,
}: {
  switchRates: SwitchRatesType;
  selectedOutputToken: TokenInfoWithBalance;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  reserves: ComputedReserveData[];
  user: ExtendedFormattedUser;
  selectedInputToken: TokenInfoWithBalance;
}) => {
  // Map selected tokens to reserves and user reserves
  const poolReserve = reserves.find(
    (r) => r.underlyingAsset.toLowerCase() === selectedInputToken.address.toLowerCase()
  ) as ComputedReserveData | undefined;
  const targetReserve = reserves.find(
    (r) => r.underlyingAsset.toLowerCase() === selectedOutputToken.address.toLowerCase()
  ) as ComputedReserveData | undefined;

  if (!poolReserve || !targetReserve || !user) return null;

  const userReserve = user.userReservesData.find(
    (ur) => ur.underlyingAsset.toLowerCase() === poolReserve.underlyingAsset.toLowerCase()
  ) as ComputedUserReserveData | undefined;
  const userTargetReserve = user.userReservesData.find(
    (ur) => ur.underlyingAsset.toLowerCase() === targetReserve.underlyingAsset.toLowerCase()
  ) as ComputedUserReserveData | undefined;

  if (!userReserve || !userTargetReserve) return null;

  // Show HF only when there are borrows and source reserve is collateralizable
  const showHealthFactor =
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    poolReserve.reserveLiquidationThreshold !== '0';

  // Amounts in human units (mirror other components: intent uses destSpot, market uses destAmount)
  const fromAmount = normalizeBN(switchRates.srcAmount, switchRates.srcDecimals).toString();
  const toAmountRaw = normalizeBN(
    switchRates.provider === 'cowprotocol' ? switchRates.destSpot : switchRates.destAmount,
    switchRates.destDecimals
  ).toString();
  const toAmountAfterSlippage = valueToBigNumber(toAmountRaw)
    .multipliedBy(1 - safeSlippage)
    .toString();

  // Compute collateral types
  const { debtCeilingReached: sourceDebtCeiling } = getDebtCeilingData(targetReserve);
  const swapSourceCollateralType: CollateralType = getAssetCollateralType(
    userReserve,
    user.totalCollateralUSD,
    user.isInIsolationMode,
    sourceDebtCeiling
  );
  const { debtCeilingReached: targetDebtCeiling } = getDebtCeilingData(targetReserve);
  const swapTargetCollateralType: CollateralType = getAssetCollateralType(
    userTargetReserve,
    user.totalCollateralUSD,
    user.isInIsolationMode,
    targetDebtCeiling
  );

  // Health factor after swap using slippage-adjusted output amount
  const { hfAfterSwap } = calculateHFAfterSwap({
    fromAmount,
    fromAssetData: poolReserve,
    fromAssetUserData: userReserve,
    user,
    toAmountAfterSlippage: toAmountAfterSlippage,
    toAssetData: targetReserve,
  });

  return (
    <CollateralSwapModalDetails
      showHealthFactor={showHealthFactor}
      healthFactor={user.healthFactor}
      healthFactorAfterSwap={hfAfterSwap.toString(10)}
      swapSource={{ ...userReserve, collateralType: swapSourceCollateralType }}
      swapTarget={{ ...userTargetReserve, collateralType: swapTargetCollateralType }}
      toAmount={toAmountAfterSlippage}
      fromAmount={fromAmount === '' ? '0' : fromAmount}
      loading={false}
      showBalance={false}
    />
  );
};
