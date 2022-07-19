import { useEffect } from 'react';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

import { StakeSlice, createStakeSlice } from './stakeSlice';

interface RootStore extends StakeSlice {}

export const useStore = create<RootStore>()(
  devtools((...args) => ({
    ...createStakeSlice(...args),
  }))
);

function createSingletonSubscriber(implementation: () => void, interval: number) {
  let id: NodeJS.Timer | null;
  let listeners = 0;
  function subscribe() {
    listeners++;
    if (!id) {
      id = setInterval(implementation, interval);
    }
  }
  function unsubscribe() {
    listeners--;
    if (id && listeners === 0) {
      console.log('unsubscribed');
      clearInterval(id);
      id = null;
    }
  }
  return () =>
    useEffect(() => {
      subscribe();
      return unsubscribe;
    }, []);
}

export const useStakeDataSubscription = createSingletonSubscriber(() => {
  useStore.getState().refetchStakeData();
}, 500);
