import { ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';

import { CREATE_THREAD_MUTATION, UPSERT_CUSTOMER_MUTATION } from './plain-mutations';

const apiKey = process.env.PLAIN_API_KEY;
if (!apiKey) throw new Error('PLAIN_API_KEY env variable is missing');

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const makeGraphQLRequest = async (query: string, variables: Record<string, unknown>) => {
  const response = await fetch('https://core-api.uk.plain.com/graphql/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowedOrigins = ['https://app.aave.com', 'https://aave.com'];
  const origin = req.headers.origin;

  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return false;

    if (allowedOrigins.includes(origin)) return true;

    // Match any subdomain ending with avaraxyz.vercel.app for deployment urls
    const allowedPatterns = [/^https:\/\/.*avaraxyz\.vercel\.app$/];

    return allowedPatterns.some((pattern) => pattern.test(origin));
  };

  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, text, walletAddress } = req.body;

    if (!email || !text) {
      return res.status(400).json({ message: 'Email and text are required.' });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Missing inquiry' });
    }
    let sanitizedWalletAddress: string | undefined = undefined;
    if (walletAddress && typeof walletAddress === 'string') {
      const candidate = walletAddress.trim();
      if (ethers.utils.isAddress(candidate)) {
        sanitizedWalletAddress = ethers.utils.getAddress(candidate);
      } else {
        console.warn('Invalid walletAddress format provided');
      }
    }

    const upsertCustomerVariables = {
      input: {
        identifier: {
          emailAddress: email,
        },
        onCreate: {
          fullName: email,
          email: {
            email: email,
            isVerified: true,
          },
        },
        onUpdate: {},
      },
    };

    const customerRes = await makeGraphQLRequest(UPSERT_CUSTOMER_MUTATION, upsertCustomerVariables);

    if (customerRes.errors) {
      console.error('GraphQL errors:', customerRes.errors);
      return res
        .status(400)
        .json({ message: 'Failed to create support ticket', error: customerRes.errors });
    }
    const customerResult = customerRes.data?.upsertCustomer;
    if (customerResult?.error) {
      console.error('Error upserting Customer:', customerResult.error);
      return res
        .status(400)
        .json({ message: 'Failed to create support ticket', error: customerResult.error });
    }

    const createThreadVariables = {
      input: {
        title: 'New Support Inquiry',
        customerIdentifier: {
          emailAddress: email,
        },

        components: [
          {
            componentText: {
              text: 'Support inquiry from aave.com',
            },
          },
          {
            componentDivider: {
              dividerSpacingSize: 'M',
            },
          },
          {
            componentText: {
              textSize: 'S',
              textColor: 'MUTED',
              text: 'Contact email',
            },
          },
          {
            componentText: {
              text: email,
            },
          },
          {
            componentSpacer: {
              spacerSize: 'M',
            },
          },
          {
            componentText: {
              textSize: 'S',
              textColor: 'MUTED',
              text: 'Message',
            },
          },
          {
            componentPlainText: {
              plainText: text,
            },
          },
          {
            componentSpacer: {
              spacerSize: 'M',
            },
          },
        ],
        threadFields: [
          {
            key: 'wallet_address',
            type: 'STRING',
            stringValue: sanitizedWalletAddress ?? '',
          },
        ],
      },
    };
    const result = await makeGraphQLRequest(CREATE_THREAD_MUTATION, createThreadVariables);

    if (result.errors) {
      console.error('GraphQL errors in createThread:', result.errors);
      return res
        .status(400)
        .json({ message: 'Failed to create support ticket', error: result.errors });
    }

    const threadResult = result.data?.createThread;
    if (threadResult?.error) {
      console.error('Error creating support ticket:', threadResult.error);
      return res
        .status(400)
        .json({ message: 'Failed to create support ticket', error: threadResult.error });
    }

    return res.status(200).json({
      message: 'Support Ticket Created Successfully',
      data: threadResult.thread.id,
      ok: true,
    });
  } catch (error) {
    console.error('Support ticket backend error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
