import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';

export const USER_GHO_BORROW_HISTORY = `
query UserGhoBorrowHistory($userAddress: String!) {
  borrows(where: { user: $userAddress }) {
    id
  }
}
`;

export const useGhoBorrowHistory = () => {
  const [currentMarketData, account] = useRootStore((state) => [
    state.currentMarketData,
    state.account,
  ]);

  const requestBody = {
    query: USER_GHO_BORROW_HISTORY,
    variables: { userAddress: account },
  };

  const fetchGhoBorrowHistory = async () => {
    if (!currentMarketData.ghoSubgraphUrl) {
      return;
    }

    const response = await fetch(currentMarketData.ghoSubgraphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const { data } = await response.json();
    console.log('data', data.borrows.length);
    const numberOfBorrows: number = data.borrows?.length || 0;
    return numberOfBorrows;
  };

  return useQuery({
    queryFn: () => fetchGhoBorrowHistory(),
    queryKey: ['userGhoBorrowHistory', account],
    enabled: !!account,
    initialData: 0,
  });
};
