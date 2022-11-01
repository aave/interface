import { useRootStore } from 'src/store/root';

export const useVotingPower = () => {
  const powers = useRootStore((state) => state.powers);

  return powers;
};
