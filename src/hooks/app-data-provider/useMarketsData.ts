import { AaveClient, chainId, evmAddress, OrderDirection } from '@aave/client';
import { MarketsQuery } from '@aave/graphql';
import { useQuery } from '@tanstack/react-query';
import { FieldNode, Kind, visit } from 'graphql';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';

// TEMPORARY WORKAROUND: remove once the backend resolves Merkl payout tokens on
// their own chain.
//
// A Merkl campaign can pay out on a different chain than its market (e.g. an
// X Layer campaign paying mainnet USDC). The API currently labels the payout
// token with the market's chain, so resolving its `decimals`/`name`/`symbol`
// calls a non-existent contract and fails the whole `markets` query, which
// blanks the market page. The interface never reads `payoutToken`, so we send
// the SDK's own Markets document with `payoutToken` trimmed to fields that need
// no on-chain lookup. Same shape as the SDK's `markets()` action otherwise.
const SAFE_PAYOUT_TOKEN_FIELDS = ['__typename', 'address', 'chainId'];

const SafeMarketsQuery = visit(MarketsQuery, {
  Field(node): FieldNode | undefined {
    if (node.name.value !== 'payoutToken') return undefined;
    return {
      ...node,
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: SAFE_PAYOUT_TOKEN_FIELDS.map((field) => ({
          kind: Kind.FIELD,
          name: { kind: Kind.NAME, value: field },
        })),
      },
    };
  },
}) as typeof MarketsQuery;

type UseMarketsDataParams = {
  client: AaveClient;
  marketData: MarketDataType;
  account?: string | null;
};

export const useMarketsData = ({ client, marketData, account }: UseMarketsDataParams) => {
  const userAddress = account ? evmAddress(account) : undefined;
  const marketKey = [
    ...queryKeysFactory.market(marketData),
    ...queryKeysFactory.user(userAddress ?? 'anonymous'),
  ];

  return useQuery({
    queryKey: marketKey,
    enabled: !!client,
    queryFn: async () => {
      const response = await client.query(SafeMarketsQuery, {
        request: {
          chainIds: [chainId(marketData.chainId)],
          user: userAddress,
        },
        suppliesOrderBy: { tokenName: OrderDirection.Asc },
        borrowsOrderBy: { tokenName: OrderDirection.Asc },
      });

      if (response.isErr()) {
        throw response.error;
      }

      return response.value;
    },
  });
};
