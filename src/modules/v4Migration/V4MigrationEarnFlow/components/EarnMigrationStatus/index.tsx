import { Box, Button } from '@mui/material';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { getAaveProPositionUrl } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TransactionCard, TransactionCardRow, TxStatus } from 'src/components/TransactionCard';
import { endIconSizeSx } from 'src/utils/buttonStyles';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { formatUnits } from 'viem';

import { MigrationReceipt } from '../../../hooks/useMigration';
import {
  hubTitle,
  MIGRATION_TX_BUTTONS,
  MIGRATION_TX_ROWS,
  migrationTxTitle,
} from '../../../utils/copy';
import { getHubDisplayName } from '../../../V4MigrationPage/utils/positions';

const BUTTON_ROW_SX = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } as const;

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'long',
  timeStyle: 'short',
});

const TOKENS_SX = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem' } as const;

interface EarnMigrationStatusProps {
  status: TxStatus;
  chainId: number;
  user: string;
  /** The V4 spoke the position was moved to. */
  spokeAddress: string;
  txHash?: string;
  /** Set once the migration is mined. */
  receipt?: MigrationReceipt;
  symbol: string;
  iconSymbol: string;
  /** In whole tokens. */
  amount: string;
  amountUSD: number;
  hubName: string;
  apy: number;
  onRetry: () => void;
}

/** Last step of the earn flow: the migration while it runs, and how it ended. */
export const EarnMigrationStatus = ({
  status,
  chainId,
  user,
  spokeAddress,
  txHash,
  receipt,
  symbol,
  iconSymbol,
  amount,
  amountUSD,
  hubName,
  apy,
  onRetry,
}: EarnMigrationStatusProps) => {
  const done = status === 'success';
  const network = getNetworkConfig(chainId);

  const rows: TransactionCardRow[] = [
    {
      id: 'amount',
      ...(done ? MIGRATION_TX_ROWS.migrated : MIGRATION_TX_ROWS.migrating),
      value: (
        <Box component="span" sx={TOKENS_SX}>
          <TokenIcon symbol={iconSymbol} sx={{ fontSize: '1.25rem' }} />
          <FormattedNumber value={amount} symbol={symbol} variant="inherit" />
        </Box>
      ),
    },
    {
      id: 'value',
      ...MIGRATION_TX_ROWS.value,
      value: <FormattedNumber value={amountUSD} symbol="USD" variant="inherit" />,
    },
    ...(done
      ? []
      : [{ id: 'hub', ...MIGRATION_TX_ROWS.hub, value: hubTitle(getHubDisplayName(hubName)) }]),
    {
      id: 'apy',
      ...MIGRATION_TX_ROWS.earnApy,
      value: <FormattedNumber value={apy} percent variant="inherit" />,
    },
  ];

  const metadata: TransactionCardRow[] | undefined =
    done && receipt
      ? [
          ...(receipt.timestamp === undefined
            ? []
            : [
                {
                  id: 'date',
                  ...MIGRATION_TX_ROWS.date,
                  value: DATE_FORMAT.format(new Date(receipt.timestamp * 1000)),
                },
              ]),
          {
            id: 'fee',
            ...MIGRATION_TX_ROWS.networkFee,
            // The user sends the transaction, so this is what they paid, not a sponsored fee.
            value: (
              <FormattedNumber
                value={formatUnits(receipt.feeWei, network.baseAssetDecimals)}
                symbol={network.baseAssetSymbol}
                visibleDecimals={6}
                variant="inherit"
              />
            ),
          },
          { id: 'block', ...MIGRATION_TX_ROWS.block, value: receipt.blockNumber.toString() },
        ]
      : undefined;

  const close = (
    <Button component={Link} href={ROUTES.migrationToolV4} variant="outlined" size="large">
      {MIGRATION_TX_BUTTONS.close}
    </Button>
  );

  let footer: React.ReactNode;
  if (done) {
    footer = (
      <Box sx={BUTTON_ROW_SX}>
        {close}
        <Button
          component={Link}
          href={getAaveProPositionUrl(chainId, spokeAddress, user)}
          variant="outlined"
          size="large"
          endIcon={<ArrowUpRightIcon sx={{ color: 'fg-chevron' }} />}
          sx={endIconSizeSx('1.125rem')}
        >
          {MIGRATION_TX_BUTTONS.viewPosition}
        </Button>
      </Box>
    );
  } else if (status !== 'pending') {
    footer = (
      <Box sx={BUTTON_ROW_SX}>
        {close}
        <Button variant="outlined" size="large" onClick={onRetry}>
          {MIGRATION_TX_BUTTONS.tryAgain}
        </Button>
      </Box>
    );
  }

  return (
    <TransactionCard
      status={status}
      icon={<TokenIcon symbol={iconSymbol} sx={{ fontSize: '3.5rem' }} />}
      title={migrationTxTitle(status, symbol)}
      rows={rows}
      metadata={metadata}
      explorerHref={txHash ? network.explorerLinkBuilder({ tx: txHash }) : undefined}
      footer={footer}
    />
  );
};
