import { IncentivesCard } from '../../../components/incentives/IncentivesCard';
import { ListColumn } from '../../../components/lists/ListColumn';
import { ReserveIncentiveResponse } from '../../../hooks/app-data-provider/useIncentiveData';

interface ListAPRColumnProps {
  value: number;
  incentives?: ReserveIncentiveResponse[];
  symbol: string;
}

export const ListAPRColumn = ({ value, incentives, symbol }: ListAPRColumnProps) => {
  return (
    <ListColumn>
      <IncentivesCard value={value} incentives={incentives} symbol={symbol} data-cy={`apyType`} />
    </ListColumn>
  );
};
