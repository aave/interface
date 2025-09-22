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
} from 'src/components/transactions/Switch/cowprotocol/cowprotocol.helpers';

import {
  hasAmount,
  hasCollateralReserve,
  hasSrcOrDestToken,
  isCowSwapTransaction,
  isSDKTransaction,
  TransactionHistoryItemUnion,
} from '../types';

interface ActionDetailsProps {
  transaction: TransactionHistoryItemUnion;
  iconSize?: string;
}

export const ActionTextMap = ({ action }: { action: string }) => {
  switch (action) {
    // SDK transactions
    case 'UserSupplyTransaction':
      return <Trans>Supply</Trans>;
    case 'UserWithdrawTransaction':
      return <Trans>Withdraw</Trans>;
    case 'UserBorrowTransaction':
      return <Trans>Borrow</Trans>;
    case 'UserRepayTransaction':
      return <Trans>Repay</Trans>;
    case 'UserUsageAsCollateralTransaction':
      return <Trans>Collateral usage</Trans>;
    case 'UserLiquidationCallTransaction':
      return <Trans>Liquidation</Trans>;

    // CowSwap transactions
    case 'CowSwap':
      return <Trans>Swap</Trans>;
    case 'CowCollateralSwap':
      return <Trans>Collateral Swap</Trans>;

    default:
      return <Trans>Unknown</Trans>;
  }
};

export const ActionDetails = ({ transaction, iconSize = '16px' }: ActionDetailsProps) => {
  const theme = useTheme();

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

  // For CowSwap transactions
  if (isCowSwapTransaction(transaction) && hasSrcOrDestToken(transaction)) {
    const { underlyingSrcToken, underlyingDestToken, srcAmount, destAmount, status } = transaction;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }} pr={4.5}>
          <TokenIcon
            symbol={underlyingSrcToken.symbol}
            sx={{ fontSize: iconSize }}
            aToken={!!transaction.srcAToken}
          />
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formatUnits(srcAmount, underlyingSrcToken.decimals)} {underlyingSrcToken.symbol}
              </Typography>
            }
            arrow
            placement="top"
            enterTouchDelay={100}
            leaveTouchDelay={500}
          >
            <Box>
              <FormattedNumber
                value={formatUnits(srcAmount, underlyingSrcToken.decimals)}
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
                {underlyingSrcToken.name} ({underlyingSrcToken.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {underlyingSrcToken.symbol}
            </Typography>
          </DarkTooltip>
        </Box>

        <SvgIcon sx={{ fontSize: '14px' }}>
          <ArrowNarrowRightIcon />
        </SvgIcon>

        <Box sx={{ display: 'flex', alignItems: 'center' }} pl={4.5}>
          <TokenIcon
            symbol={underlyingDestToken.symbol}
            sx={{ fontSize: iconSize }}
            aToken={!!transaction.destAToken}
          />
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formatUnits(destAmount, underlyingDestToken.decimals)} {underlyingDestToken.symbol}
              </Typography>
            }
            arrow
            placement="top"
            enterTouchDelay={100}
            leaveTouchDelay={500}
          >
            <Box>
              <FormattedNumber
                value={formatUnits(destAmount, underlyingDestToken.decimals)}
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
                {underlyingDestToken.name} ({underlyingDestToken.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {underlyingDestToken.symbol}
            </Typography>
          </DarkTooltip>
        </Box>

        {/* ✅ Status para CowSwap */}
        {isOrderLoading(status) && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 4.5 }}>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <DarkTooltip
                title={<Trans>In Progress</Trans>}
                arrow
                enterTouchDelay={100}
                leaveTouchDelay={500}
                placement="top"
              >
                <Box>
                  <Warning
                    severity="info"
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
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Warning
                severity="info"
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
                <Trans>In Progress</Trans>
              </Warning>
            </Box>
          </Box>
        )}

        {isOrderFilled(status) && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 4.5 }}>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <DarkTooltip
                title={<Trans>Filled</Trans>}
                arrow
                enterTouchDelay={100}
                leaveTouchDelay={500}
                placement="top"
              >
                <Box>
                  <Warning
                    severity="success"
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
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Warning
                severity="success"
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
                <Trans>Filled</Trans>
              </Warning>
            </Box>
          </Box>
        )}

        {(isOrderCancelled(status) || isOrderExpired(status)) && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 4.5 }}>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <DarkTooltip
                title={isOrderCancelled(status) ? <Trans>Cancelled</Trans> : <Trans>Expired</Trans>}
                arrow
                placement="top"
                enterTouchDelay={100}
                leaveTouchDelay={500}
              >
                <Box>
                  <Warning
                    severity="error"
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
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Warning
                severity="error"
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
                {isOrderCancelled(status) ? <Trans>Cancelled</Trans> : <Trans>Expired</Trans>}
              </Warning>
            </Box>
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
