import { FormattedNumber } from '../../../../components/primitives/FormattedNumber';
import { ListItemWrapper } from '../ListItemWrapper';
import { SupplyAssetsItem } from './types';

export const SupplyAssetsListItem = ({ symbol, availableToDeposit }: SupplyAssetsItem) => {
  return (
    <ListItemWrapper tokenSymbol={symbol}>
      <FormattedNumber value={availableToDeposit} />
    </ListItemWrapper>
  );
};
