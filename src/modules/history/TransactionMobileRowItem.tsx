// yes this file is a mess, it'll be broken up and refactored once stable

import { ArrowNarrowRightIcon, CheckIcon, DuplicateIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { CompactableTypography, CompactMode } from 'src/components/CompactableTypography';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { ActionFields, TransactionHistoryItem } from 'src/hooks/useTransactionHistory';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import { BorrowRateModeBlock } from './BorrowRateModeBlock';

const PriceUnavailableTooltip = ({ price }: { price: string }) => {
  if (Number(price) > 0) {
    return <></>;
  } else {
    return (
      <TextWithTooltip>
        <Trans>
          Price data is not currently available for this reserve on the protocol subgraph
        </Trans>
      </TextWithTooltip>
    );
  }
};

const ActionTextMap = ({ action }: { action: string }) => {
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

const ActionDetails = <K extends keyof ActionFields>({
  transaction,
}: {
  transaction: TransactionHistoryItem<ActionFields[K]>;
}) => {
  switch (transaction.action) {
    case 'Supply':
    case 'Deposit':
      const supplyTx = transaction as TransactionHistoryItem<ActionFields['Supply']>;
      const formattedSupplyReserve = fetchIconSymbolAndName(supplyTx.reserve);
      const formattedSupplyAmount = formatUnits(supplyTx.amount, supplyTx.reserve.decimals);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedSupplyReserve.iconSymbol} sx={{ fontSize: '24px' }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedSupplyReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mb: 0.5 }}
          >
            +
          </Typography>
          <DarkTooltip
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ display: 'flex' }}>
                  <FormattedNumber
                    compact
                    compactThreshold={100000}
                    symbol="USD"
                    symbolsColor="common.white"
                    value={Number(supplyTx.assetPriceUSD) * Number(formattedSupplyAmount)}
                  />
                  <PriceUnavailableTooltip price={supplyTx.assetPriceUSD} />
                </Box>
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
      const formattedBorrowReserve = fetchIconSymbolAndName(borrowTx.reserve);
      const formattedBorrowAmount = formatUnits(borrowTx.amount, borrowTx.reserve.decimals);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedBorrowReserve.iconSymbol} sx={{ fontSIze: '24px' }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedBorrowReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mb: 0.5 }}
          >
            &minus;
          </Typography>
          <DarkTooltip
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ display: 'flex' }}>
                  <FormattedNumber
                    compact
                    compactThreshold={100000}
                    symbol="USD"
                    symbolsColor="common.white"
                    value={Number(borrowTx.assetPriceUSD) * Number(formattedBorrowAmount)}
                  />
                  <PriceUnavailableTooltip price={borrowTx.assetPriceUSD} />
                </Box>
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
      const formattedWithdrawReserve = fetchIconSymbolAndName(withdrawTx.reserve);
      const formattedWithdrawAmount = formatUnits(withdrawTx.amount, withdrawTx.reserve.decimals);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedWithdrawReserve.iconSymbol} sx={{ fontSIze: '24px' }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedWithdrawReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mb: 0.5 }}
          >
            &minus;
          </Typography>
          <DarkTooltip
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ display: 'flex' }}>
                  <FormattedNumber
                    compact
                    compactThreshold={100000}
                    symbol="USD"
                    symbolsColor="common.white"
                    value={Number(withdrawTx.assetPriceUSD) * Number(formattedWithdrawAmount)}
                  />
                  <PriceUnavailableTooltip price={withdrawTx.assetPriceUSD} />
                </Box>
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
      const formattedRepayReserve = fetchIconSymbolAndName(repayTx.reserve);
      const formattedRepayAmount = formatUnits(repayTx.amount, repayTx.reserve.decimals);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedRepayReserve.iconSymbol} sx={{ fontSIze: '24px' }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedRepayReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mb: 0.5 }}
          >
            +
          </Typography>
          <DarkTooltip
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ display: 'flex' }}>
                  <FormattedNumber
                    compact
                    compactThreshold={100000}
                    symbol="USD"
                    symbolsColor="common.white"
                    value={Number(repayTx.assetPriceUSD) * Number(formattedRepayAmount)}
                  />
                  <PriceUnavailableTooltip price={repayTx.assetPriceUSD} />
                </Box>
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
      const formattedCollateralReserve = fetchIconSymbolAndName(collateralUsageTx.reserve);
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
              fontSIze: '24px',
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
      const formattedSwapReserve = fetchIconSymbolAndName(swapBorrowRateTx.reserve);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <BorrowRateModeBlock from={true} swapBorrowRateTx={swapBorrowRateTx} />
          <SvgIcon sx={{ fontSize: '20px', px: 1 }}>
            <ArrowNarrowRightIcon />
          </SvgIcon>
          <BorrowRateModeBlock swapBorrowRateTx={swapBorrowRateTx} />
          <Typography variant="caption" color="text.secondary" px={2}>
            <Trans>for</Trans>
          </Typography>
          <TokenIcon symbol={formattedSwapReserve.iconSymbol} sx={{ fontSIze: '24px' }} />
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
      const formattedLiquidationColatReserve = fetchIconSymbolAndName(
        liquidationTx.collateralReserve
      );
      const formattedLiquidationBorrowReserve = fetchIconSymbolAndName(
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
                sx={{ fontSIze: '24px', pr: 0.5 }}
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
                  title={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex' }}>
                        <FormattedNumber
                          compact
                          compactThreshold={100000}
                          symbol="USD"
                          symbolsColor="common.white"
                          value={
                            Number(liquidationTx.collateralAssetPriceUSD) *
                            Number(formattedCollateralAmount)
                          }
                        />
                        <PriceUnavailableTooltip price={liquidationTx.collateralAssetPriceUSD} />
                      </Box>
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
                sx={{ fontSIze: '24px', pr: 0.5 }}
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
                  title={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex' }}>
                        <FormattedNumber
                          compact
                          compactThreshold={100000}
                          symbol="USD"
                          symbolsColor="common.white"
                          value={
                            Number(liquidationTx.borrowAssetPriceUSD) *
                            Number(formattedLiquidationBorrowAmount)
                          }
                        />
                        <PriceUnavailableTooltip price={liquidationTx.borrowAssetPriceUSD} />
                      </Box>
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
    default:
      return <></>;
  }
};

function ActionTitle({ action }: { action: string }) {
  return (
    <Typography variant="subheader2" color="text.muted">
      <ActionTextMap action={action} />
    </Typography>
  );
}

function unixTimestampToFormattedTime({ unixTimestamp }: { unixTimestamp: number }) {
  const date = new Date(unixTimestamp * 1000);
  const hours24 = date.getHours();
  const hours12 = ((hours24 + 24 - 1) % 12) + 1; // Convert to 12-hour format
  const minutes = date.getMinutes();
  const amOrPm = hours24 < 12 ? 'AM' : 'PM';

  const formattedHours = String(hours12).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
}

interface TransactionHistoryItemProps {
  transaction: TransactionHistoryItem & ActionFields[keyof ActionFields];
}

function TransactionMobileRowItem({ transaction }: TransactionHistoryItemProps) {
  const [copyStatus, setCopyStatus] = useState(false);
  const [currentNetworkConfig] = useRootStore((state) => [state.currentNetworkConfig]);
  const theme = useTheme();

  const downToMD = useMediaQuery(theme.breakpoints.down('md'));
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCopy = async (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
  };

  useEffect(() => {
    if (copyStatus) {
      const timer = setTimeout(() => {
        setCopyStatus(false);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [copyStatus]);

  const explorerLink = currentNetworkConfig.explorerLinkBuilder({ tx: transaction.txHash });

  return (
    <Box>
      <ListItem
        px={4}
        sx={{
          borderWidth: `1px 0 0 0`,
          borderStyle: `solid`,
          borderColor: `${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'left',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              pt: '14px',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ActionTitle action={transaction.action} />
              <Typography variant="caption" color="text.muted">
                {unixTimestampToFormattedTime({ unixTimestamp: transaction.timestamp })}
              </Typography>
            </Box>

            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <DarkTooltip
                title={copyStatus ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
                placement="top"
              >
                <Box
                  onClick={() => handleCopy(explorerLink)}
                  sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  {!downToMD && (
                    <React.Fragment>
                      <Typography variant="caption" color="text.secondary" mr={1}>
                        <Trans>Tx hash</Trans>
                      </Typography>
                      <CompactableTypography
                        compactMode={CompactMode.MD}
                        variant="caption"
                        color="text.primary"
                      >
                        {transaction.txHash}
                      </CompactableTypography>
                    </React.Fragment>
                  )}
                  <SvgIcon
                    sx={{
                      m: 1,
                      fontSize: '14px',
                      color: copyStatus ? 'green' : downToSM ? 'text.muted' : 'text.secondary',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {copyStatus ? <CheckIcon /> : <DuplicateIcon />}
                  </SvgIcon>
                </Box>
              </DarkTooltip>
              <DarkTooltip placement="top" title={<Trans>View on block explorer</Trans>}>
                <Link href={explorerLink}>
                  <SvgIcon
                    sx={{
                      fontSize: '14px',
                      color: downToSM ? 'text.muted' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ArrowOutward />
                  </SvgIcon>
                </Link>
              </DarkTooltip>
            </Box>
          </Box>
          <Box sx={{ py: '28px' }}>
            <ActionDetails transaction={transaction} />
          </Box>
        </Box>
      </ListItem>
    </Box>
  );
}

export default TransactionMobileRowItem;
