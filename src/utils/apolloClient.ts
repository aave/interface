import { ApolloClient, InMemoryCache } from '@apollo/client';

/**
 * used for tracking errors per graph
 */
export const APOLLO_QUERY_TARGET = {
  STAKE: 'STAKE',
  GOVERNANCE: 'GOVERNANCE',
  MARKET: (name: string) => `MARKET_${name}`,
};

export const getApolloClient = () => {
  const cache = new InMemoryCache({});

  return new ApolloClient({
    cache,
    connectToDevTools: true,
  });
};

export const apolloClient = getApolloClient();
