import { ReactNode } from 'react';
import TransakLogo from 'public/icons/onRampServices/transak.svg';

interface MakeLinkParams {
  network: string;
  cryptoCode: string;
  walletAddress: string;
}

interface OnRampServices {
  name: string;
  makeLink: ({ network, cryptoCode, walletAddress }: MakeLinkParams) => string;
  icon: ReactNode;
}

export const onRampServices: OnRampServices[] = [
  {
    name: 'Transak',
    makeLink: ({ network, cryptoCode, walletAddress }) =>
      `${process.env.NEXT_PUBLIC_TRANSAK_URL}/?apiKey=${process.env.NEXT_PUBLIC_TRANSAK_API_KEY}&network=${network}&cryptoCurrencyCode=${cryptoCode}&walletAddress=${walletAddress}&disableWalletAddressForm=true`,
    icon: <TransakLogo />,
  },
];
