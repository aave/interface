import { IncentivesCard } from '../../../components/incentives/IncentivesCard';
import { ReserveIncentiveResponse } from '../../../hooks/app-data-provider/useIncentiveData';
import { ListColumn } from './ListColumn';

interface ListAPRColumnProps {
  value: number;
  incentives: ReserveIncentiveResponse[];
  symbol: string;
}

export const ListAPRColumn = ({ value, incentives, symbol }: ListAPRColumnProps) => {
  return (
    <ListColumn>
      <IncentivesCard value={value} incentives={incentives} symbol={symbol} />
    </ListColumn>
  );
};
