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
    // NOTE: trailing slash is required because next.config.js sets `trailingSlash: true`.
    // Without it Next issues a 308 redirect that loops -> ERR_TOO_MANY_REDIRECTS.
    const res = await fetch(`/api/preflight-compliance/?address=${encodeURIComponent(address)}`);
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
