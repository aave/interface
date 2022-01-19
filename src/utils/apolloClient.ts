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
import { WebSocketLink as WebSocketLinkLegacy } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { print } from 'graphql';
// eslint-disable-next-line import/no-named-as-default
import gql from 'graphql-tag';
import { Client, ClientOptions, createClient } from 'graphql-ws';

import { governanceConfig } from '../ui-config/governanceConfig';
import { stakeConfig } from '../ui-config/stakeConfig';
import { networkConfigs } from './marketsAndNetworksConfig';

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
 * Thegraph ws doesn't support modern ws standards so we use the legacy one.
 */
function createWsLinkLegacy(uri: string): WebSocketLinkLegacy {
  const wsLink = new WebSocketLinkLegacy({
    uri,
    options: {
      reconnect: true,
      timeout: 30000,
      lazy: true,
    },
  });
  return wsLink;
}

/**
 * used for tracking errors per graph
 */
export const APOLLO_QUERY_TARGET = {
  STAKE: 'STAKE',
  GOVERNANCE: 'GOVERNANCE',
  CHAIN: (num: number) => `CHAIN_${num}`,
};

const isSubscription = ({ query }: Operation) => {
  const definition = getMainDefinition(query);
  return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
};

const getGovernanceLink = (link?: ApolloLink) => {
  if (governanceConfig && process.browser) {
    const condition = (operation: Operation) =>
      operation.getContext().target === APOLLO_QUERY_TARGET.GOVERNANCE;
    const http = new HttpLink({ uri: governanceConfig.queryGovernanceDataUrl });
    const ws = createWsLinkLegacy(governanceConfig.wsGovernanceDataUrl);
    return split(
      (operation) => condition(operation) && isSubscription(operation),
      ws,
      split((operation) => condition(operation), http, link)
    );
  }
  return link;
};

const getStakeLink = (link?: ApolloLink) => {
  if (stakeConfig && process.browser) {
    const condition = (operation: Operation) =>
      operation.getContext().target === APOLLO_QUERY_TARGET.STAKE;
    const http = new HttpLink({ uri: stakeConfig.queryStakeDataUrl });
    const ws = createWsLink(stakeConfig.wsStakeDataUrl);
    return split(
      (operation) => condition(operation) && isSubscription(operation),
      ws,
      split((operation) => condition(operation), http, link)
    );
  }
  return link;
};

export const getApolloClient = () => {
  const link = getStakeLink(getGovernanceLink());

  const combinedLink = Object.entries(networkConfigs).reduce((acc, [key, cfg]) => {
    if (cfg.cachingServerUrl && cfg.cachingWSServerUrl && process.browser) {
      const condition = (operation: Operation) =>
        operation.getContext().target === APOLLO_QUERY_TARGET.CHAIN(key as unknown as number);
      const http = new HttpLink({ uri: cfg.cachingServerUrl });
      const ws = createWsLink(cfg.cachingWSServerUrl);
      return split(
        (operation) => condition(operation) && isSubscription(operation),
        ws,
        split((operation) => condition(operation), http, acc)
      );
    }
    return acc;
  }, link);

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
