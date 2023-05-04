import {
  ArrowDownIcon,
  ArrowNarrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  DotsHorizontalIcon,
  DuplicateIcon,
  ExternalLinkIcon,
} from '@heroicons/react/outline';
import { ExclamationIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import PercentIcon from '@mui/icons-material/Percent';
import { Box, SvgIcon, Tooltip, Typography, useTheme } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { CompactableTypography, CompactMode } from 'src/components/CompactableTypography';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ActionFields, TransactionHistoryItem } from 'src/hooks/useTransactionHistory';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import ArrowDownTrayIcon from '/public/arrowDownTray.svg';
import ArrowUpTrayIcon from '/public/arrowUpTray.svg';

import { BorrowRateModeBlock } from './BorrowRateModeBlock';

const iconBoxStyling = {
  width: '24px',
  height: '24px',
  background: '#F7F7F9',
  borderRadius: '100px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '5px',
  gap: '10px',
  mr: 6,
};

const ActionTextMap = ({ action }: { action: string }) => {
  switch (action) {
    case 'Supply':
      return <Trans>Supply</Trans>;
    case 'Deposit':
      return <Trans>Deposit</Trans>;
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

const ActionIconMap = ({ action }: { action: string }) => {
  switch (action) {
    case 'Supply':
    case 'Deposit':
      return <ArrowUpTrayIcon />;
    case 'Borrow':
      return <ArrowDownTrayIcon />;
    case 'RedeemUnderlying':
      return <ArrowDownIcon />;
    case 'Repay':
      return <ArrowUpIcon />;
    case 'UsageAsCollateral':
      return <DotsHorizontalIcon />;
    case 'SwapBorrowRate':
    case 'Swap':
      return <PercentIcon />;
    case 'LiquidationCall':
      return <ExclamationIcon />;
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
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedSupplyReserve.iconSymbol} sx={{ fontSize: '20px' }} />

          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedSupplyReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mr: 1 }}
          >
            +
          </Typography>
          <FormattedNumber
            value={formatUnits(supplyTx.amount, supplyTx.reserve.decimals)}
            variant="secondary14"
            color="text.primary"
            sx={{ mr: 1 }}
          />
          <Tooltip
            title={`${formattedSupplyReserve.name} (${formattedSupplyReserve.symbol})`}
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {formattedSupplyReserve.symbol}
            </Typography>
          </Tooltip>
        </Box>
      );
    case 'Borrow':
      const borrowTx = transaction as TransactionHistoryItem<ActionFields['Borrow']>;
      const formattedBorrowReserve = fetchIconSymbolAndName(borrowTx.reserve);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedBorrowReserve.iconSymbol} sx={{ fontSize: '20px' }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedBorrowReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mr: 1 }}
          >
            +
          </Typography>
          <FormattedNumber
            value={formatUnits(borrowTx.amount, borrowTx.reserve.decimals)}
            variant="secondary14"
            color="text.primary"
            sx={{ mr: 1 }}
          />
          <Tooltip
            title={`${formattedBorrowReserve.name} (${formattedBorrowReserve.symbol})`}
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {formattedBorrowReserve.symbol}
            </Typography>
          </Tooltip>
        </Box>
      );
    case 'RedeemUnderlying':
      const withdrawTx = transaction as TransactionHistoryItem<ActionFields['RedeemUnderlying']>;
      const formattedWithdrawReserve = fetchIconSymbolAndName(withdrawTx.reserve);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedWithdrawReserve.iconSymbol} sx={{ fontSize: '20px' }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedWithdrawReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mr: 1 }}
          >
            +
          </Typography>
          <FormattedNumber
            value={formatUnits(withdrawTx.amount, withdrawTx.reserve.decimals)}
            variant="secondary14"
            color="text.primary"
            sx={{ mr: 1 }}
          />
          <Tooltip
            title={`${formattedWithdrawReserve.name} (${formattedWithdrawReserve.symbol})`}
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {formattedWithdrawReserve.symbol}
            </Typography>
          </Tooltip>
        </Box>
      );
    case 'Repay':
      const repayTx = transaction as TransactionHistoryItem<ActionFields['Repay']>;
      const formattedRepayReserve = fetchIconSymbolAndName(repayTx.reserve);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon symbol={formattedRepayReserve.iconSymbol} sx={{ fontSize: '20px' }} />
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedRepayReserve.iconSymbol.split('_').length > 1 ? 3 : 1, mr: 1 }}
          >
            &minus;
          </Typography>
          <FormattedNumber
            value={formatUnits(repayTx.amount, repayTx.reserve.decimals)}
            variant="secondary14"
            color="text.primary"
            sx={{ mr: 1 }}
          />
          <Tooltip
            title={`${formattedRepayReserve.name} (${formattedRepayReserve.symbol})`}
            arrow
            placement="top"
          >
            <Typography variant="secondary14" color="text.primary">
              {formattedRepayReserve.symbol}
            </Typography>
          </Tooltip>
        </Box>
      );
    case 'UsageAsCollateral':
      const collateralUsageTx = transaction as TransactionHistoryItem<
        ActionFields['UsageAsCollateral']
      >;
      const formattedCollateralReserve = fetchIconSymbolAndName(collateralUsageTx.reserve);
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Typography variant="secondary14" color="text.primary">
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
          <Typography variant="secondary14" color="text.primary" sx={{ mr: 0.5 }}>
            <Trans>for</Trans>
          </Typography>
          <TokenIcon
            symbol={formattedCollateralReserve.iconSymbol}
            sx={{
              fontSize: '20px',
            }}
          />
          <Tooltip
            title={`${formattedCollateralReserve.name} (${formattedCollateralReserve.symbol})`}
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
          </Tooltip>
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
          <TokenIcon symbol={formattedSwapReserve.iconSymbol} sx={{ fontSize: '20px' }} />
          <Tooltip
            title={`${formattedSwapReserve.name} (${formattedSwapReserve.symbol})`}
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
          </Tooltip>
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
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }} pr={4.5}>
            <Typography>
              <Trans>Liquidated collateral</Trans>
            </Typography>
            <Box sx={{ display: 'inline-flex' }}>
              <TokenIcon
                symbol={formattedLiquidationColatReserve.iconSymbol}
                sx={{ fontSize: '20px', pr: 0.5 }}
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
                  sx={{ display: 'inline-flex', mr: 1 }}
                >
                  -
                </Typography>
                <FormattedNumber
                  value={formatUnits(
                    liquidationTx.collateralAmount,
                    liquidationTx.collateralReserve.decimals
                  )}
                  variant="secondary14"
                  color="text.primary"
                  sx={{ mr: 1 }}
                />
                <Tooltip
                  title={`${formattedLiquidationColatReserve.name} (${formattedLiquidationColatReserve.symbol})`}
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
                </Tooltip>
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
                sx={{ fontSize: '20px', pr: 0.5 }}
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
                  sx={{ display: 'inline-flex', mr: 1 }}
                >
                  +
                </Typography>
                <FormattedNumber
                  value={formatUnits(
                    liquidationTx.principalAmount,
                    liquidationTx.principalReserve.decimals
                  )}
                  variant="secondary14"
                  color="text.primary"
                  sx={{ mr: 1 }}
                />
                <Tooltip
                  title={`${formattedLiquidationBorrowReserve.name} (${formattedLiquidationBorrowReserve.symbol})`}
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
                </Tooltip>
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
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Box sx={iconBoxStyling}>
        <SvgIcon sx={{ fontSize: '14px', color: '#383D51' }}>
          <ActionIconMap action={action} />
        </SvgIcon>
      </Box>
      <Typography sx={{ width: '180px' }}>
        <ActionTextMap action={action} />
      </Typography>
    </Box>
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
  downToXSM: boolean;
}

