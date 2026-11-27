import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';

/**
 * The migration queries of the Aave V3 API, called directly until the Aave SDK ships them. The
 * documents and the hooks' names follow the SDK's (`@aave/react`), so moving to it is a change of
 * imports.
 *
 * TODO: default to the production API (https://api.v3.aave.com/graphql) once it has these queries.
 */
const MIGRATION_API_URL =
  process.env.NEXT_PUBLIC_AAVE_MIGRATION_API_URL ||
  'https://api.origin.staging.aave.com/v3/graphql';

const SUPPLY_FIELDS = gql`
  fragment MigrationSupply on MigrationSupply {
    currency {
      ...Currency
    }
    amount {
      ...TokenAmount
    }
    isCollateral
  }
`;

const DEBT_FIELDS = gql`
  fragment MigrationDebt on MigrationDebt {
    currency {
      ...Currency
    }
    amount {
      ...TokenAmount
    }
  }
`;

const COMMON_FIELDS = gql`
  fragment Currency on Currency {
    address
    imageUrl
    name
    symbol
    decimals
    chainId
  }
  fragment DecimalValue on DecimalValue {
    raw
    decimals
    value
  }
  fragment PercentValue on PercentValue {
    raw
    decimals
    value
    formatted
  }
  fragment TokenAmount on TokenAmount {
    usdPerToken
    amount {
      ...DecimalValue
    }
    usd
  }
  ${SUPPLY_FIELDS}
  ${DEBT_FIELDS}
`;

const OPPORTUNITIES_QUERY = gql`
  query MigrationOpportunities($request: MigrationOpportunitiesRequest!) {
    value: migrationOpportunities(request: $request) {
      kind
      market {
        name
        chain {
          name
          icon
          chainId
          explorerUrl
          isTestnet
          nativeWrappedToken
        }
        address
        icon
      }
      supplies {
        ...MigrationSupply
      }
      debts {
        ...MigrationDebt
      }
      suppliedUsd
      borrowedUsd
      netBalanceUsd
      apy {
        ...PercentValue
      }
      borrowApy {
        ...PercentValue
      }
      yearlyEarningsUsd
      healthFactor
      targets {
        ...MigrationTarget
      }
      bestTarget {
        ...MigrationTarget
      }
    }
  }
  fragment MigrationTarget on MigrationTarget {
    spoke {
      address
      name
    }
    eligible
    criteria {
      criterion
      met
      assets
    }
    apy {
      ...PercentValue
    }
    borrowApy {
      ...PercentValue
    }
    yearlyEarningsUsd
    healthFactor
  }
  ${COMMON_FIELDS}
`;

const PREVIEW_FIELDS = gql`
  fragment MigrationPreview on MigrationPreview {
    moving {
      supplies {
        ...MigrationSupply
      }
      debts {
        ...MigrationDebt
      }
      suppliedUsd
      borrowedUsd
      netBalanceUsd
    }
    source {
      current {
        ...MigrationSourceSide
      }
      after {
        ...MigrationSourceSide
      }
    }
    target {
      spoke {
        address
        name
      }
      status
      netBalanceUsd {
        ...MigrationUsdVariation
      }
      apy {
        ...MigrationPercentVariation
      }
      yearlyEarningsUsd {
        ...MigrationUsdVariation
      }
      collateralUsd {
        ...MigrationUsdVariation
      }
      netCollateralUsd {
        ...MigrationUsdVariation
      }
      debtUsd {
        ...MigrationUsdVariation
      }
      borrowApy {
        ...MigrationPercentVariation
      }
      borrowingPowerUsd {
        ...MigrationUsdVariation
      }
      healthFactor {
        current
        after
      }
      legs {
        currency {
          ...Currency
        }
        hub
        supplied {
          ...MigrationAmountVariation
        }
        suppliedUsd {
          ...MigrationUsdVariation
        }
        borrowed {
          ...MigrationAmountVariation
        }
        borrowedUsd {
          ...MigrationUsdVariation
        }
        isCollateral {
          current
          after
        }
      }
      hubs {
        address
        name
        externalCurator {
          name
          icon
        }
      }
    }
  }
  fragment MigrationSourceSide on MigrationSourceSide {
    supplies {
      ...MigrationSupply
    }
    debts {
      ...MigrationDebt
    }
    suppliedUsd
    borrowedUsd
    netBalanceUsd
    apy {
      ...PercentValue
    }
    borrowApy {
      ...PercentValue
    }
    yearlyEarningsUsd
    healthFactor
    availableBorrowsBase
    netCollateralBase
  }
  fragment MigrationUsdVariation on MigrationUsdVariation {
    current
    after
  }
  fragment MigrationPercentVariation on MigrationPercentVariation {
    current {
      ...PercentValue
    }
    after {
      ...PercentValue
    }
  }
  fragment MigrationAmountVariation on MigrationAmountVariation {
    current {
      ...DecimalValue
    }
    after {
      ...DecimalValue
    }
  }
  ${COMMON_FIELDS}
`;

