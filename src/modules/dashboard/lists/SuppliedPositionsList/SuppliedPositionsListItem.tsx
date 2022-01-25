import { FormattedNumber } from '../../../../components/primitives/FormattedNumber';
import { ListItemWrapper } from '../ListItemWrapper';
import { SuppliedPositionsItem } from './types';

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
}: SuppliedPositionsItem) => {
  return (
    <ListItemWrapper tokenSymbol={reserve.symbol}>
      <FormattedNumber value={underlyingBalance} />
    </ListItemWrapper>
  );
};
