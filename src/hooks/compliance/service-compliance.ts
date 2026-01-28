export type ComplianceResult = {
  result: boolean;
  nextCheck: string;
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