const EARN_PREVIEW_QUERY = gql`
  query MigrationEarnPreview($request: MigrationEarnPreviewRequest!) {
    value: migrationEarnPreview(request: $request) {
      ...MigrationPreview
    }
  }
  ${PREVIEW_FIELDS}
`;

const BORROW_PREVIEW_QUERY = gql`
  query MigrationBorrowPreview($request: MigrationBorrowPreviewRequest!) {
    value: migrationBorrowPreview(request: $request) {
      ...MigrationPreview
    }
  }
  ${PREVIEW_FIELDS}
`;

const MIGRATE_POSITION_QUERY = gql`
  query MigratePosition($request: MigratePositionRequest!) {
    value: migratePosition(request: $request) {
      __typename
      ... on MigrationSignaturesRequired {
        plan
        signatures {
          purpose
          token
          typedData {
            ...MigrationTypedData
          }
        }
      }
      ... on MigrationSafeSignatureRequired {
        typedData {
          ...MigrationTypedData
        }
      }
      ... on TransactionRequest {
        to
        from
        data
        value
        chainId
      }
      ... on MigrationFlashLoanUnavailable {
        token
        required {
          raw
          decimals
          value
        }
        available {
          raw
          decimals
          value
        }
      }
    }
  }
  fragment MigrationTypedData on MigrationTypedData {
    types
    primaryType
    domain {
      name
      version
      chainId
      verifyingContract
    }
    message
  }
`;

/** Amounts and rates come as decimal strings: "0.05" is 5% for a rate. */
type Decimal = string;

interface DecimalValue {
  raw: string;
  decimals: number;
  value: Decimal;
}

interface PercentValue extends DecimalValue {
  formatted: Decimal;
}

interface Currency {
  address: string;
  imageUrl: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
}

interface TokenAmount {
  usdPerToken: Decimal;
  amount: DecimalValue;
  usd: Decimal;
}

export interface MigrationSupply {
  currency: Currency;
  amount: TokenAmount;
  isCollateral: boolean;
}

export interface MigrationDebt {
  currency: Currency;
  amount: TokenAmount;
}

interface MigrationSpoke {
  address: string;
  name: string;
}

export interface MigrationTarget {
  spoke: MigrationSpoke;
  eligible: boolean;
  criteria: Array<{ criterion: string; met: boolean; assets: string[] }>;
  apy: PercentValue | null;
  borrowApy: PercentValue | null;
  yearlyEarningsUsd: Decimal | null;
  healthFactor: Decimal | null;
}

/** What a V3 position holds and earns; shared by an opportunity and each side of a preview. */
interface PositionFigures {
  supplies: MigrationSupply[];
  debts: MigrationDebt[];
  suppliedUsd: Decimal | null;
  borrowedUsd: Decimal | null;
  netBalanceUsd: Decimal | null;
  apy: PercentValue | null;
  borrowApy: PercentValue | null;
  yearlyEarningsUsd: Decimal | null;
  healthFactor: Decimal | null;
}

/** One V3 position that moves as a whole, with the V4 spokes it could move to. */
export interface MigrationOpportunity extends PositionFigures {
  kind: 'EARN' | 'BORROW';
  market: {
    name: string;
    chain: {
      name: string;
      icon: string;
      chainId: number;
      explorerUrl: string;
      isTestnet: boolean;
      nativeWrappedToken: string;
    };
    address: string;
    icon: string;
  };
  targets: MigrationTarget[];
  bestTarget: MigrationTarget | null;
}

interface MigrationSourceSide extends PositionFigures {
  availableBorrowsBase: Decimal | null;
  netCollateralBase: Decimal | null;
}

interface Variation<T> {
  current: T;
  after: T;
}

/** One position moved, in whole or in part, to one V4 spoke. */
export interface MigrationPreview {
  moving: Pick<
    PositionFigures,
    'supplies' | 'debts' | 'suppliedUsd' | 'borrowedUsd' | 'netBalanceUsd'
  >;
  source: Variation<MigrationSourceSide>;
  /** Every figure is null unless `status` is `PREVIEWED`. */
  target: {
    spoke: MigrationSpoke;
    status: 'PREVIEWED' | 'BLOCKED' | 'UNSUPPORTED';
    netBalanceUsd: Variation<Decimal> | null;
    apy: Variation<PercentValue> | null;
    yearlyEarningsUsd: Variation<Decimal> | null;
    collateralUsd: Variation<Decimal> | null;
    netCollateralUsd: Variation<Decimal> | null;
    debtUsd: Variation<Decimal> | null;
    borrowApy: Variation<PercentValue> | null;
    borrowingPowerUsd: Variation<Decimal> | null;
    healthFactor: Variation<Decimal | null> | null;
    legs: Array<{
      currency: Currency;
      hub: string;
      supplied: Variation<DecimalValue>;
      suppliedUsd: Variation<Decimal> | null;
      borrowed: Variation<DecimalValue>;
      borrowedUsd: Variation<Decimal> | null;
      isCollateral: Variation<boolean>;
    }>;
    hubs: Array<{
      address: string;
      name: string;
      externalCurator: { name: string; icon: string } | null;
    }>;
  };
}

