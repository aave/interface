import { FormattedNumber } from '../../../../components/primitives/FormattedNumber';
import { ListItemWrapper } from '../ListItemWrapper';
import { BorrowedPositionsItem } from './types';

export const BorrowedPositionsListItem = ({ reserve, currentBorrows }: BorrowedPositionsItem) => {
  return (
    <ListItemWrapper tokenSymbol={reserve.symbol}>
      <FormattedNumber value={currentBorrows} />
    </ListItemWrapper>
  );
};
