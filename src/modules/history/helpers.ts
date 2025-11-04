import { formatUnits } from 'ethers/lib/utils';
import { generateCoWExplorerLink } from 'src/components/transactions/Swap/helpers/cow';
import { NetworkConfig } from 'src/ui-config/networksConfig';

import {
  hasAmountAndReserve,
  hasCollateralReserve,
  hasSrcOrDestToken,
  isCowSwapTransaction,
  isSDKTransaction,
  TransactionHistoryItemUnion,
  UserTransactionItem,
} from './types';
// Get action for sdk or cowswap transaction
export const getTransactionAction = (transaction: TransactionHistoryItemUnion): string => {
  if (isSDKTransaction(transaction)) {
    return transaction.__typename;
  }
  return transaction.action;
};

// Get txHash for sdk or cowswap transaction
export const getTransactionTxHash = (
  transaction: TransactionHistoryItemUnion
): string | undefined => {
  if (isSDKTransaction(transaction)) {
    return transaction.txHash;
  }
  // for cowswap, there is no txHash, return undefined
  return undefined;
};

// Get id for sdk or cowswap transaction
export const getTransactionId = (transaction: TransactionHistoryItemUnion): string => {
  if (isSDKTransaction(transaction)) {
    // For sdk transactions, use the txHash as id
    if (
      transaction.__typename === 'UserSupplyTransaction' ||
      transaction.__typename === 'UserWithdrawTransaction' ||
      transaction.__typename === 'UserBorrowTransaction' ||
      transaction.__typename === 'UserRepayTransaction'
    ) {
      return [
        transaction.txHash,
        transaction.__typename,
        transaction.reserve.underlyingToken.address.toLowerCase(),
      ].join('-');
    }

    if (transaction.__typename === 'UserUsageAsCollateralTransaction') {
      return [
        transaction.txHash,
        transaction.__typename,
        transaction.reserve.underlyingToken.address.toLowerCase(),
        transaction.enabled ? 'enabled' : 'disabled',
      ].join('-');
    }

    if (transaction.__typename === 'UserLiquidationCallTransaction') {
      return [
        transaction.txHash,
        transaction.__typename,
        transaction.collateral.reserve.underlyingToken.address.toLowerCase(),
        transaction.debtRepaid.reserve.underlyingToken.address.toLowerCase(),
      ].join('-');
    }

    const sdkTransaction = transaction as UserTransactionItem;
    return `${sdkTransaction.txHash!}-${sdkTransaction.__typename!}`;
  }

  // For cowswap transactions, use the id field
  return transaction.id;
};

// Get explorer link for sdk or cowswap transaction
export const getExplorerLink = (
  transaction: TransactionHistoryItemUnion,
  currentNetworkConfig: NetworkConfig
) => {
  const action = getTransactionAction(transaction);

  if (
    (action === 'CowSwap' || action === 'CowCollateralSwap') &&
    currentNetworkConfig.wagmiChain.id
  ) {
    const transactionId = getTransactionId(transaction);
    return generateCoWExplorerLink(currentNetworkConfig.wagmiChain.id, transactionId);
  }

  const txHash = getTransactionTxHash(transaction);
  if (!txHash) {
    return undefined;
  }

  return currentNetworkConfig.explorerLinkBuilder({ tx: txHash });
};

export const unixTimestampToFormattedTime = ({ unixTimestamp }: { unixTimestamp: number }) => {
  const date = new Date(unixTimestamp);
  const hours24 = date.getHours();
  const hours12 = ((hours24 + 24 - 1) % 12) + 1; // Convert to 12-hour format
  const minutes = date.getMinutes();
  const amOrPm = hours24 < 12 ? 'AM' : 'PM';

  const formattedHours = String(hours12).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
};

export const downloadData = (fileName: string, content: string, mimeType: string) => {
  const file = new Blob([content], { type: mimeType });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
};

export const groupByDate = (
  transactions: TransactionHistoryItemUnion[]
): Record<string, TransactionHistoryItemUnion[]> => {
  return transactions.reduce((grouped, transaction) => {
    const timestamp = Date.parse(transaction.timestamp);

    const date = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(timestamp));

    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transaction);
    return grouped;
  }, {} as Record<string, TransactionHistoryItemUnion[]>);
};
interface FormatTransactionDataParams {
  data: TransactionHistoryItemUnion[];
  csv: boolean;
}

