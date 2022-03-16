import { ReactNode } from 'react';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { AMPLWarning } from '../../../components/infoTooltips/AMPLWarning';
import { ListMobileItem } from '../../../components/lists/ListMobileItem';

interface ListMobileItemWrapperProps {
  symbol?: string;
  iconSymbol?: string;
  name?: string;
  underlyingAsset?: string;
  children: ReactNode;
  loading?: boolean;
  currentMarket?: CustomMarket;
}

export const ListMobileItemWrapper = ({
  symbol,
  iconSymbol,
  name,
  children,
  underlyingAsset,
  loading,
  currentMarket,
}: ListMobileItemWrapperProps) => {
  return (
    <ListMobileItem
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      warningComponent={symbol === 'AMPL' && <AMPLWarning />}
      loading={loading}
      currentMarket={currentMarket}
    >
      {children}
    </ListMobileItem>
  );
};
