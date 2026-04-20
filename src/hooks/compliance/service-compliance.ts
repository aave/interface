export type ComplianceResult = {
  result: boolean;
  nextCheck: string;
  useV37?: {
    wethGateway: string;
    uiPoolDataProvider: string;
  };
};

export type ComplianceCheckResponse = {
  success: boolean;
  data?: ComplianceResult;
  error?: string;
};

export const checkCompliance = async (address: string): Promise<ComplianceCheckResponse> => {
  try {
    const res = await fetch(`/api/preflight-compliance?address=${encodeURIComponent(address)}`);
    const data = await res.json();

    if (res.ok) {
      return {
        success: true,
        data: {
          result: data.result,
          nextCheck: data.nextCheck,
          useV37: data.useV37,
        },
      };
    }

    return {
      success: false,
      error: data.error || 'Compliance check failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};
