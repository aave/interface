import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import React from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

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
    default:
      return <></>;
  }
};

export const ActionDetails = <K extends keyof ActionFields>({
  transaction,
  iconSize,
  isConnectedTonWallet,
}: {
  transaction: TransactionHistoryItem<ActionFields[K]>;
  iconSize: string;
  isConnectedTonWallet?: boolean;
}) => {
  switch (transaction.action) {
    case 'Supply':
    case 'Deposit':
      const supplyTx = transaction as TransactionHistoryItem<ActionFields['Supply']>;
      const formattedSupplyReserve = fetchIconSymbolAndNameHistorical(supplyTx.reserve);

      const formattedSupplyAmount = formatUnits(
        supplyTx.amount,
        isConnectedTonWallet ? supplyTx.decimals : supplyTx.reserve.decimals
      );

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedSupplyReserve.iconSymbol} sx={{ fontSize: iconSize }} />
          <Typography
            variant="body1"
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
                    variant="body1"
                    color="common.white"
                    sx={{ mr: 2 }}
                    isConnectedTonWallet
                    compact={isConnectedTonWallet ? true : false}
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
                variant="body1"
                color="text.primary"
                compact
                compactThreshold={100000}
                sx={{ mr: 2 }}
                isConnectedTonWallet
              />
            </Box>
          </DarkTooltip>
          <DarkTooltip
            title={
              <Typography variant="body1" color="text.primary">
                {formattedSupplyReserve.name} ({formattedSupplyReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="body1" color="text.primary">
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
            variant="body1"
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
                    variant="body1"
                    color="text.primary"
                    sx={{ mr: 2 }}
                    isConnectedTonWallet
                    compact={isConnectedTonWallet ? true : false}
                  />
                  <Typography variant="body1" color="text.primary">
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
                variant="body1"
                color="text.primary"
                sx={{ mr: 2 }}
                compact
                compactThreshold={100000}
                isConnectedTonWallet
              />
            </Box>
          </DarkTooltip>
          <DarkTooltip
            title={
              <Typography variant="body1" color="text.primary">
                {formattedBorrowReserve.name} ({formattedBorrowReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="body1" color="text.primary">
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
            variant="body1"
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
                    variant="body1"
                    color="text.primary"
                    sx={{ mr: 2 }}
                    isConnectedTonWallet
                    compact={isConnectedTonWallet ? true : false}
                  />
                  <Typography variant="body1" color="text.primary">
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
                variant="body1"
                color="text.primary"
                sx={{ mr: 2 }}
                compact
                compactThreshold={100000}
                isConnectedTonWallet
              />
            </Box>
          </DarkTooltip>
          <DarkTooltip
            title={
              <Typography variant="body1" color="text.primary">
                {formattedWithdrawReserve.name} ({formattedWithdrawReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="body1" color="text.primary">
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
            variant="body1"
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
                    variant="body1"
                    color="text.primary"
                    sx={{ mr: 2 }}
                    isConnectedTonWallet
                    compact={isConnectedTonWallet ? true : false}
                  />
                  <Typography variant="body1" color="text.primary">
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
                variant="body1"
                color="text.primary"
                sx={{ mr: 2 }}
                compact
                compactThreshold={100000}
                isConnectedTonWallet
              />
            </Box>
          </DarkTooltip>
          <DarkTooltip
            title={
              <Typography variant="body1" color="text.primary">
                {formattedRepayReserve.name} ({formattedRepayReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography variant="body1" color="text.primary">
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
          <Typography variant="body3" color="text.primary">
            <Trans>Collateralization</Trans>
          </Typography>
          {collateralUsageTx.toState ? (
            <Typography variant="body3" color="text.primary" sx={{ px: 0.75 }}>
              <Trans>enabled</Trans>
            </Typography>
          ) : (
            <Typography variant="body3" color="error.main" sx={{ px: 0.75 }}>
              <Trans>disabled</Trans>
            </Typography>
          )}
          <Typography variant="body3" color="text.primary" sx={{ mr: 0.5 }}>
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
              <Typography variant="body1" color="text.primary">
                {formattedCollateralReserve.name} ({formattedCollateralReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography
              variant="body1"
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
          <Typography variant="body3" color="text.primary" px={2}>
            <Trans>for</Trans>
          </Typography>
          <TokenIcon symbol={formattedSwapReserve.iconSymbol} sx={{ fontSIze: iconSize }} />
          <DarkTooltip
            title={
              <Typography variant="body1" color="text.primary">
                {formattedSwapReserve.name} ({formattedSwapReserve.symbol})
              </Typography>
            }
            arrow
            placement="top"
          >
            <Typography
              variant="body1"
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
            <Typography variant="body2" color="text.primary">
              <Trans>Liquidated collateral</Trans>
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <TokenIcon
                symbol={formattedLiquidationColatReserve.iconSymbol}
                sx={{ fontSIze: iconSize, mr: 0.5 }}
              />
              <Box
                sx={{
                  ml: formattedLiquidationColatReserve.iconSymbol.split('_').length > 1 ? 3 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="body1"
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
                          variant="body1"
                          color="text.primary"
                          sx={{ mr: 1 }}
                          isConnectedTonWallet
                          compact={isConnectedTonWallet ? true : false}
                        />
                        <Typography variant="body1" color="text.primary">
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
                      variant="body1"
                      color="text.primary"
                      sx={{ mr: 1 }}
                      compact
                      compactThreshold={100000}
                      isConnectedTonWallet
                    />
                  </Box>
                </DarkTooltip>
                <DarkTooltip
                  title={
                    <Typography variant="body1" color="text.primary">
                      {formattedLiquidationColatReserve.name} (
                      {formattedLiquidationColatReserve.symbol})
                    </Typography>
                  }
                  arrow
                  placement="top"
                >
                  <Typography
                    variant="body1"
                    color="text.primary"
                    sx={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    {formattedLiquidationColatReserve.symbol}
                  </Typography>
                </DarkTooltip>
              </Box>
            </Box>
          </Box>
          <SvgIcon sx={{ fontSize: iconSize }}>
            <ArrowNarrowRightIcon />
          </SvgIcon>
          <Box sx={{ display: 'flex', flexDirection: 'column' }} pl={4.5}>
            <Typography variant="body2" color="text.primary">
              <Trans>Covered debt</Trans>
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <TokenIcon
                symbol={formattedLiquidationBorrowReserve.iconSymbol}
                sx={{ fontSIze: iconSize, md: 0.5 }}
              />
              <Box
                sx={{
                  ml: formattedLiquidationBorrowReserve.iconSymbol.split('_').length > 1 ? 3 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="body1"
                  color="text.primary"
                  sx={{ display: 'inline-flex', alignItems: 'center', mb: 0.5 }}
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
                          variant="body1"
                          color="text.primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body1" color="text.primary">
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
                      variant="body1"
                      color="text.primary"
                      sx={{ mr: 1 }}
                      compact
                      compactThreshold={100000}
                      isConnectedTonWallet
                    />
                  </Box>
                </DarkTooltip>
                <DarkTooltip
                  title={
                    <Typography variant="body1" color="text.primary">
                      {formattedLiquidationBorrowReserve.name} (
                      {formattedLiquidationBorrowReserve.symbol})
                    </Typography>
                  }
                  arrow
                  placement="top"
                >
                  <Typography variant="body1" color="text.primary" sx={{ display: 'inline-flex' }}>
                    {formattedLiquidationBorrowReserve.symbol}
                  </Typography>
                </DarkTooltip>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    default:
      return <></>;
  }
};
