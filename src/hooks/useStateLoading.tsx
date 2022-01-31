import { useState } from 'react';

export const useStateLoading = (initState?: boolean) => {
  const [state, setState] = useState(initState || false);

  const setLoading = (newState: boolean) => {
    setState(!!newState);
  };

  return { loading: state, setLoading };
};