// Format raw data for CSV/JSON download
export const formatTransactionData = ({
  data,
  csv,
}: FormatTransactionDataParams): TransactionHistoryItemUnion[] => {
  const formattedTransactions = data.map((transaction: TransactionHistoryItemUnion) => {
    // Structure of the newTransaction object following the actual CSV/JSON order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newTransaction: any = {
      action: '',
      fromState: undefined,
      id: '',
      reserve: undefined,
      timestamp: 0,
      toState: undefined,
      txHash: undefined,
      amount: undefined,
      assetPriceUSD: undefined,
      // For CowSwap
      underlyingSrcToken: undefined,
      srcAToken: undefined,
      underlyingDestToken: undefined,
      destAToken: undefined,
      srcAmount: undefined,
      destAmount: undefined,
      status: undefined,
      orderId: undefined,
      chainId: undefined,
    };

    if (isSDKTransaction(transaction)) {
      newTransaction.id = transaction.txHash;
      newTransaction.txHash = transaction.txHash;
      newTransaction.timestamp = Math.floor(Date.parse(transaction.timestamp) / 1000);

      if (hasAmountAndReserve(transaction)) {
        const { amount, reserve } = transaction;

        switch (transaction.__typename) {
          case 'UserSupplyTransaction':
            newTransaction.action = 'Supply';
            break;
          case 'UserWithdrawTransaction':
            newTransaction.action = 'Withdraw';
            break;
          case 'UserBorrowTransaction':
            newTransaction.action = 'Borrow';
            break;
          case 'UserRepayTransaction':
            newTransaction.action = 'Repay';
            break;
        }

        try {
          if (amount.amount.raw && reserve.underlyingToken.decimals) {
            newTransaction.amount = formatUnits(
              amount.amount.raw,
              reserve.underlyingToken.decimals
            );
          } else if (amount.amount.value) {
            newTransaction.amount = amount.amount.value;
          }
        } catch (error) {
          console.warn('Error formatting SDK amount:', error);
          newTransaction.amount = amount.amount.value || amount.amount.raw;
        }

        newTransaction.assetPriceUSD = reserve.usdExchangeRate;

        const reserveInfo = {
          name: reserve.underlyingToken.name,
          symbol: reserve.underlyingToken.symbol,
          decimals: reserve.underlyingToken.decimals,
          underlyingAsset: reserve.underlyingToken.address,
        };

        if (csv) {
          newTransaction.reserve = `"${JSON.stringify(reserveInfo).replace(/"/g, '""')}"`;
        } else {
          newTransaction.reserve = reserveInfo;
        }

        delete newTransaction.underlyingSrcToken;
        delete newTransaction.srcAToken;
        delete newTransaction.underlyingDestToken;
        delete newTransaction.destAToken;
        delete newTransaction.srcAmount;
        delete newTransaction.destAmount;
        delete newTransaction.status;
        delete newTransaction.orderId;
        delete newTransaction.chainId;
        delete newTransaction.fromState;
        delete newTransaction.toState;
      }

      // For UsageAsCollateral transactions
      else if (transaction.__typename === 'UserUsageAsCollateralTransaction') {
        const { enabled, reserve } = transaction;

        newTransaction.action = 'UsageAsCollateral';
        newTransaction.fromState = !enabled;
        newTransaction.toState = enabled;

        const reserveInfo = {
          name: reserve.underlyingToken.name,
          symbol: reserve.underlyingToken.symbol,
          underlyingAsset: reserve.underlyingToken.address,
        };

        if (csv) {
          newTransaction.reserve = `"${JSON.stringify(reserveInfo).replace(/"/g, '""')}"`;
        } else {
          newTransaction.reserve = reserveInfo;
        }

        delete newTransaction.amount;
        delete newTransaction.assetPriceUSD;
        delete newTransaction.underlyingSrcToken;
        delete newTransaction.srcAToken;
        delete newTransaction.underlyingDestToken;
        delete newTransaction.destAToken;
        delete newTransaction.srcAmount;
        delete newTransaction.destAmount;
        delete newTransaction.status;
        delete newTransaction.orderId;
        delete newTransaction.chainId;
      }

      // For LiquidationCall transactions
      else if (hasCollateralReserve(transaction)) {
        const { collateral, debtRepaid } = transaction;

        newTransaction.action = 'LiquidationCall';

        if (collateral.amount) {
          try {
            newTransaction.collateralAmount = formatUnits(
              collateral.amount.amount.raw || collateral.amount.amount.value,
              collateral.reserve.underlyingToken.decimals
            );
          } catch (error) {
            newTransaction.collateralAmount = collateral.amount.amount.value;
          }
          newTransaction.collateralAmountUSD = collateral.amount.usd;
        }

        if (debtRepaid.amount) {
          try {
            newTransaction.debtRepaidAmount = formatUnits(
              debtRepaid.amount.amount.raw || debtRepaid.amount.amount.value,
              debtRepaid.reserve.underlyingToken.decimals
            );
          } catch (error) {
            newTransaction.debtRepaidAmount = debtRepaid.amount.amount.value;
          }
          newTransaction.debtRepaidAmountUSD = debtRepaid.amount.usd;
        }

        const collateralReserveInfo = {
          name: collateral.reserve.underlyingToken.name,
          symbol: collateral.reserve.underlyingToken.symbol,
          underlyingAsset: collateral.reserve.underlyingToken.address,
        };
        const debtReserveInfo = {
          name: debtRepaid.reserve.underlyingToken.name,
          symbol: debtRepaid.reserve.underlyingToken.symbol,
          underlyingAsset: debtRepaid.reserve.underlyingToken.address,
        };

        if (csv) {
          newTransaction.collateralReserve = `"${JSON.stringify(collateralReserveInfo).replace(
            /"/g,
            '""'
          )}"`;
          newTransaction.debtReserve = `"${JSON.stringify(debtReserveInfo).replace(/"/g, '""')}"`;
        } else {
          newTransaction.collateralReserve = collateralReserveInfo;
          newTransaction.debtReserve = debtReserveInfo;
        }

        delete newTransaction.reserve;
        delete newTransaction.amount;
        delete newTransaction.assetPriceUSD;
        delete newTransaction.underlyingSrcToken;
        delete newTransaction.srcAToken;
        delete newTransaction.underlyingDestToken;
        delete newTransaction.destAToken;
        delete newTransaction.srcAmount;
        delete newTransaction.destAmount;
        delete newTransaction.status;
        delete newTransaction.orderId;
        delete newTransaction.chainId;
        delete newTransaction.fromState;
        delete newTransaction.toState;
      }
    }

    // For CowSwap transactions
    else if (isCowSwapTransaction(transaction) && hasSrcOrDestToken(transaction)) {
      const {
        underlyingSrcToken,
        underlyingDestToken,
        srcAmount,
        destAmount,
        status,
        chainId,
        orderId,
        action,
      } = transaction;

      newTransaction.action = action;
      newTransaction.id = transaction.id;
      newTransaction.timestamp = Math.floor(Date.parse(transaction.timestamp) / 1000);
      newTransaction.status = status;
      newTransaction.orderId = orderId;
      newTransaction.chainId = chainId;

      try {
        newTransaction.srcAmount = formatUnits(srcAmount, underlyingSrcToken.decimals);
        newTransaction.destAmount = formatUnits(destAmount, underlyingDestToken.decimals);
      } catch (error) {
        console.warn('Error formatting CowSwap amounts:', error);
        newTransaction.srcAmount = srcAmount;
        newTransaction.destAmount = destAmount;
      }

      const srcTokenInfo = {
        underlyingSrcAsset: underlyingSrcToken.underlyingAsset,
        name: underlyingSrcToken.name,
        symbol: underlyingSrcToken.symbol,
        decimals: underlyingSrcToken.decimals,
      };
      const destTokenInfo = {
        underlyingDestAsset: underlyingDestToken.underlyingAsset,
        name: underlyingDestToken.name,
        symbol: underlyingDestToken.symbol,
        decimals: underlyingDestToken.decimals,
      };

      if (csv) {
        newTransaction.underlyingSrcToken = `"${JSON.stringify(srcTokenInfo).replace(/"/g, '""')}"`;
        newTransaction.underlyingDestToken = `"${JSON.stringify(destTokenInfo).replace(
          /"/g,
          '""'
        )}"`;
      } else {
        newTransaction.underlyingSrcToken = srcTokenInfo;
        newTransaction.underlyingDestToken = destTokenInfo;
      }

      newTransaction.srcAToken = !!transaction.srcAToken;
      newTransaction.destAToken = !!transaction.destAToken;

      delete newTransaction.reserve;
      delete newTransaction.amount;
      delete newTransaction.assetPriceUSD;
      delete newTransaction.fromState;
      delete newTransaction.toState;
      delete newTransaction.txHash;
    }

    return newTransaction;
  });
  return formattedTransactions.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
};
