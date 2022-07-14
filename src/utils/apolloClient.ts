import {
  ApolloClient,
  ApolloLink,
  FetchResult,
  HttpLink,
  InMemoryCache,
  Observable,
  Operation,
  split,
  useQuery,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { print } from 'graphql';
// eslint-disable-next-line import/no-named-as-default
import gql from 'graphql-tag';
import { Client, ClientOptions, createClient } from 'graphql-ws';

import { marketsData } from './marketsAndNetworksConfig';

/**
 *
 * @param target
 * @returns if thegraph is valid or not - valid means not broken right now
 */
export const useGraphValid = (target: string) => {
  const { data } = useQuery(gql`
    query ErrorCheck${target} {
      error: ${target} @client
    }
  `);
  return data?.error !== 1;
};

class WebSocketLink extends ApolloLink {
  private client: Client;

  constructor(options: ClientOptions) {
    super();
    this.client = createClient(options);
  }

  public request(operation: Operation): Observable<FetchResult> {
    return new Observable((sink) => {
      return this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: (err) => {
            if (Array.isArray(err))
              // GraphQLError[]
              return sink.error(new Error(err.map(({ message }) => message).join(', ')));

            if (err instanceof CloseEvent)
              return sink.error(
                new Error(
                  `Socket closed with event ${err.code} ${err.reason || ''}` // reason will be available on clean closes only
                )
              );

            return sink.error(err);
          },
        }
      );
    });
  }
}

function createWsLink(uri: string): WebSocketLink {
  const wsLink = new WebSocketLink({
    url: uri,
    connectionAckWaitTimeout: 30000,
    keepAlive: 10000,
    lazy: true,
  });
  return wsLink;
}

/**
 * used for tracking errors per graph
 */
export const APOLLO_QUERY_TARGET = {
  STAKE: 'STAKE',
  GOVERNANCE: 'GOVERNANCE',
  MARKET: (name: string) => `MARKET_${name}`,
};

const isSubscription = ({ query }: Operation) => {
  const definition = getMainDefinition(query);
  return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
};

export const getApolloClient = () => {
  const marketsWithCaching = Object.entries(marketsData).filter(
    ([key, cfg]) => cfg.cachingServerUrl && cfg.cachingWSServerUrl && typeof window !== 'undefined'
  );

  const combinedLink = marketsWithCaching.reduce((acc, [key, cfg]) => {
    const condition = (operation: Operation) =>
      operation.getContext().target === APOLLO_QUERY_TARGET.MARKET(key);
    const http = new HttpLink({ uri: cfg.cachingServerUrl });
    const ws = createWsLink(cfg.cachingWSServerUrl as string);
    if (!acc) return split((operation) => condition(operation) && isSubscription(operation), ws);
    return split(
      (operation) => condition(operation) && isSubscription(operation),
      ws,
      split((operation) => condition(operation), http, acc)
    );
  }, undefined as unknown as ApolloLink);

  const cache = new InMemoryCache({});

  return new ApolloClient({
    cache,
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError, operation }) => {
        const context = operation.getContext();
        console.log('graphQLErrors', graphQLErrors);
        cache.writeQuery({
          query: gql`
                query MainnetConnectionStatus {
                  ${context.target} @client
                }
              `,
          data: { [context.target]: 1 },
        });
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }),
      ...(combinedLink ? [combinedLink] : []),
    ]),
    connectToDevTools: true,
  });
};

export const apolloClient = getApolloClient();
