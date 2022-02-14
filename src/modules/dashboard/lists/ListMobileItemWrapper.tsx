import { ReactNode } from 'react';

import { ListMobileItem } from '../../../components/lists/ListMobileItem';
import { AMPLWarning } from './AMPLWarning';

interface ListMobileItemWrapperProps {
  symbol: string;
  iconSymbol: string;
  name: string;
  children: ReactNode;
}

export const ListMobileItemWrapper = ({
  symbol,
  iconSymbol,
  name,
  children,
}: ListMobileItemWrapperProps) => {
  return (
    <ListMobileItem
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      warningComponent={symbol === 'AMPL' && <AMPLWarning />}
    >
      {children}
    </ListMobileItem>
  );
};
