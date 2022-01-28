import { useState } from 'react';

export enum LOADING_STATE {
  IDLE = 'idle',
  LOADING = 'loading',
  FINISHED = 'finished',
}

const LOADING_STATES = [LOADING_STATE.IDLE, LOADING_STATE.LOADING];

export const useStateLoading = (initState?: LOADING_STATE) => {
  const [state, setState] = useState<LOADING_STATE>(initState || LOADING_STATE.IDLE);

  const setLoading = (newState: LOADING_STATE) => {
    if (LOADING_STATES.includes(state)) {
      setState(newState);
    }
  };

  return { loading: LOADING_STATES.includes(state), setLoading };
};
