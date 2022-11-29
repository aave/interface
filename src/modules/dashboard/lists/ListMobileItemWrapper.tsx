import { ReactNode } from 'react';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { AMPLToolTip } from '../../../components/infoTooltips/AMPLToolTip';
import { FrozenTooltip } from '../../../components/infoTooltips/FrozenTooltip';
import { RenFILToolTip } from '../../../components/infoTooltips/RenFILToolTip';
import { ListMobileItem } from '../../../components/lists/ListMobileItem';

interface ListMobileItemWrapperProps {
  symbol?: string;
  iconSymbol?: string;
  name?: string;
  underlyingAsset?: string;
  children: ReactNode;
  loading?: boolean;
  currentMarket?: CustomMarket;
  frozen?: boolean;
  showSupplyCapTooltips?: boolean;
  showBorrowCapTooltips?: boolean;
  showDebtCeilingTooltips?: boolean;
}

export const ListMobileItemWrapper = ({
  symbol,
  iconSymbol,
  name,
  children,
  underlyingAsset,
  loading,
  currentMarket,
  frozen,
  showSupplyCapTooltips = false,
  showBorrowCapTooltips = false,
  showDebtCeilingTooltips = false,
}: ListMobileItemWrapperProps) => {
  return (
    <ListMobileItem
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      warningComponent={
        frozen ? (
          <FrozenTooltip symbol={symbol} currentMarket={currentMarket} />
        ) : symbol === 'AMPL' ? (
          <AMPLToolTip />
        ) : symbol === 'renFIL' ? (
          <RenFILToolTip />
        ) : undefined
      }
      loading={loading}
      currentMarket={currentMarket}
      showSupplyCapTooltips={showSupplyCapTooltips}
      showBorrowCapTooltips={showBorrowCapTooltips}
      showDebtCeilingTooltips={showDebtCeilingTooltips}
    >
      {children}
    </ListMobileItem>
  );
};
