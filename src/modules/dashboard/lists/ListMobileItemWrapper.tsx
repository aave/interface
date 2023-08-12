import { ReactNode } from 'react';
import { BorrowDisabledToolTip } from 'src/components/infoTooltips/BorrowDisabledToolTip';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { FrozenTooltip } from '../../../components/infoTooltips/FrozenTooltip';
import { ListMobileItem } from '../../../components/lists/ListMobileItem';

// These are all optional due to MobileListItemLoader
interface ListMobileItemWrapperProps {
  symbol?: string;
  iconSymbol?: string;
  name?: string;
  underlyingAsset?: string;
  children: ReactNode;
  loading?: boolean;
  currentMarket?: CustomMarket;
  frozen?: boolean;
  borrowEnabled?: boolean;
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
  borrowEnabled = true,
  showSupplyCapTooltips = false,
  showBorrowCapTooltips = false,
  showDebtCeilingTooltips = false,
}: ListMobileItemWrapperProps) => {
  const WarningComponent: React.FC = () => {
    const showFrozenTooltip = frozen && symbol !== 'renFIL';
    // const showRenFilTooltip = frozen && symbol === 'renFIL';
    // const showAmplTooltip = !frozen && symbol === 'AMPL';
    // const showstETHTooltip = symbol == 'stETH';
    // const showBUSDOffBoardingTooltip = symbol == 'BUSD';
    const showBorrowDisabledTooltip = !frozen && !borrowEnabled;
    return (
      <>
        {showFrozenTooltip && <FrozenTooltip symbol={symbol} currentMarket={currentMarket} />}
        {showBorrowDisabledTooltip && symbol && currentMarket && (
          <BorrowDisabledToolTip symbol={symbol} currentMarket={currentMarket} />
        )}
      </>
    );
  };

  return (
    <ListMobileItem
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      warningComponent={<WarningComponent />}
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
