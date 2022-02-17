import { ReactNode } from 'react';

import { AMPLWarning } from '../../../components/infoTooltips/AMPLWarning';
import { ListMobileItem } from '../../../components/lists/ListMobileItem';

interface ListMobileItemWrapperProps {
  symbol: string;
  iconSymbol: string;
  name: string;
  underlyingAsset: string;
  children: ReactNode;
}

export const ListMobileItemWrapper = ({
  symbol,
  iconSymbol,
  name,
  children,
  underlyingAsset,
}: ListMobileItemWrapperProps) => {
  return (
    <ListMobileItem
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      warningComponent={symbol === 'AMPL' && <AMPLWarning />}
    >
      {children}
    </ListMobileItem>
  );
};
