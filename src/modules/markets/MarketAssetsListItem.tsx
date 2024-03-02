import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { OffboardingTooltip } from 'src/components/infoTooltips/OffboardingToolTip';
import { RenFILToolTip } from 'src/components/infoTooltips/RenFILToolTip';
import { IsolatedEnabledBadge } from 'src/components/isolationMode/IsolatedBadge';
import { NoData } from 'src/components/primitives/NoData';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { AssetsBeingOffboarded } from 'src/components/Warnings/OffboardingWarning';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { GENERAL, MARKETS } from 'src/utils/mixPanelEvents';

import { IncentivesCard } from '../../components/incentives/IncentivesCard';
import { AMPLToolTip } from '../../components/infoTooltips/AMPLToolTip';
import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { Link, ROUTES } from '../../components/primitives/Link';
import { TokenIcon } from '../../components/primitives/TokenIcon';
import { ComputedReserveData } from '../../hooks/app-data-provider/useAppDataProvider';

export const MarketAssetsListItem = ({ ...reserve }: ComputedReserveData) => {
  const router = useRouter();
  const { currentMarket } = useProtocolDataContext();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const offboardingDiscussion = AssetsBeingOffboarded[currentMarket]?.[reserve.symbol];

  return (
    <ListItem
      px={6}
      minHeight={76}
      onClick={() => {
        trackEvent(MARKETS.DETAILS_NAVIGATION, {
          type: 'Row',
          assetName: reserve.name,
          asset: reserve.underlyingAsset,
          market: currentMarket,
        });
        router.push(ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket));
      }}
      sx={{ cursor: 'pointer' }}
      button
      data-cy={`marketListItemListItem_${reserve.symbol.toUpperCase()}`}
    >
      <ListColumn isRow maxWidth={280}>
        <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Typography variant="h4" noWrap>
            {reserve.name}
          </Typography>

          <Box
            sx={{
              p: { xs: '0', xsm: '3.625px 0px' },
            }}
          >
            <Typography variant="subheader2" color="text.muted" noWrap>
              {reserve.symbol}
              {reserve.isIsolated && (
                <span style={{ marginLeft: '8px' }}>
                  <IsolatedEnabledBadge />
                </span>
              )}
            </Typography>
          </Box>
        </Box>
        {reserve.symbol === 'AMPL' && <AMPLToolTip />}
        {reserve.symbol === 'renFIL' && <RenFILToolTip />}
        {offboardingDiscussion && <OffboardingTooltip discussionLink={offboardingDiscussion} />}
      </ListColumn>

      <ListColumn>
        <FormattedNumber compact value={reserve.totalLiquidity} variant="main16" />
        <ReserveSubheader value={reserve.totalLiquidityUSD} />
      </ListColumn>

      <ListColumn>
        <IncentivesCard
          value={reserve.supplyAPY}
          incentives={reserve.aIncentivesData || []}
          symbol={reserve.symbol}
          variant="main16"
          symbolsVariant="secondary16"
        />
      </ListColumn>

      <ListColumn>
        {reserve.borrowingEnabled || Number(reserve.totalDebt) > 0 ? (
          <>
            <FormattedNumber compact value={reserve.totalDebt} variant="main16" />{' '}
            <ReserveSubheader value={reserve.totalDebtUSD} />
          </>
        ) : (
          <NoData variant={'secondary14'} color="text.secondary" />
        )}
      </ListColumn>

      <ListColumn>
        <IncentivesCard
          value={Number(reserve.totalVariableDebtUSD) > 0 ? reserve.variableBorrowAPY : '-1'}
          incentives={reserve.vIncentivesData || []}
          symbol={reserve.symbol}
          variant="main16"
          symbolsVariant="secondary16"
        />
        {!reserve.borrowingEnabled &&
          Number(reserve.totalVariableDebt) > 0 &&
          !reserve.isFrozen && <ReserveSubheader value={'Disabled'} />}
        {reserve.symbol === 'ETH' && (
          <Box>
            <Link
              href="https://governance.aave.com/t/arfc-merit-a-new-aave-alignment-user-reward-system/16646"
              style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}
              target="blank"
            >
              <Typography variant="secondary14">
                <Trans>
                  Eligible for <strong>2.1M$</strong> WETH Community Program 👻
                </Trans>
                <TextWithTooltip
                  wrapperProps={{ sx: { display: 'inline-flex', alignItems: 'center', ml: 1 } }}
                  event={{
                    eventName: GENERAL.TOOL_TIP,
                    eventParams: {
                      tooltip: 'Community Rewards',
                    },
                  }}
                >
                  <Trans>
                    This is a program initiated and implemented by the decentralised Aave community.
                    Aave Labs does not guarantee the program and accepts no liability.
                  </Trans>
                </TextWithTooltip>
              </Typography>
            </Link>
          </Box>
        )}
      </ListColumn>
      {/* 
      <ListColumn>
        <IncentivesCard
          value={Number(reserve.totalStableDebtUSD) > 0 ? reserve.stableBorrowAPY : '-1'}
          incentives={reserve.sIncentivesData || []}
          symbol={reserve.symbol}
          variant="main16"
          symbolsVariant="secondary16"
        />
        {!reserve.borrowingEnabled && Number(reserve.totalStableDebt) > 0 && !reserve.isFrozen && (
          <ReserveSubheader value={'Disabled'} />
        )}
      </ListColumn> */}

      <ListColumn minWidth={95} maxWidth={95} align="right">
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
          onClick={() =>
            trackEvent(MARKETS.DETAILS_NAVIGATION, {
              type: 'Button',
              assetName: reserve.name,
              asset: reserve.underlyingAsset,
              market: currentMarket,
            })
          }
        >
          <Trans>Details</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};
