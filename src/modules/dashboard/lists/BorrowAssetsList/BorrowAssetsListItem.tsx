import { FormattedNumber } from '../../../../components/primitives/FormattedNumber';
import { ListItemWrapper } from '../ListItemWrapper';
import { BorrowAssetsItem } from './types';

export const BorrowAssetsListItem = ({ symbol, availableBorrows }: BorrowAssetsItem) => {
  return (
    <ListItemWrapper tokenSymbol={symbol}>
      <FormattedNumber value={availableBorrows} />
    </ListItemWrapper>
  );
};
