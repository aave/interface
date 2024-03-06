import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { DASHBOARD, GENERAL } from 'src/utils/mixPanelEvents';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const BorrowAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  availableBorrows,
  availableBorrowsInUSD,
  borrowCap,
  totalBorrows,
  variableBorrowRate,
  vIncentivesData,
  underlyingAsset,
  isFreezed,
}: DashboardReserve) => {
  const { openBorrow } = useModalContext();
  const { currentMarket } = useProtocolDataContext();

  const disableBorrow = isFreezed || Number(availableBorrows) <= 0;

  const trackEvent = useRootStore((store) => store.trackEvent);
  console.log('currentMarket', currentMarket);

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={underlyingAsset}
      data-cy={`dashboardBorrowListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
    >
      <ListValueColumn
        symbol={symbol}
        value={Number(availableBorrows)}
        subValue={Number(availableBorrowsInUSD)}
        disabled={Number(availableBorrows) === 0}
        withTooltip={false}
        capsComponent={
          <CapsHint
            capType={CapType.borrowCap}
            capAmount={borrowCap}
            totalAmount={totalBorrows}
            withoutText
          />
        }
      />
      <ListAPRColumn
        value={Number(variableBorrowRate)}
        incentives={vIncentivesData}
        symbol={symbol}
      >
        {symbol === 'ETH' && currentMarket === 'proto_mainnet_v3' && (
          <Link
            href="https://governance.aave.com/t/arfc-merit-a-new-aave-alignment-user-reward-system/16646"
            style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}
            target="blank"
          >
            <Typography variant="secondary14">
              <Trans>
                Eligible for <strong>2.1M$</strong> wETH Community Program 👻
              </Trans>
              <TextWithTooltip
                wrapperProps={{ sx: { display: 'inline-flex', alignItems: 'center' } }}
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
        )}
      </ListAPRColumn>

      {/* <ListAPRColumn
        value={Number(stableBorrowRate)}
        incentives={sIncentivesData}
        symbol={symbol}
      /> */}
      <ListButtonsColumn>
        <Button
          disabled={disableBorrow}
          variant="contained"
          onClick={() => {
            openBorrow(underlyingAsset, currentMarket, name, 'dashboard');
          }}
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
          onClick={() => {
            trackEvent(DASHBOARD.DETAILS_NAVIGATION, {
              type: 'Button',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
            });
          }}
        >
          <Trans>Details</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
