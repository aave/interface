import type { NextApiRequest, NextApiResponse } from 'next';
import { isAddress } from 'viem';

const COMPLIANCE_API_URL = process.env.COMPLIANCE_API_URL;
const COMPLIANCE_SECRET = process.env.COMPLIANCE_SECRET;

type ComplianceApiResponse = {
  result: boolean;
  lastChecked: string;
  nextCheck: string;
};

type PreflightResponse = {
  result: boolean;
  nextCheck: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PreflightResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Address is required' });
  }

  // Validate address format to prevent SSRF attacks
  // const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address format' });
  }

  if (!COMPLIANCE_API_URL || !COMPLIANCE_SECRET) {
    console.error('Compliance API not configured');
    // Fail open in development if not configured
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        result: true,
        nextCheck: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });
    }
    return res.status(500).json({ error: 'Service unavailable' });
  }

  try {
    // use ?overrideResultStatus=false | true if you want to override the result

    const response = await fetch(`${COMPLIANCE_API_URL}/check/${encodeURIComponent(address)}`, {
      method: 'GET',
      headers: {
        'x-compliance-secret': COMPLIANCE_SECRET,
      },
    });

    console.log('RESPONSE---', response);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Compliance API: Invalid secret');
        return res.status(500).json({ error: 'Service configuration error' });
      }
      if (response.status === 400) {
        return res.status(400).json({ error: 'Invalid address format' });
      }
      return res.status(500).json({ error: 'Compliance check failed' });
    }

    const data: ComplianceApiResponse = await response.json();
    console.log('DATA---', data);

    return res.status(200).json({
      result: data.result,
      nextCheck: data.nextCheck,
    });
  } catch (error) {
    console.error('Compliance API error:', error);
    return res.status(500).json({ error: 'Service unavailable' });
  }
}
