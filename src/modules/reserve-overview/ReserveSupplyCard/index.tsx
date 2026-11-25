import { ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, AlertTitle, Box, Divider } from '@mui/material';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { DebtCeilingStatus } from 'src/components/caps/DebtCeilingStatus';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCapsSDK } from 'src/hooks/useAssetCapsSDK';
import { useRootStore } from 'src/store/root';
import { figVars } from 'src/utils/figmaColors';

import { SupplyApyGraph } from '../graphs/ApyGraphContainer';
import { ReserveCard } from '../ReserveCard';
import { ReserveConfigSection } from '../ReserveConfigSection';
import { useCollateralConfigRows } from '../ReserveConfigSection/hooks/useCollateralConfigRows';
import { ReserveStat } from '../ReserveStat';
import { CapTooltipLabel } from '../ReserveStat/components/CapTooltipLabel';
import { ReserveStatAmount } from '../ReserveStat/components/ReserveStatAmount';
import { ReserveStatsRow } from '../ReserveStatsRow';
import { ReserveStatusAlerts } from './components/ReserveStatusAlerts';

interface ReserveSupplyCardProps {
  reserve: ReserveWithId;
  showChart: boolean;
}

export const ReserveSupplyCard = ({ reserve, showChart }: ReserveSupplyCardProps) => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { supplyCap, debtCeiling } = useAssetCapsSDK();
  const collateralRows = useCollateralConfigRows(reserve);

  const symbol = reserve.underlyingToken.symbol;
  const hasSupplyCap = reserve.supplyInfo.supplyCap.amount.value !== '0';
  const supplyProtocolIncentives = mapAaveProtocolIncentives(reserve.incentives, 'supply');
  const apyValue = Number(reserve.supplyInfo?.apy.value);
  const canBeCollateral = collateralRows.some((row) => row.maxLTV > 0);

  return (
    <ReserveCard title={<Trans>Supply</Trans>}>
      <ReserveStatusAlerts reserve={reserve} />

      <Box sx={{ mt: '1.375rem' }}>
        <ReserveStatsRow>
          <ReserveStat
            label={
              hasSupplyCap ? (
                <CapTooltipLabel
                  label={<Trans>Total Deposits</Trans>}
                  tooltip="Total Supply"
                  reserve={reserve}
                >
                  <Trans>
                    Asset supply is limited to a certain amount to reduce protocol exposure to the
                    asset and to help manage risks involved.
                  </Trans>
                </CapTooltipLabel>
              ) : (
                <Trans>Total Deposits</Trans>
              )
            }
            ring={
              hasSupplyCap ? (
                <CapsCircularStatus
                  compact
                  value={supplyCap.percentUsed}
                  color={figVars['data-purple']}
                  tooltipContent={
                    <Trans>
                      Maximum amount available to supply is{' '}
                      <FormattedNumber
                        value={
                          valueToBigNumber(reserve.supplyInfo.supplyCap.amount.value).toNumber() -
                          valueToBigNumber(reserve.supplyInfo.total.value).toNumber()
                        }
                        variant="subheader2"
                      />{' '}
                      {reserve.underlyingToken.symbol} (
                      <FormattedNumber
                        value={
                          valueToBigNumber(reserve.supplyInfo.supplyCap.usd).toNumber() -
                          valueToBigNumber(reserve.size.usd).toNumber()
                        }
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
              usd={reserve.size.usd}
              amount={reserve.supplyInfo.total.value}
              symbol={symbol}
              cap={hasSupplyCap ? reserve.supplyInfo.supplyCap : undefined}
            />
          </ReserveStat>

          <ReserveStat label={<Trans>APY</Trans>}>
            <IncentivesCard
              value={Number.isFinite(apyValue) ? apyValue : '-1'}
              incentives={supplyProtocolIncentives}
              address={reserve.aToken.address}
              symbol={symbol}
              variant="h2"
              market={currentMarketData.market}
              protocolAction={ProtocolAction.supply}
              inlineIncentives
            />
          </ReserveStat>
        </ReserveStatsRow>
      </Box>

      {showChart && (
        <SupplyApyGraph
          chain={currentMarketData.chainId}
          underlyingToken={reserve.underlyingToken.address}
          market={currentMarketData.addresses.LENDING_POOL}
        />
      )}

      <Divider sx={{ mt: '2.5rem' }} />

      <Box sx={{ mt: '2.375rem' }}>
        <ReserveConfigSection
          enabled={canBeCollateral}
          title={
            canBeCollateral ? (
              <Trans>{symbol} can be supplied as collateral</Trans>
            ) : (
              <Trans>{symbol} cannot be supplied as collateral</Trans>
            )
          }
          description={
            canBeCollateral ? (
              <Trans>
                {symbol} can be used as collateral to borrow supported assets. Borrowing power and
                risk parameters vary by market and E-Mode configuration.
              </Trans>
            ) : (
              <Trans>
                {symbol} can be supplied to earn yield but is not eligible as collateral in any
                available market or E-Mode configuration.
              </Trans>
            )
          }
          rows={collateralRows}
          assetsTitle={<Trans>Borrowable Assets</Trans>}
          assetsFilterLabel={<Trans>Borrowable</Trans>}
          columnWeights={{ label: 148, value: 137 }}
          sortSource="reserve_overview_collateral"
          sortStorageKey="reserveOverviewCollateralTableSort"
        >
          {reserve.isolationModeConfig?.canBeCollateral && (
            <Box sx={{ mt: '1.5rem' }}>
              <Alert severity="warning" sx={{ mb: '1rem' }}>
                <AlertTitle>
                  <Trans>Asset can only be used as collateral in isolation mode only.</Trans>
                </AlertTitle>
                In Isolation mode you cannot supply other assets as collateral for borrowing. Assets
                used as collateral in Isolation mode can only be borrowed to a specific debt
                ceiling.{' '}
                <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode">
                  Learn more
                </Link>
              </Alert>
              <ReserveOverviewBox fullWidth>
                <DebtCeilingStatus
                  debt={reserve.isolationModeConfig.totalBorrows.usd}
                  ceiling={reserve.isolationModeConfig.debtCeiling.usd}
                  usageData={debtCeiling}
                />
              </ReserveOverviewBox>
            </Box>
          )}
        </ReserveConfigSection>
      </Box>

      {symbol === 'stETH' && (
        <Alert severity="info" sx={{ mt: '1.5rem' }}>
          <AlertTitle>
            <Trans>Staking Rewards</Trans>
          </AlertTitle>
          <Trans>
            stETH supplied as collateral will continue to accrue staking rewards provided by daily
            rebases.
          </Trans>{' '}
          <Link
            href="https://blog.lido.fi/aave-integrates-lidos-steth-as-collateral/"
            underline="always"
          >
            <Trans>Learn more</Trans>
          </Link>
        </Alert>
      )}
    </ReserveCard>
  );
};
