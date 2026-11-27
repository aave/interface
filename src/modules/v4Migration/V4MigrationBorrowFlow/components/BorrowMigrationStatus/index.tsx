import { MigrationPreview } from '@aave/react';
import { Box, Button } from '@mui/material';
import { AssetGroup } from 'src/components/AssetGroup';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { getAaveProPositionUrl } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TransactionCard, TransactionCardRow, TxStatus } from 'src/components/TransactionCard';
import { endIconSizeSx } from 'src/utils/buttonStyles';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { formatUnits } from 'viem';

import { MigrationReceipt } from '../../../hooks/useMigration';
import { MIGRATION_TX_BUTTONS, MIGRATION_TX_ROWS, migrationTxTitle } from '../../../utils/copy';
import { pct, tokens, usd } from '../../../utils/previewCells';
import { getAssetIconSymbol } from '../../../V4MigrationPage/utils/positions';
import { PositionName } from '../../../V4MigrationPreview/components/PositionName';

type Holding = Pick<MigrationPreview['moving']['supplies'][number], 'currency' | 'amount'>;

const BUTTON_ROW_SX = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } as const;

const AMOUNTS_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: '0.25rem 0.75rem',
} as const;

// More assets than this no longer fit on the row with their amounts, so only the icons show.
const MAX_AMOUNTS = 2;

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'long',
  timeStyle: 'short',
});

const iconSymbols = (holdings: Holding[]) =>
  holdings.map((holding) => getAssetIconSymbol(holding.currency));

const amounts = (holdings: Holding[]) =>
  holdings.length > MAX_AMOUNTS ? (
    <AssetGroup symbols={iconSymbols(holdings)} size={20} />
  ) : (
    <Box component="span" sx={AMOUNTS_SX}>
      {holdings.map((holding) => (
        <span key={holding.currency.address}>
          {tokens(
            holding.currency.symbol,
            holding.amount.amount.value,
            getAssetIconSymbol(holding.currency)
          )}
        </span>
      ))}
    </Box>
  );

interface BorrowMigrationStatusProps {
  status: TxStatus;
  chainId: number;
  user: string;
  /** The V4 spoke the position was moved to. */
  spokeAddress: string;
  txHash?: string;
  /** Set once the migration is mined. */
  receipt?: MigrationReceipt;
  /** The preview the user confirmed: what moves, and the position it lands in. */
  preview: MigrationPreview;
  marketName: string;
  onRetry: () => void;
}

/** Last step of the borrow flow: the migration while it runs, and how it ended. */
export const BorrowMigrationStatus = ({
  status,
  chainId,
  user,
  spokeAddress,
  txHash,
  receipt,
  preview,
  marketName,
  onRetry,
}: BorrowMigrationStatusProps) => {
  const done = status === 'success';
  const network = getNetworkConfig(chainId);
  const { moving, target } = preview;
  const apy = target.apy?.after?.value;

  const rows: TransactionCardRow[] = [
    {
      id: 'collateralValue',
      ...MIGRATION_TX_ROWS.collateralValue,
      value: usd(Number(moving.suppliedUsd)),
    },
    { id: 'collateral', ...MIGRATION_TX_ROWS.collateral, value: amounts(moving.supplies) },
    {
      id: 'borrowedValue',
      ...MIGRATION_TX_ROWS.borrowedValue,
      value: usd(Number(moving.borrowedUsd)),
    },
    { id: 'borrow', ...MIGRATION_TX_ROWS.borrow, value: amounts(moving.debts) },
    {
      id: 'market',
      ...MIGRATION_TX_ROWS.market,
      value: <PositionName hubName={target.hubs[0]?.name ?? ''} marketName={marketName} />,
    },
    ...(apy === undefined || apy === null
      ? []
      : [{ id: 'apy', ...MIGRATION_TX_ROWS.positionApy, value: pct(Number(apy)) }]),
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

  let footer: React.ReactNode = close;
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
      icon={
        <AssetGroup
          symbols={[...iconSymbols(moving.supplies), ...iconSymbols(moving.debts)]}
          max={3}
          size={56}
          overlap={23}
          cutoutGap={4}
          animated={false}
        />
      }
      title={migrationTxTitle(status)}
      rows={rows}
      metadata={metadata}
      explorerHref={txHash ? network.explorerLinkBuilder({ tx: txHash }) : undefined}
      footer={footer}
    />
  );
};
