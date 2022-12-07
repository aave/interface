import NextAuth from 'next-auth';
import Okta from 'next-auth/providers/okta';

export const authOptions = {
  providers: [
    Okta({
      clientId: process.env.OKTA_CLIENTID as string,
      clientSecret: process.env.OKTA_CLIENTSECRET as string,
      issuer: process.env.OKTA_DOMAIN as string,
    }),
  ],
};

export default NextAuth(authOptions);
