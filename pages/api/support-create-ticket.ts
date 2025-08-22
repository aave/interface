import {
  ComponentDividerSpacingSize,
  ComponentSpacerSize,
  ComponentTextColor,
  ComponentTextSize,
  PlainClient,
} from '@team-plain/typescript-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const apiKey = process.env.PLAIN_API_KEY;
if (!apiKey) throw new Error('PLAIN_API_KEY env variable is missing');
const client = new PlainClient({ apiKey });
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, text } = req.body;

    if (!email || !text) {
      return res.status(400).json({ message: 'Email and text are required.' });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Missing inquiry' });
    }

    const customerRes = await client.upsertCustomer({
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
    });

    if (customerRes.error) {
      console.error('Error upserting Customer:', customerRes.error);

      return res
        .status(400)
        .json({ message: 'Failed to create support ticket', error: customerRes.error });
    }

    const result = await client.createThread({
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
            dividerSpacingSize: ComponentDividerSpacingSize.M,
          },
        },
        {
          componentText: {
            textSize: ComponentTextSize.S,
            textColor: ComponentTextColor.Muted,
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
            spacerSize: ComponentSpacerSize.M,
          },
        },
        {
          componentText: {
            textSize: ComponentTextSize.S,
            textColor: ComponentTextColor.Muted,
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
            spacerSize: ComponentSpacerSize.M,
          },
        },
      ],

      // Label types for: web-support-form
      labelTypeIds: ['lt_01K36FQ2J7ZGXQ55RV769TJHYN'],
    });

    if (result.error) {
      console.error('Error creating support ticket:', result.error);

      return res
        .status(400)
        .json({ message: 'Failed to create support ticket', error: result.error });
    }

    return res
      .status(200)
      .json({ message: 'Support Ticket Created Successfully', data: result.data.id, ok: true });
  } catch (error) {
    console.error('Support ticket backend error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
