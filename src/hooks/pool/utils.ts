import { UseQueryResult } from '@tanstack/react-query';

export type SimplifiedUseQueryResult<TData = unknown, TError = unknown> =
  | Pick<UseQueryResult<TData, TError>, 'data' | 'error' | 'isLoading'>
  | {
      isLoading: false;
      data: TData;
      error: null;
    };

type NonUndefined<T> = T extends undefined ? never : T;

export const combineQueries = <Queries extends readonly SimplifiedUseQueryResult[], P>(
  queries: Queries,
  combiner: (
    ...data: {
      [K in keyof Queries]: NonUndefined<Queries[K]['data']>;
    }
  ) => P
): SimplifiedUseQueryResult<P, Queries[number]['error']> => {
  const isLoading = queries.some((elem) => elem.isLoading);
  const isAllDataDefined = queries.every((elem) => elem.data);
  const allData = queries.map((elem) => elem.data) as {
    [K in keyof Queries]: NonUndefined<Queries[K]['data']>;
  };
  const error = queries.find((elem) => elem.error)?.error;
  if (!error && !isLoading) {
    return {
      isLoading: false,
      data: combiner(...allData),
      error: null,
    };
  }
  return {
    isLoading: isLoading,
    data: isAllDataDefined ? combiner(...allData) : undefined,
    error,
  };
};
