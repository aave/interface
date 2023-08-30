export type HookOpts<T, V> = {
  select?: (originalValue: T) => V;
};