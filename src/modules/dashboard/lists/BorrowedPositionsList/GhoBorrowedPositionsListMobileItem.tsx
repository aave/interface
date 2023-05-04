import { InterestRate } from '@aave/contract-helpers';
import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon } from '@mui/material';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { GhoIncentivesCard } from 'src/components/incentives/GhoIncentivesCard';
import { FixedAPYTooltipText } from 'src/components/infoTooltips/FixedAPYTooltip';
import { ROUTES } from 'src/components/primitives/Link';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';

import { Row } from '../../../../components/primitives/Row';
import {
  ComputedUserReserveData,
  useAppDataContext,
} from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from '../../../../hooks/useModal';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';

export const GhoBorrowedPositionsListMobileItem = ({
  reserve,
  borrowRateMode,
}: ComputedUserReserveData & { borrowRateMode: InterestRate }) => {
  const { currentMarket } = useProtocolDataContext();
  const { openBorrow, openRepay } = useModalContext();
  const { symbol, iconSymbol, name, isActive, isFrozen, borrowingEnabled, underlyingAsset } =
    reserve;
  const { ghoLoadingData, ghoReserveData, ghoUserData } = useAppDataContext();

  const discountableAmount =
    ghoUserData.userGhoBorrowBalance >= ghoReserveData.ghoMinDebtTokenBalanceForDiscount
      ? ghoUserData.userGhoAvailableToBorrowAtDiscount
      : 0;
  const borrowRateAfterDiscount = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    discountableAmount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );

  const hasDiscount =
    ghoUserData.userDiscountTokenBalance >= ghoReserveData.ghoMinDiscountTokenBalanceForDiscount;

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      showBorrowCapTooltips
    >
      <ListValueRow
        title={<Trans>Debt</Trans>}
        value={ghoUserData.userGhoBorrowBalance}
        subValue={ghoUserData.userGhoBorrowBalance}
        disabled={ghoUserData.userGhoBorrowBalance === 0}
      />
      <Row caption={<Trans>APY</Trans>} align="flex-start" captionVariant="description" mb={2}>
        <GhoIncentivesCard
          withTokenIcon={hasDiscount}
          value={ghoLoadingData ? -1 : borrowRateAfterDiscount}
          data-cy={`apyType`}
          stkAaveBalance={ghoUserData.userDiscountTokenBalance}
          ghoRoute={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket) + '/#discount'}
        />
      </Row>
      <Row caption={<Trans>APY type</Trans>} captionVariant="description" mb={2}>
        <ContentWithTooltip tooltipContent={FixedAPYTooltipText} offset={[0, -4]} withoutHover>
          <Button variant="outlined" size="small" color="primary">
            FIXED RATE
            <SvgIcon sx={{ marginLeft: '2px', fontSize: '14px' }}>
              <InformationCircleIcon />
            </SvgIcon>
          </Button>
        </ContentWithTooltip>
      </Row>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={() => openRepay(underlyingAsset, borrowRateMode, false)}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Repay</Trans>
        </Button>
        <Button
          disabled={!isActive || !borrowingEnabled || isFrozen}
          variant="outlined"
          onClick={() => openBorrow(underlyingAsset)}
          fullWidth
        >
          <Trans>Borrow</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
