import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';

import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import { isFeatureEnabled } from '../../../../utils/marketsAndNetworksConfig';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListColumn } from '../ListColumn';
import { ListItemUsedAsCollateral } from '../ListItemUsedAsCollateral';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { SuppliedPositionsItem } from './types';

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  aIncentives,
  isActive,
  isFrozen,
  isIsolated,
  canBeEnabledAsCollateral,
  usageAsCollateralEnabledOnUser,
}: SuppliedPositionsItem) => {
  const { currentMarketData } = useProtocolDataContext();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);

  return (
    <ListItemWrapper symbol={reserve.symbol} iconSymbol={reserve.iconSymbol}>
      <ListValueColumn
        symbol={reserve.symbol}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />

      <ListAPRColumn
        value={Number(reserve.liquidityRate)}
        incentives={aIncentives}
        symbol={reserve.symbol}
      />

      <ListColumn>
        <ListItemUsedAsCollateral
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() => console.log('TODO: should be collateral swap modal')}
        />
      </ListColumn>

      <ListButtonsColumn>
        <Button
          disabled={!isActive}
          variant="contained"
          onClick={() => console.log('TODO: should be withdraw modal')}
        >
          <Trans>Withdraw</Trans>
        </Button>

        {isSwapButton ? (
          <Button
            disabled={!isActive || isFrozen}
            variant="outlined"
            onClick={() => console.log('TODO: should be swap modal')}
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button
            disabled={!isActive || isFrozen}
            variant="outlined"
            onClick={() => console.log('TODO: should be supply modal')}
          >
            <Trans>Supply</Trans>
          </Button>
        )}
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
