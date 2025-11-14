import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography, useTheme } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import React from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import {
  isOrderCancelled,
  isOrderExpired,
  isOrderFilled,
  isOrderLoading,
} from 'src/components/transactions/Swap/helpers/cow';
import { swapTypesThatRequiresInvertedQuote } from 'src/components/transactions/Swap/hooks/useSwapQuote';

import {
  ActionName,
  CowSwapSubset,
  hasAmount,
  hasCollateralReserve,
  hasSrcOrDestToken,
  isSDKTransaction,
  TransactionHistoryItem,
  transactionHistoryItemTypeToSwapType,
  TransactionHistoryItemUnion,
} from '../types';

interface ActionDetailsProps {
  transaction: TransactionHistoryItemUnion;
  iconSize?: string;
  showStatusBadgeAsIconOnly?: boolean;
}

export const ActionTextMap = ({ action }: { action: ActionName }) => {
  switch (action) {
    // SDK transactions
    case ActionName.UserSupplyTransaction:
      return <Trans>Supply</Trans>;
    case ActionName.UserWithdrawTransaction:
      return <Trans>Withdraw</Trans>;
    case ActionName.UserBorrowTransaction:
      return <Trans>Borrow</Trans>;
    case ActionName.UserRepayTransaction:
      return <Trans>Repay</Trans>;
    case ActionName.UserUsageAsCollateralTransaction:
      return <Trans>Collateral usage</Trans>;
    case ActionName.UserLiquidationCallTransaction:
      return <Trans>Liquidation</Trans>;

    // Swap transactions
    case ActionName.Swap:
      return <Trans>Swap</Trans>;
    case ActionName.CollateralSwap:
      return <Trans>Collateral Swap</Trans>;
    case ActionName.DebtSwap:
      return <Trans>Debt Swap</Trans>;
    case ActionName.RepayWithCollateral:
      return <Trans>Repay with Collateral</Trans>;
    case ActionName.WithdrawAndSwap:
      return <Trans>Withdraw and Swap</Trans>;

    default:
      return <Trans>Unknown</Trans>;
  }
};

const StatusBadgeIconOnly = ({
  title,
  severity,
}: {
  title: React.ReactNode;
  severity: 'info' | 'success' | 'error';
}) => {
  const theme = useTheme();
  return (
    <DarkTooltip title={title} arrow enterTouchDelay={100} leaveTouchDelay={500} placement="top">
      <Box>
        <Warning
          severity={severity}
          sx={{
            my: 0,
            pt: 0.6,
            pb: 0.6,
            pr: 1.5,
            pl: 1.5,
            background: 'none',
            border: 'none',
            color: theme.palette.text.primary,
          }}
        />
      </Box>
    </DarkTooltip>
  );
};

