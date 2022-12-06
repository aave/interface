import NextAuth from 'next-auth';
import Okta from 'next-auth/providers/okta';

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    Okta({
      clientId: '',
      clientSecret: '',
    }),
  ],
};

export default NextAuth(authOptions);
