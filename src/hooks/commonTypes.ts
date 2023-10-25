export type HookOpts<T, V> = {
  select?: (originalValue: T) => V;
  refetchInterval?: number | false | (() => number | false);
  staleTime?: number;
};
