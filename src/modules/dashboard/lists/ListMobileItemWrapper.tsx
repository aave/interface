import { ReactNode } from 'react';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { AMPLWarning } from '../../../components/infoTooltips/AMPLWarning';
import { FrozenWarning } from '../../../components/infoTooltips/FrozenWarning';
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
  supplyCapReached?: boolean;
  borrowCapReached?: boolean;
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
  supplyCapReached = false,
  borrowCapReached = false,
}: ListMobileItemWrapperProps) => {
  return (
    <ListMobileItem
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      warningComponent={
        frozen ? <FrozenWarning symbol={symbol} /> : symbol === 'AMPL' ? <AMPLWarning /> : undefined
      }
      loading={loading}
      currentMarket={currentMarket}
      supplyCapReached={supplyCapReached}
      borrowCapReached={borrowCapReached}
    >
      {children}
    </ListMobileItem>
  );
};
