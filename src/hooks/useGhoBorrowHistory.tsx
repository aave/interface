import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL } from 'src/ui-config/queries';

const USER_GHO_BORROW_HISTORY = `
  query UserGhoBorrowHistory($userAddress: String!) {
    borrows(where: { user: $userAddress }) {
      id
    }
  }
`;

const GHO_BORROWS = `
  query GhoBorrows {
    borrows(first: 1000) {
      id
    }
  }
`;

export const useUserGhoBorrowHistory = () => {
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
    const numberOfUserBorrows: number = data.borrows?.length || 0;
    return numberOfUserBorrows;
  };

  return useQuery({
    queryFn: () => fetchGhoBorrowHistory(),
    queryKey: ['userGhoBorrowHistory', account],
    enabled: !!account,
    initialData: 0,
  });
};

export const useGhoBorrows = () => {
  const [currentMarketData, account] = useRootStore((state) => [
    state.currentMarketData,
    state.account,
  ]);

  const requestBody = {
    query: GHO_BORROWS,
  };

  const fetchGhoBorrows = async () => {
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
    console.log('borrows', data.borrows.length);
    const numberOfBorrows: number = data.borrows?.length || 0;
    return numberOfBorrows;
  };

  return useQuery({
    queryFn: () => fetchGhoBorrows(),
    queryKey: ['ghoBorrows', account],
    enabled: !!account,
    refetchInterval: POLLING_INTERVAL,
    initialData: 0,
  });
};
