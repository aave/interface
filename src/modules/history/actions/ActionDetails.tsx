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

import { BorrowRateModeBlock } from '../actions/BorrowRateModeBlock';
import { fetchIconSymbolAndNameHistorical } from '../helpers';
import { PriceUnavailable } from '../PriceUnavailable';
import { ActionFields, TransactionHistoryItem } from '../types';

export const ActionTextMap = ({ action }: { action: string }) => {
  switch (action) {
    case 'Supply':
    case 'Deposit':
      return <Trans>Supply</Trans>;
    case 'Borrow':
      return <Trans>Borrow</Trans>;
    case 'RedeemUnderlying':
      return <Trans>Withdraw</Trans>;
    case 'Repay':
      return <Trans>Repay</Trans>;
    case 'UsageAsCollateral':
      return <Trans>Collateral usage</Trans>;
    case 'SwapBorrowRate':
    case 'Swap':
      return <Trans>Borrow rate change</Trans>;
    case 'LiquidationCall':
      return <Trans>Liquidation</Trans>;
    case 'CowSwap':
      return <Trans>Swap</Trans>;
    case 'CowCollateralSwap':
      return <Trans>Collateral Swap</Trans>;
    default:
      return <></>;
  }
};

export const ActionDetails = <K extends keyof ActionFields>({
  transaction,
  iconSize,
}: {
  transaction: TransactionHistoryItem<ActionFields[K]>;
  iconSize: string;
}) => {
  const theme = useTheme();

  switch (transaction.action) {
    case 'Supply':
    case 'Deposit':
      const supplyTx = transaction as TransactionHistoryItem<ActionFields['Supply']>;
      const formattedSupplyReserve = fetchIconSymbolAndNameHistorical(supplyTx.reserve);
      const formattedSupplyAmount = formatUnits(supplyTx.amount, supplyTx.reserve.decimals);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedSupplyReserve.iconSymbol} sx={{ fontSize: iconSize }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedSupplyReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mb: 0.5 }}
          >
            +
          </Typography>
          <DarkTooltip
            wrap
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PriceUnavailable
                  value={Number(supplyTx.assetPriceUSD) * Number(formattedSupplyAmount)}
                />
                <Box sx={{ display: 'flex' }}>
                  <FormattedNumber
                    value={formattedSupplyAmount}
                    variant="secondary14"
                    color="common.white"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="secondary14" color="common.white">
                    {formattedSupplyReserve.symbol}
                  </Typography>
                </Box>
              </Box>
            }
            arrow
            placement="top"
          >
            <Box>
              <FormattedNumber
                value={formattedSupplyAmount}
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
                {formattedSupplyReserve.name} ({formattedSupplyReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {formattedSupplyReserve.symbol}
            </Typography>
          </DarkTooltip>
        </Box>
      );
    case 'Borrow':
      const borrowTx = transaction as TransactionHistoryItem<ActionFields['Borrow']>;
      const formattedBorrowReserve = fetchIconSymbolAndNameHistorical(borrowTx.reserve);
      const formattedBorrowAmount = formatUnits(borrowTx.amount, borrowTx.reserve.decimals);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedBorrowReserve.iconSymbol} sx={{ fontSIze: iconSize }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedBorrowReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mb: 0.5 }}
          >
            &minus;
          </Typography>
          <DarkTooltip
            wrap
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PriceUnavailable
                  value={Number(borrowTx.assetPriceUSD) * Number(formattedBorrowAmount)}
                />
                <Box sx={{ display: 'flex' }}>
                  <FormattedNumber
                    value={formattedBorrowAmount}
                    variant="secondary14"
                    color="common.white"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="secondary14" color="common.white">
                    {formattedBorrowReserve.symbol}
                  </Typography>
                </Box>
              </Box>
            }
            arrow
            placement="top"
          >
            <Box>
              <FormattedNumber
                value={formattedBorrowAmount}
                variant="secondary14"
                color="text.primary"
                sx={{ mr: 1 }}
                compact
                compactThreshold={100000}
              />
            </Box>
          </DarkTooltip>
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formattedBorrowReserve.name} ({formattedBorrowReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {formattedBorrowReserve.symbol}
            </Typography>
          </DarkTooltip>
        </Box>
      );
    case 'RedeemUnderlying':
      const withdrawTx = transaction as TransactionHistoryItem<ActionFields['RedeemUnderlying']>;
      const formattedWithdrawReserve = fetchIconSymbolAndNameHistorical(withdrawTx.reserve);
      const formattedWithdrawAmount = formatUnits(withdrawTx.amount, withdrawTx.reserve.decimals);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedWithdrawReserve.iconSymbol} sx={{ fontSIze: iconSize }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedWithdrawReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mb: 0.5 }}
          >
            &minus;
          </Typography>
          <DarkTooltip
            wrap
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PriceUnavailable
                  value={Number(withdrawTx.assetPriceUSD) * Number(formattedWithdrawAmount)}
                />
                <Box sx={{ display: 'flex' }}>
                  <FormattedNumber
                    value={formattedWithdrawAmount}
                    variant="secondary14"
                    color="common.white"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="secondary14" color="common.white">
                    {formattedWithdrawReserve.symbol}
                  </Typography>
                </Box>
              </Box>
            }
            arrow
            placement="top"
          >
            <Box>
              <FormattedNumber
                value={formattedWithdrawAmount}
                variant="secondary14"
                color="text.primary"
                sx={{ mr: 1 }}
                compact
                compactThreshold={100000}
              />
            </Box>
          </DarkTooltip>
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formattedWithdrawReserve.name} ({formattedWithdrawReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {formattedWithdrawReserve.symbol}
            </Typography>
          </DarkTooltip>
        </Box>
      );
    case 'Repay':
      const repayTx = transaction as TransactionHistoryItem<ActionFields['Repay']>;
      const formattedRepayReserve = fetchIconSymbolAndNameHistorical(repayTx.reserve);
      const formattedRepayAmount = formatUnits(repayTx.amount, repayTx.reserve.decimals);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedRepayReserve.iconSymbol} sx={{ fontSIze: iconSize }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedRepayReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mb: 0.5 }}
          >
            +
          </Typography>
          <DarkTooltip
            wrap
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PriceUnavailable
                  value={Number(repayTx.assetPriceUSD) * Number(formattedRepayAmount)}
                />
                <Box sx={{ display: 'flex' }}>
                  <FormattedNumber
                    value={formattedRepayAmount}
                    variant="secondary14"
                    color="common.white"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="secondary14" color="common.white">
                    {formattedRepayReserve.symbol}
                  </Typography>
                </Box>
              </Box>
            }
            arrow
            placement="top"
          >
            <Box>
              <FormattedNumber
                value={formattedRepayAmount}
                variant="secondary14"
                color="text.primary"
                sx={{ mr: 1 }}
                compact
                compactThreshold={100000}
              />
            </Box>
          </DarkTooltip>
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formattedRepayReserve.name} ({formattedRepayReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="sucess.main">
              {formattedRepayReserve.symbol}
            </Typography>
          </DarkTooltip>
        </Box>
      );
    case 'UsageAsCollateral':
      const collateralUsageTx = transaction as TransactionHistoryItem<
        ActionFields['UsageAsCollateral']
      >;
      const formattedCollateralReserve = fetchIconSymbolAndNameHistorical(
        collateralUsageTx.reserve
      );
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Typography variant="description" color="text.primary">
            <Trans>Collateralization</Trans>
          </Typography>
          {collateralUsageTx.toState === true ? (
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
          <TokenIcon
            symbol={formattedCollateralReserve.iconSymbol}
            sx={{
              fontSIze: iconSize,
            }}
          />
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formattedCollateralReserve.name} ({formattedCollateralReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography
              variant="secondary14"
              color="text.primary"
              sx={{ ml: formattedCollateralReserve.iconSymbol.split('_').length > 1 ? 3 : 1 }}
            >
              {formattedCollateralReserve.symbol}
            </Typography>
          </DarkTooltip>
        </Box>
      );
    case 'SwapBorrowRate':
    case 'Swap':
      const swapBorrowRateTx = transaction as TransactionHistoryItem<
        ActionFields['SwapBorrowRate']
      >;
      const formattedSwapReserve = fetchIconSymbolAndNameHistorical(swapBorrowRateTx.reserve);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <BorrowRateModeBlock
            borrowRateMode={swapBorrowRateTx.borrowRateModeFrom.toString()}
            swapBorrowRateTx={swapBorrowRateTx}
          />
          <SvgIcon sx={{ fontSize: '20px', px: 1 }}>
            <ArrowNarrowRightIcon />
          </SvgIcon>
          <BorrowRateModeBlock
            borrowRateMode={swapBorrowRateTx.borrowRateModeTo.toString()}
            swapBorrowRateTx={swapBorrowRateTx}
          />
          <Typography variant="caption" color="text.secondary" px={2}>
            <Trans>for</Trans>
          </Typography>
          <TokenIcon symbol={formattedSwapReserve.iconSymbol} sx={{ fontSIze: iconSize }} />
          <DarkTooltip
            title={
              <Typography variant="secondary14" color="common.white">
                {formattedSwapReserve.name} ({formattedSwapReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography
              variant="secondary14"
              color="text.primary"
              sx={{ ml: formattedSwapReserve.iconSymbol.split('_').length > 1 ? 3 : 1 }}
            >
              {swapBorrowRateTx.reserve.symbol}
            </Typography>
          </DarkTooltip>
        </Box>
      );
    case 'LiquidationCall':
      const liquidationTx = transaction as TransactionHistoryItem<ActionFields['LiquidationCall']>;
      const formattedLiquidationColatReserve = fetchIconSymbolAndNameHistorical(
        liquidationTx.collateralReserve
      );
      const formattedLiquidationBorrowReserve = fetchIconSymbolAndNameHistorical(
        liquidationTx.principalReserve
      );
      const formattedCollateralAmount = formatUnits(
        liquidationTx.collateralAmount,
        liquidationTx.collateralReserve.decimals
      );
      const formattedLiquidationBorrowAmount = formatUnits(
        liquidationTx.principalAmount,
        liquidationTx.principalReserve.decimals
      );
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }} pr={4.5}>
            <Typography>
              <Trans>Liquidated collateral</Trans>
            </Typography>
            <Box sx={{ display: 'inline-flex' }}>
              <TokenIcon
                symbol={formattedLiquidationColatReserve.iconSymbol}
                sx={{ fontSIze: iconSize, pr: 0.5 }}
              />
              <Box
                sx={{
                  ml: formattedLiquidationColatReserve.iconSymbol.split('_').length > 1 ? 3 : 1,
                  display: 'inline-flex',
                }}
              >
                <Typography
                  variant="secondary14"
                  color="text.primary"
                  sx={{ display: 'inline-flex', mb: 0.5 }}
                >
                  &minus;
                </Typography>
                <DarkTooltip
                  wrap
                  title={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <PriceUnavailable
                        value={
                          Number(liquidationTx.collateralAssetPriceUSD) *
                          Number(formattedCollateralAmount)
                        }
                      />
                      <Box sx={{ display: 'flex' }}>
                        <FormattedNumber
                          value={formattedCollateralAmount}
                          variant="secondary14"
                          color="common.white"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="secondary14" color="common.white">
                          {formattedLiquidationColatReserve.symbol}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <Box>
                    <FormattedNumber
                      value={formattedCollateralAmount}
                      variant="secondary14"
                      color="text.primary"
                      sx={{ mr: 1 }}
                      compact
                      compactThreshold={100000}
                    />
                  </Box>
                </DarkTooltip>
                <DarkTooltip
                  title={
                    <Typography variant="secondary14" color="common.white">
                      {formattedLiquidationColatReserve.name} (
                      {formattedLiquidationColatReserve.symbol})
                    </Typography>
                  }
                  arrow
                  placement="top"
                >
                  <Typography
                    variant="secondary14"
                    color="text.primary"
                    sx={{ display: 'inline-flex' }}
                  >
                    {formattedLiquidationColatReserve.symbol}
                  </Typography>
                </DarkTooltip>
              </Box>
            </Box>
          </Box>
          <SvgIcon sx={{ fontSize: '14px' }}>
            <ArrowNarrowRightIcon />
          </SvgIcon>
          <Box sx={{ display: 'flex', flexDirection: 'column' }} pl={4.5}>
            <Typography>
              <Trans>Covered debt</Trans>
            </Typography>
            <Box sx={{ display: 'inline-flex' }}>
              <TokenIcon
                symbol={formattedLiquidationBorrowReserve.iconSymbol}
                sx={{ fontSIze: iconSize, pr: 0.5 }}
              />
              <Box
                sx={{
                  ml: formattedLiquidationBorrowReserve.iconSymbol.split('_').length > 1 ? 3 : 1,
                  display: 'inline-flex',
                }}
              >
                <Typography
                  variant="secondary14"
                  color="text.primary"
                  sx={{ display: 'inline-flex', mb: 0.5 }}
                >
                  +
                </Typography>
                <DarkTooltip
                  wrap
                  title={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <PriceUnavailable
                        value={
                          Number(liquidationTx.borrowAssetPriceUSD) *
                          Number(formattedLiquidationBorrowAmount)
                        }
                      />
                      <Box sx={{ display: 'flex' }}>
                        <FormattedNumber
                          value={formattedLiquidationBorrowAmount}
                          variant="secondary14"
                          color="common.white"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="secondary14" color="common.white">
                          {formattedLiquidationBorrowReserve.symbol}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <Box>
                    <FormattedNumber
                      value={formattedLiquidationBorrowAmount}
                      variant="secondary14"
                      color="text.primary"
                      sx={{ mr: 1 }}
                      compact
                      compactThreshold={100000}
                    />
                  </Box>
                </DarkTooltip>
                <DarkTooltip
                  title={
                    <Typography variant="secondary14" color="common.white">
                      {formattedLiquidationBorrowReserve.name} (
                      {formattedLiquidationBorrowReserve.symbol})
                    </Typography>
                  }
                  arrow
                  placement="top"
                >
                  <Typography
                    variant="secondary14"
                    color="text.primary"
                    sx={{ display: 'inline-flex' }}
                  >
                    {formattedLiquidationBorrowReserve.symbol}
                  </Typography>
                </DarkTooltip>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    case 'CowSwap':
    case 'CowCollateralSwap':
      const cowSwapTx = transaction as TransactionHistoryItem<ActionFields['CowSwap']>;
      const formattedCowSwapSrcToken = fetchIconSymbolAndNameHistorical(
        cowSwapTx.underlyingSrcToken
      );
      const formattedCowSwapDestToken = fetchIconSymbolAndNameHistorical(
        cowSwapTx.underlyingDestToken
      );
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }} pr={4.5}>
            <TokenIcon
              symbol={formattedCowSwapSrcToken.iconSymbol}
              sx={{ fontSize: iconSize }}
              aToken={!!cowSwapTx.srcAToken}
            />
            <DarkTooltip
              title={
                <Typography variant="secondary14" color="common.white">
                  {formatUnits(cowSwapTx.srcAmount, cowSwapTx.underlyingSrcToken.decimals)}{' '}
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
                  value={formatUnits(cowSwapTx.srcAmount, cowSwapTx.underlyingSrcToken.decimals)}
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
              symbol={formattedCowSwapDestToken.iconSymbol}
              sx={{ fontSize: iconSize }}
              aToken={!!cowSwapTx.destAToken}
            />
            <DarkTooltip
              title={
                <Typography variant="secondary14" color="common.white">
                  {formatUnits(cowSwapTx.destAmount, cowSwapTx.underlyingDestToken.decimals)}{' '}
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
                  value={formatUnits(cowSwapTx.destAmount, cowSwapTx.underlyingDestToken.decimals)}
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
          {isOrderLoading(cowSwapTx.status) && (
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
          {isOrderFilled(cowSwapTx.status) && (
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

          {(isOrderCancelled(cowSwapTx.status) || isOrderExpired(cowSwapTx.status)) && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 4.5 }}>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <DarkTooltip
                  title={
                    isOrderCancelled(cowSwapTx.status) ? (
                      <Trans>Cancelled</Trans>
                    ) : (
                      <Trans>Expired</Trans>
                    )
                  }
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
                  {isOrderCancelled(cowSwapTx.status) ? (
                    <Trans>Cancelled</Trans>
                  ) : (
                    <Trans>Expired</Trans>
                  )}
                </Warning>
              </Box>
            </Box>
          )}
        </Box>
      );
    default:
      return <></>;
  }
};
