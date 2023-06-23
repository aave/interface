import { TGEStatusType } from '../hooks/tge-data-provider/TGEDataProvider';

export const TGEStatusGenerator = (saleStartDate: number, saleEndDate: number): TGEStatusType => {
  const currentTime = Date.now();
  if (currentTime < saleStartDate) return 'Coming Soon';
  else if (saleStartDate < saleEndDate && currentTime < saleEndDate) return 'Active';
  else if (currentTime > saleEndDate) return 'Ended';
  else return 'Inactive';
};