const StatusBadgeText = ({
  children,
  severity,
}: {
  children: React.ReactNode;
  severity: 'info' | 'success' | 'error';
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
      <Warning
        severity={severity}
        sx={{
          my: 0,
          pt: 0.6,
          pb: 0.6,
          pr: 1.5,
          pl: 1.5,
          background: 'none',
          border: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        {children}
      </Warning>
    </Box>
  );
};

export const ActionDetails = ({
  transaction,
  iconSize = '16px',
  showStatusBadgeAsIconOnly = false,
}: ActionDetailsProps) => {
  if (isSDKTransaction(transaction) && hasAmount(transaction)) {
    const { amount, reserve } = transaction;
    const action = transaction.__typename;

    const isPositive = action === 'UserSupplyTransaction' || action === 'UserRepayTransaction';
    const symbol = isPositive ? '+' : '−';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TokenIcon symbol={reserve.underlyingToken.symbol} sx={{ fontSize: iconSize }} />
        <Typography variant="secondary14" color="text.primary" sx={{ ml: 1, mb: 0.5 }}>
          {symbol}
        </Typography>
        <DarkTooltip
          wrap
          title={
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="secondary14" color="common.white">
                ${amount.usd}
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <FormattedNumber
                  value={amount.amount.value}
                  variant="secondary14"
                  color="common.white"
                  sx={{ mr: 1 }}
                />
                <Typography variant="secondary14" color="common.white">
                  {reserve.underlyingToken.symbol}
                </Typography>
              </Box>
            </Box>
          }
          arrow
          placement="top"
        >
          <Box>
            <FormattedNumber
              value={amount.amount.value}
              variant="secondary14"
              color="text.primary"
              compact
              compactThreshold={100000}
              sx={{ mr: 1 }}
            />
          </Box>
        </DarkTooltip>
        <DarkTooltip
          title={
            <Typography variant="secondary14" color="common.white">
              {reserve.underlyingToken.name} ({reserve.underlyingToken.symbol})
            </Typography>
          }
          arrow
          placement="top"
        >
          <Typography variant="secondary14" color="text.primary">
            {reserve.underlyingToken.symbol}
          </Typography>
        </DarkTooltip>
      </Box>
    );
  }

  // For SDK liquidation transactions
  if (isSDKTransaction(transaction) && hasCollateralReserve(transaction)) {
    const { collateral, debtRepaid } = transaction;

    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }} pr={4.5}>
          <Typography variant="caption" color="text.secondary">
            <Trans>Liquidated collateral</Trans>
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <TokenIcon
              symbol={collateral.reserve.underlyingToken.symbol}
              sx={{ fontSize: iconSize, pr: 0.5 }}
            />
            <Typography variant="secondary14" color="text.primary" sx={{ ml: 1, mb: 0.5 }}>
              −
            </Typography>
            <DarkTooltip
              wrap
              title={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="secondary14" color="common.white">
                    ${collateral.amount!.usd}
                  </Typography>
                  <Box sx={{ display: 'flex' }}>
                    <FormattedNumber
                      value={collateral.amount!.amount.value}
                      variant="secondary14"
                      color="common.white"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="secondary14" color="common.white">
                      {collateral.reserve.underlyingToken.symbol}
                    </Typography>
                  </Box>
                </Box>
              }
              arrow
              placement="top"
            >
              <Box>
                <FormattedNumber
                  value={collateral.amount!.amount.value}
                  variant="secondary14"
                  color="text.primary"
                  sx={{ mr: 1 }}
                  compact
                  compactThreshold={100000}
                />
              </Box>
            </DarkTooltip>
            <Typography variant="secondary14" color="text.primary">
              {collateral.reserve.underlyingToken.symbol}
            </Typography>
          </Box>
        </Box>

        <SvgIcon sx={{ fontSize: '14px' }}>
          <ArrowNarrowRightIcon />
        </SvgIcon>

        <Box sx={{ display: 'flex', flexDirection: 'column' }} pl={4.5}>
          <Typography variant="caption" color="text.secondary">
            <Trans>Covered debt</Trans>
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <TokenIcon
              symbol={debtRepaid.reserve.underlyingToken.symbol}
              sx={{ fontSize: iconSize, pr: 0.5 }}
            />
            <Typography variant="secondary14" color="text.primary" sx={{ ml: 1, mb: 0.5 }}>
              +
            </Typography>
            <DarkTooltip
              wrap
              title={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="secondary14" color="common.white">
                    ${debtRepaid.amount.usd}
                  </Typography>
                  <Box sx={{ display: 'flex' }}>
                    <FormattedNumber
                      value={debtRepaid.amount.amount.value}
                      variant="secondary14"
                      color="common.white"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="secondary14" color="common.white">
                      {debtRepaid.reserve.underlyingToken.symbol}
                    </Typography>
                  </Box>
                </Box>
              }
              arrow
              placement="top"
            >
              <Box>
                <FormattedNumber
                  value={debtRepaid.amount.amount.value}
                  variant="secondary14"
                  color="text.primary"
                  sx={{ mr: 1 }}
                  compact
                  compactThreshold={100000}
                />
              </Box>
            </DarkTooltip>
            <Typography variant="secondary14" color="text.primary">
              {debtRepaid.reserve.underlyingToken.symbol}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // For UserUsageAsCollateralTransaction transactions
  if (
    isSDKTransaction(transaction) &&
    transaction.__typename === 'UserUsageAsCollateralTransaction'
  ) {
    const { enabled, reserve } = transaction;

    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <Typography variant="description" color="text.primary">
          <Trans>Collateralization</Trans>
        </Typography>
        {enabled ? (
          <Typography variant="subheader1" color="success.main" sx={{ px: 0.75 }}>
            <Trans>enabled</Trans>
          </Typography>
        ) : (
          <Typography variant="subheader1" color="error.main" sx={{ px: 0.75 }}>
            <Trans>disabled</Trans>
          </Typography>
        )}
        <Typography variant="description" color="text.primary" sx={{ mr: 0.5 }}>
          <Trans>for</Trans>
        </Typography>
        <TokenIcon symbol={reserve.underlyingToken.symbol} sx={{ fontSize: iconSize }} />
        <DarkTooltip
          title={
            <Typography variant="secondary14" color="common.white">
              {reserve.underlyingToken.name} ({reserve.underlyingToken.symbol})
            </Typography>
          }
          arrow
          placement="top"
        >
          <Typography variant="secondary14" color="text.primary" sx={{ ml: 1 }}>
            {reserve.underlyingToken.symbol}
          </Typography>
        </DarkTooltip>
      </Box>
    );
  }

  // For swap transactions with token pairs (CoW and ParaSwap)
  if (hasSrcOrDestToken(transaction)) {
    const swapType = transactionHistoryItemTypeToSwapType(transaction.action);
    const areInputsInverted = swapType && swapTypesThatRequiresInvertedQuote.includes(swapType);
    const data = transaction as TransactionHistoryItem<CowSwapSubset>;
    const swapTx = !areInputsInverted
      ? data
      : {
          ...data,
          underlyingSrcToken: data.underlyingDestToken,
          underlyingDestToken: data.underlyingSrcToken,
          srcAToken: data.destAToken,
          destAToken: data.srcAToken,
          srcAmount: data.destAmount,
          destAmount: data.srcAmount,
        };

    const formattedCowSwapSrcToken = swapTx.underlyingSrcToken;
    const formattedCowSwapDestToken = swapTx.underlyingDestToken;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }} pr={4.5}>
          <TokenIcon
            symbol={formattedCowSwapSrcToken.symbol}
            sx={{ fontSize: iconSize }}
            aToken={!!swapTx.srcAToken}
          />
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formatUnits(swapTx.srcAmount, swapTx.underlyingSrcToken.decimals)}{' '}
                {formattedCowSwapSrcToken.symbol}
              </Typography>
            }
            arrow
            placement="top"
            enterTouchDelay={100}
            leaveTouchDelay={500}
          >
            <Box>
              <FormattedNumber
                value={formatUnits(swapTx.srcAmount, swapTx.underlyingSrcToken.decimals)}
                variant="secondary14"
                color="text.primary"
                sx={{ mr: 1, ml: 1 }}
                visibleDecimals={2}
              />
            </Box>
          </DarkTooltip>
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formattedCowSwapSrcToken.name} ({formattedCowSwapSrcToken.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {formattedCowSwapSrcToken.symbol}
            </Typography>
          </DarkTooltip>
        </Box>
        <SvgIcon sx={{ fontSize: '14px' }}>
          <ArrowNarrowRightIcon />
        </SvgIcon>
        <Box sx={{ display: 'flex', alignItems: 'center' }} pl={4.5}>
          <TokenIcon
            symbol={formattedCowSwapDestToken.symbol}
            sx={{ fontSize: iconSize }}
            aToken={!!swapTx.destAToken}
          />
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formatUnits(swapTx.destAmount, swapTx.underlyingDestToken.decimals)}{' '}
                {formattedCowSwapDestToken.symbol}
              </Typography>
            }
            arrow
            placement="top"
            enterTouchDelay={100}
            leaveTouchDelay={500}
          >
            <Box>
              <FormattedNumber
                value={formatUnits(swapTx.destAmount, swapTx.underlyingDestToken.decimals)}
                variant="secondary14"
                color="text.primary"
                visibleDecimals={2}
                sx={{ mr: 1, ml: 1 }}
              />
            </Box>
          </DarkTooltip>
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formattedCowSwapDestToken.name} ({formattedCowSwapDestToken.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {formattedCowSwapDestToken.symbol}
            </Typography>
          </DarkTooltip>
        </Box>

        {/* Status */}
        {isOrderLoading(swapTx.status) && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 4.5 }}>
            {showStatusBadgeAsIconOnly ? (
              <StatusBadgeIconOnly title={<Trans>In Progress</Trans>} severity="info" />
            ) : (
              <>
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <StatusBadgeIconOnly title={<Trans>In Progress</Trans>} severity="info" />
                </Box>
                <StatusBadgeText severity="info">
                  <Trans>In Progress</Trans>
                </StatusBadgeText>
              </>
            )}
          </Box>
        )}
        {isOrderFilled(swapTx.status) && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 4.5 }}>
            {showStatusBadgeAsIconOnly ? (
              <StatusBadgeIconOnly title={<Trans>Filled</Trans>} severity="success" />
            ) : (
              <>
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <StatusBadgeIconOnly title={<Trans>Filled</Trans>} severity="success" />
                </Box>
                <StatusBadgeText severity="success">
                  <Trans>Filled</Trans>
                </StatusBadgeText>
              </>
            )}
          </Box>
        )}

        {(isOrderCancelled(swapTx.status) || isOrderExpired(swapTx.status)) && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 4.5 }}>
            {showStatusBadgeAsIconOnly ? (
              <StatusBadgeIconOnly
                title={
                  isOrderCancelled(swapTx.status) ? (
                    <Trans>Cancelled</Trans>
                  ) : (
                    <Trans>Expired</Trans>
                  )
                }
                severity="error"
              />
            ) : (
              <>
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <StatusBadgeIconOnly
                    title={
                      isOrderCancelled(swapTx.status) ? (
                        <Trans>Cancelled</Trans>
                      ) : (
                        <Trans>Expired</Trans>
                      )
                    }
                    severity="error"
                  />
                </Box>
                <StatusBadgeText severity="error">
                  {isOrderCancelled(swapTx.status) ? (
                    <Trans>Cancelled</Trans>
                  ) : (
                    <Trans>Expired</Trans>
                  )}
                </StatusBadgeText>
              </>
            )}
          </Box>
        )}
      </Box>
    );
  }

  // FALLBACK
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="secondary14" color="text.secondary">
        <Trans>Transaction details not available</Trans>
      </Typography>
    </Box>
  );
};
