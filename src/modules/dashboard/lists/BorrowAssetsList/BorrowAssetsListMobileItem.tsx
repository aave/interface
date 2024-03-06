import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';

export const BorrowAssetsListMobileItem = ({
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

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
    >
      <ListValueRow
        title={<Trans>Available to borrow</Trans>}
        value={Number(availableBorrows)}
        subValue={Number(availableBorrowsInUSD)}
        disabled={Number(availableBorrows) === 0}
        capsComponent={
          <CapsHint
            capType={CapType.borrowCap}
            capAmount={borrowCap}
            totalAmount={totalBorrows}
            withoutText
          />
        }
      />
      <Row
        caption={
          <VariableAPYTooltip
            text={<Trans>APY, variable</Trans>}
            key="APY_dash_mob_variable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(variableBorrowRate)}
          incentives={vIncentivesData}
          symbol={symbol}
          variant="secondary14"
        />
      </Row>
      {/* <Row
        caption={
          <StableAPYTooltip
            text={<Trans>APY, stable</Trans>}
            key="APY_dash_mob_stable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(stableBorrowRate)}
          incentives={sIncentivesData}
          symbol={symbol}
          variant="secondary14"
        />
      </Row> */}
      {symbol === 'ETH' && currentMarket === 'proto_mainnet_v3' && (
        <Row>
          <Link
            href="https://governance.aave.com/t/arfc-merit-a-new-aave-alignment-user-reward-system/16646"
            style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}
            target="blank"
          >
            <Typography variant="description">
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
        </Row>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={disableBorrow}
          variant="contained"
          onClick={() => openBorrow(underlyingAsset, currentMarket, name, 'dashboard')}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Borrow</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
          fullWidth
        >
          <Trans>Details</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