/** An EIP-712 document for the wallet to sign as it is. */
export interface MigrationTypedData {
  types: unknown;
  primaryType: string;
  // A Safe's domain carries neither name nor version.
  domain: {
    name: string | null;
    version: string | null;
    chainId: number;
    verifyingContract: string;
  };
  message: unknown;
}

/** What the user does next to migrate. */
export type MigrationExecutionPlan =
  | {
      __typename: 'MigrationSignaturesRequired';
      plan: string;
      signatures: Array<{ purpose: string; token: string | null; typedData: MigrationTypedData }>;
    }
  | { __typename: 'MigrationSafeSignatureRequired'; typedData: MigrationTypedData }
  | {
      __typename: 'TransactionRequest';
      to: string;
      from: string;
      data: string;
      value: string;
      chainId: number;
    }
  | {
      __typename: 'MigrationFlashLoanUnavailable';
      token: string;
      required: DecimalValue;
      available: DecimalValue;
    };

export interface MigrationMarketInput {
  address: string;
  chainId: number;
}

export interface MigrationOpportunitiesRequest {
  markets: MigrationMarketInput[];
  user: string;
}

export interface MigrationEarnPreviewRequest {
  user: string;
  market: MigrationMarketInput;
  currency: string;
  spoke: string;
  /** In whole tokens. */
  amount: string;
  useAsCollateral: boolean;
}

export interface MigrationBorrowPreviewRequest {
  user: string;
  market: MigrationMarketInput;
  spoke: string;
  /** Above 0 and up to 100, with at most two decimals. */
  percentage: string;
}

export interface MigratePositionRequest {
  user: string;
  market: MigrationMarketInput;
  spoke: string;
  position:
    | { earn: { currency: string; amount: string; useAsCollateral: boolean } }
    | { borrow: { percentage: string } };
  /** Omitted on the first call. On the next ones, the plan and what was signed so far. */
  signed?: { plan: string; signatures: string[]; safeSignature?: string };
}

const call = async <T>(document: string, variables: { request: object }, signal?: AbortSignal) =>
  (await request<{ value: T }>({ url: MIGRATION_API_URL, document, variables, signal })).value;

const OPPORTUNITIES_KEY = ['v4Migration', 'opportunities'] as const;

/** Matches every user's opportunities, to mark them out of date once a migration is mined. */
export const migrationOpportunitiesKey = OPPORTUNITIES_KEY;

/** The user's V3 positions that can move to V4, read once for every screen that lists them. */
export const useMigrationOpportunities = (variables: MigrationOpportunitiesRequest) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [...OPPORTUNITIES_KEY, variables],
    queryFn: ({ signal }) =>
      call<MigrationOpportunity[]>(OPPORTUNITIES_QUERY, { request: variables }, signal),
    staleTime: 30_000,
    // A screen that shows a migration's outcome still reads its position from here, and a
    // refetch behind its back would take a fully migrated position away from it.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return { data, loading: isLoading, error };
};

// A preview is never served from the cache: Migrate is only enabled on a fresh answer, and no
// data is returned while a new request loads.
const PREVIEW_OPTIONS = { staleTime: 0, gcTime: 0, refetchOnWindowFocus: false } as const;

export const useMigrationEarnPreview = (variables: MigrationEarnPreviewRequest) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['v4Migration', 'earnPreview', variables],
    queryFn: ({ signal }) =>
      call<MigrationPreview>(EARN_PREVIEW_QUERY, { request: variables }, signal),
    ...PREVIEW_OPTIONS,
  });
  return { data, loading: isLoading, error };
};

export const useMigrationBorrowPreview = (variables: MigrationBorrowPreviewRequest) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['v4Migration', 'borrowPreview', variables],
    queryFn: ({ signal }) =>
      call<MigrationPreview>(BORROW_PREVIEW_QUERY, { request: variables }, signal),
    ...PREVIEW_OPTIONS,
  });
  return { data, loading: isLoading, error };
};

/**
 * Asks for the next step of a migration. Call it again after each signing step, until it answers
 * the transaction to send.
 */
export const migratePosition = (variables: MigratePositionRequest) =>
  call<MigrationExecutionPlan>(MIGRATE_POSITION_QUERY, { request: variables });
