/**
 * Service for interacting with TokenLogic GraphQL API
 */

const GRAPHQL_ENDPOINT = 'https://tokenlogic-data.ddn.hasura.app/graphql';
const API_KEY = process.env.NEXT_PUBLIC_TOKENLOGIC_API_KEY || process.env.TOKENLOGIC_API_KEY;

export type GraphQLResponse<T = unknown> = {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
};

export interface GraphQLSchemaField {
  name: string;
}

export interface GraphQLQueryType {
  fields: GraphQLSchemaField[];
}

export interface GraphQLSchemaResponse {
  __schema: {
    queryType: GraphQLQueryType;
  };
}

export interface GraphQLTypeField {
  name: string;
  type: {
    name: string;
  };
}

export interface GraphQLTypeResponse {
  __type: {
    fields: GraphQLTypeField[];
  } | null;
}

export interface SGhoApyDataItem {
  blockHour: string;
  apr: number;
}

export interface SGhoApyQueryResponse {
  aaveV3RatesSgho: SGhoApyDataItem[];
}

export class TokenLogicGraphQLService {
  private static instance: TokenLogicGraphQLService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): TokenLogicGraphQLService {
    if (!TokenLogicGraphQLService.instance) {
      TokenLogicGraphQLService.instance = new TokenLogicGraphQLService();
    }
    return TokenLogicGraphQLService.instance;
  }

  /**
   * Execute a GraphQL query
   */
  async query<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    if (!API_KEY) {
      throw new Error(
        'API key not configured. Please set NEXT_PUBLIC_TOKENLOGIC_API_KEY or TOKENLOGIC_API_KEY in your environment variables.'
      );
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(`GraphQL error: ${result.errors.map((e) => e.message).join(', ')}`);
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL query');
    }

    return result.data;
  }

  /**
   * Get available tables/queries
   */
  async getAvailableTables(): Promise<string[]> {
    const query = `
      query GetAvailableTables {
        __schema {
          queryType {
            fields {
              name
            }
          }
        }
      }
    `;

    const result = await this.query<GraphQLSchemaResponse>(query);
    return result.__schema.queryType.fields.map((field) => field.name);
  }

  /**
   * Get schema information for a specific type
   */
  async getTypeFields(typeName: string): Promise<GraphQLTypeField[]> {
    const query = `
      query GetTypeFields($typeName: String!) {
        __type(name: $typeName) {
          fields {
            name
            type {
              name
            }
          }
        }
      }
    `;

    const result = await this.query<GraphQLTypeResponse>(query, { typeName });
    return result.__type?.fields || [];
  }

  /**
   * Fetch sGHO APY data
   */
  async getSGhoApyData(limit = 100): Promise<SGhoApyDataItem[]> {
    const query = `
       query GetSGhoApyHistory($limit: Int!) {
         aaveV3RatesSgho(limit: $limit) {
           blockHour
           apr
         }
       }
     `;

    const result = await this.query<SGhoApyQueryResponse>(query, { limit });
    return result.aaveV3RatesSgho || [];
  }

  /**
   * Fetch sGHO APY data for a specific date range
   */
  async getSGhoApyDataForDateRange(
    startDate: string,
    endDate: string,
    limit = 1000
  ): Promise<SGhoApyDataItem[]> {
    const query = `
       query GetSGhoApyHistoryDateRange($startDate: timestamptz!, $endDate: timestamptz!, $limit: Int!) {
         aaveV3RatesSgho(
           limit: $limit,
           where: {
             blockHour: {
               _gte: $startDate,
               _lte: $endDate
             }
           }
         ) {
           blockHour
           apr
         }
       }
     `;

    const result = await this.query<SGhoApyQueryResponse>(query, { startDate, endDate, limit });
    return result.aaveV3RatesSgho || [];
  }
}

// Export singleton instance
export const tokenLogicGraphQL = TokenLogicGraphQLService.getInstance();
