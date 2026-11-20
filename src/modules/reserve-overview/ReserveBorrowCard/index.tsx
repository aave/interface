import { ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Divider } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { ReactNode } from 'react';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { GhoRateTooltip } from 'src/components/infoTooltips/GhoRateTooltip';
import { tooltipLabelProps } from 'src/components/infoTooltips/tooltipLabelProps';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCapsSDK } from 'src/hooks/useAssetCapsSDK';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { figVars } from 'src/utils/figmaColors';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

import { BorrowApyGraph } from '../graphs/ApyGraphContainer';
import { ReserveCard } from '../ReserveCard';
import { ReserveConfigSection } from '../ReserveConfigSection';
import { ConfigSort } from '../ReserveConfigSection/components/ConfigTable';
import { useBorrowableConfigRows } from '../ReserveConfigSection/hooks/useBorrowableConfigRows';
import { ReserveStat } from '../ReserveStat';
import { CapTooltipLabel } from '../ReserveStat/components/CapTooltipLabel';
import { ReserveStatAmount } from '../ReserveStat/components/ReserveStatAmount';
import { ReserveStatsRow } from '../ReserveStatsRow';

const BORROWABLE_DEFAULT_SORT: ConfigSort = { key: 'supplied', desc: true };

interface ReserveBorrowCardProps {
  reserve: ReserveWithId;
  showStats: boolean;
  showChart: boolean;
}

export const ReserveBorrowCard = ({ reserve, showStats, showChart }: ReserveBorrowCardProps) => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { borrowCap } = useAssetCapsSDK();
  const borrowableRows = useBorrowableConfigRows(reserve);

  const symbol = reserve.underlyingToken.symbol;
  const isGho = displayGhoForMintableMarket({ symbol, currentMarket: currentMarketData.market });
  const borrowInfo = reserve.borrowInfo;
  const canBeBorrowed = borrowableRows.length > 0;

  const capTooltip = (label: ReactNode, tooltip: string) => (
    <CapTooltipLabel label={label} tooltip={tooltip} reserve={reserve}>
      <Trans>
        Borrowing of this asset is limited to a certain amount to minimize liquidity pool
        insolvency.
      </Trans>
    </CapTooltipLabel>
  );

  const renderStats = () => {
    if (!borrowInfo) return null;

    const hasBorrowCap = borrowInfo.borrowCap.amount.value !== '0';
    const apyValue = Number(borrowInfo.apy.value);
    const maxAvailableToBorrow = BigNumber.max(
      valueToBigNumber(borrowInfo.borrowCap.amount.value).minus(
        valueToBigNumber(borrowInfo.total.amount.value)
      ),
      0
    ).toNumber();
    const maxAvailableToBorrowUSD = BigNumber.max(
      valueToBigNumber(borrowInfo.borrowCap.usd).minus(valueToBigNumber(borrowInfo.total.usd)),
      0
    ).toNumber();

    return (
      <>
        <Box sx={{ mt: '1.375rem' }}>
          <ReserveStatsRow>
            <ReserveStat
              label={
                hasBorrowCap ? (
                  capTooltip(<Trans>Total Borrowed</Trans>, 'Total borrowed')
                ) : (
                  <Trans>Total Borrowed</Trans>
                )
              }
              ring={
                hasBorrowCap ? (
                  <CapsCircularStatus
                    compact
                    value={borrowCap.percentUsed}
                    color={figVars['data-orange']}
                    tooltipContent={
                      <Trans>
                        Maximum amount available to borrow is{' '}
                        <FormattedNumber value={maxAvailableToBorrow} variant="subheader2" />{' '}
                        {reserve.underlyingToken.symbol} (
                        <FormattedNumber
                          value={maxAvailableToBorrowUSD}
                          variant="subheader2"
                          symbol="USD"
                        />
                        ).
                      </Trans>
                    }
                  />
                ) : undefined
              }
            >
              <ReserveStatAmount
                usd={borrowInfo.total.usd}
                amount={borrowInfo.total.amount.value}
                symbol={symbol}
                cap={hasBorrowCap ? borrowInfo.borrowCap : undefined}
              />
            </ReserveStat>

            {hasBorrowCap && (
              <ReserveStat label={capTooltip(<Trans>Borrow Cap</Trans>, 'Borrow cap')}>
                <ReserveStatAmount
                  usd={borrowInfo.borrowCap.usd}
                  amount={borrowInfo.borrowCap.amount.value}
                  symbol={symbol}
                />
              </ReserveStat>
            )}

            <ReserveStat
              label={
                isGho ? (
                  <GhoRateTooltip {...tooltipLabelProps} text={<Trans>APY</Trans>} />
                ) : (
                  <VariableAPYTooltip
                    {...tooltipLabelProps}
                    text={<Trans>APY</Trans>}
                    event={{
                      eventName: GENERAL.TOOL_TIP,
                      eventParams: {
                        tooltip: 'APY, variable',
                        asset: reserve.underlyingToken.address,
                        assetName: reserve.underlyingToken.name,
                      },
                    }}
                  />
                )
              }
            >
              <IncentivesCard
                value={Number.isFinite(apyValue) ? apyValue : '-1'}
                incentives={mapAaveProtocolIncentives(reserve.incentives, 'borrow')}
                address={reserve.vToken.address}
                symbol={symbol}
                variant="h2"
                market={currentMarketData.market}
                protocolAction={ProtocolAction.borrow}
                inlineIncentives
              />
            </ReserveStat>
          </ReserveStatsRow>
        </Box>

        {showChart && (
          <BorrowApyGraph
            chain={currentMarketData.chainId}
            underlyingToken={reserve.underlyingToken.address}
            market={currentMarketData.addresses.LENDING_POOL}
          />
        )}

        <Divider sx={{ mt: '2.5rem' }} />
      </>
    );
  };

  const stats = showStats ? renderStats() : null;

  return (
    <ReserveCard title={<Trans>Borrow</Trans>}>
      {stats}

      <Box sx={{ mt: stats ? '2.375rem' : '1.375rem' }}>
        <ReserveConfigSection
          enabled={canBeBorrowed}
          title={
            canBeBorrowed ? (
              <Trans>{symbol} can be borrowed against supplied collateral</Trans>
            ) : (
              <Trans>{symbol} cannot be borrowed against any collateral</Trans>
            )
          }
          description={
            canBeBorrowed ? (
              <Trans>
                {symbol} can be borrowed against supported collateral assets. Available collateral
                and risk parameters vary by market and E-Mode configuration.
              </Trans>
            ) : (
              <Trans>
                {symbol} is not available to borrow in any market or E-Mode configuration.
              </Trans>
            )
          }
          rows={borrowableRows}
          assetsTitle={<Trans>Collateral</Trans>}
          assetsFilterLabel={<Trans>Collateral</Trans>}
          columnWeights={{ label: 208, value: 94 }}
          sortSource="reserve_overview_borrowable"
          sortStorageKey="reserveOverviewBorrowableTableSort"
          showSupplied
          defaultSort={BORROWABLE_DEFAULT_SORT}
        />
      </Box>
    </ReserveCard>
  );
};