function TransactionRowItem({ transaction, downToXSM }: TransactionHistoryItemProps) {
  const [copyStatus, setCopyStatus] = useState(false);
  const [currentNetworkConfig] = useRootStore((state) => [state.currentNetworkConfig]);
  const theme = useTheme();

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
    <Box px={6}>
      <ListItem
        px={downToXSM ? 4 : 3}
        sx={{
          borderWidth: `1px 0 0 0`,
          borderStyle: `solid`,
          borderColor: `${theme.palette.divider}`,
          height: '72px',
        }}
      >
        <Box>
          <ActionTitle action={transaction.action} />
        </Box>

        <Box sx={{ width: '64px', mx: 6 }}>
          <Typography variant="caption" color="text.muted">
            {unixTimestampToFormattedTime({ unixTimestamp: transaction.timestamp })}
          </Typography>
        </Box>

        <Box>
          <ActionDetails transaction={transaction} />
        </Box>
        <ListColumn align="right">
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
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
            <Box onClick={() => handleCopy(explorerLink)}>
              <SvgIcon
                sx={{
                  m: 1,
                  fontSize: '14px',
                  color: copyStatus ? 'green' : '#62677B',
                  cursor: 'pointer',
                }}
              >
                {copyStatus ? <CheckIcon /> : <DuplicateIcon />}
              </SvgIcon>
            </Box>
            <Link href={explorerLink}>
              <SvgIcon sx={{ fontSize: '14px', color: '#62677B' }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Link>
          </Box>
        </ListColumn>
      </ListItem>
    </Box>
  );
}

export default TransactionRowItem;
