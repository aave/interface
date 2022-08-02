import { ReactNode } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
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
  reserve?: ComputedReserveData;
}

export const ListMobileItemWrapper = (props: ListMobileItemWrapperProps) => {
  const {
    symbol,
    iconSymbol,
    name,
    children,
    underlyingAsset,
    loading,
    currentMarket,
    frozen,
    ...rest
  } = props;
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
      {...props}
    >
      {children}
    </ListMobileItem>
  );
};
