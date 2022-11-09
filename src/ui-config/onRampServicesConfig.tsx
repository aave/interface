import type { DestinationWallet } from '@coinbase/cbpay-js';
import { generateOnRampURL } from '@coinbase/cbpay-js';
import CoinbaseLogo from 'public/icons/onRampServices/coinbase_coin_pay_blue.svg';
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
  {
    name: 'Coinbase',
    makeLink: ({ cryptoSymbol, network, walletAddress }) => {
      console.log(cryptoSymbol, network, walletAddress);
      if (!process.env.NEXT_PUBLIC_COINBASE_API_KEY) return 'https://coinbase.com';
      const destinationWallets: DestinationWallet[] = [
        {
          address: walletAddress,
          supportedNetworks: [network.toLocaleLowerCase()],
          assets: [cryptoSymbol],
        },
      ];
      return generateOnRampURL({
        appId: process.env.NEXT_PUBLIC_COINBASE_API_KEY,
        destinationWallets,
      });
    },
    icon: <CoinbaseLogo />,
  },
];
