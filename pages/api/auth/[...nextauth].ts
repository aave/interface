import NextAuth from 'next-auth';
import Okta from 'next-auth/providers/okta';

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    Okta({
      clientId: process.env.OKTA_CLIENTID || '',
      clientSecret: process.env.OKTA_CLIENTSECRET || '',
      issuer: process.env.OKTA_DOMAIN || '',
    }),
  ],
};

export default NextAuth(authOptions);
