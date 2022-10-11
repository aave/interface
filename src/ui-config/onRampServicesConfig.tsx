import TransakLogo from 'public/icons/onRampServices/transak.svg';
import { ReactNode } from 'react';

interface MakeLinkParams {
  cryptoSymbol: string;
  network: string;
  walletAddress: string;
}

interface OnRampServices {
  name: string;
  makeLink: ({ cryptoSymbol, network, walletAddress }: MakeLinkParams) => string;
  icon: ReactNode;
}

export const onRampServices: OnRampServices[] = [
  {
    name: 'Transak',
    makeLink: ({ cryptoSymbol, network, walletAddress }) =>
      `${process.env.NEXT_PUBLIC_TRANSAK_APP_URL}/?apiKey=${
        process.env.NEXT_PUBLIC_TRANSAK_API_KEY
      }&network=${
        network.split(' ')[0]
      }&cryptoCurrencyCode=${cryptoSymbol}&walletAddress=${walletAddress}&disableWalletAddressForm=true`,
    icon: <TransakLogo />,
  },
];
