import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  DotsHorizontalIcon,
  DuplicateIcon,
  ExclamationIcon,
  ExternalLinkIcon,
} from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography, useTheme } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { CompactableTypography, CompactMode } from 'src/components/CompactableTypography';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ActionFields, TransactionHistoryItem } from 'src/hooks/useTransactionHistory';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import ArrowDownTrayIcon from '/public/arrowDownTray.svg';
import ArrowUpTrayIcon from '/public/arrowUpTray.svg';

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
      return <DotsHorizontalIcon />;
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
            sx={{ ml: formattedSupplyReserve.iconSymbol.split('_').length > 1 ? 3 : 1 }}
          >
            + {Number(formatUnits(supplyTx.amount, supplyTx.reserve.decimals)).toPrecision(6)}{' '}
            {formattedSupplyReserve.name}
          </Typography>
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
            sx={{ ml: formattedBorrowReserve.iconSymbol.split('_').length > 1 ? 3 : 1 }}
          >
            + {Number(formatUnits(borrowTx.amount, borrowTx.reserve.decimals)).toPrecision(6)}{' '}
            {formattedBorrowReserve.name}
          </Typography>
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
            sx={{ ml: formattedWithdrawReserve.iconSymbol.split('_').length > 1 ? 3 : 1 }}
          >
            &minus;{' '}
            {Number(formatUnits(withdrawTx.amount, withdrawTx.reserve.decimals)).toPrecision(6)}{' '}
            {formattedWithdrawReserve.name}
          </Typography>
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
            sx={{ ml: formattedRepayReserve.iconSymbol.split('_').length > 1 ? 3 : 1 }}
          >
            &minus; {Number(formatUnits(repayTx.amount, repayTx.reserve.decimals)).toPrecision(6)}{' '}
            {formattedRepayReserve.name}
          </Typography>
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
          <Typography
            variant="secondary14"
            color="text.primary"
            sx={{ ml: formattedCollateralReserve.iconSymbol.split('_').length > 1 ? 3 : 1 }}
          >
            {formattedCollateralReserve.name}
          </Typography>
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
          <Typography>
            Variable 2% - Stable 4%
            <TokenIcon symbol={formattedSwapReserve.iconSymbol} sx={{ fontSize: '20px' }} />
            <Typography
              variant="secondary14"
              color="text.primary"
              sx={{ ml: formattedSwapReserve.iconSymbol.split('_').length > 1 ? 3 : 1 }}
            >
              {swapBorrowRateTx.reserve.symbol}
            </Typography>
          </Typography>
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
          <Typography>
            Liquidation colat {formattedLiquidationColatReserve.iconSymbol} debt{' '}
            {formattedLiquidationBorrowReserve.iconSymbol}
          </Typography>
        </Box>
      );
    default:
      return <></>;
  }
};

function ActionTitle({ action }: { action: string }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', pl: 3 }}>
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
    <ListItem
      px={downToXSM ? 4 : 6}
      sx={{
        borderWidth: `1px 0 0 0`,
        borderStyle: `solid`,
        borderColor: `${theme.palette.divider}`,
        height: '72px',
      }}
    >
      <Box>
        {' '}
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
        <Box sx={{ display: 'inline-flex', alignItems: 'center', pr: 3 }}>
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
  );
}

export default TransactionRowItem;
