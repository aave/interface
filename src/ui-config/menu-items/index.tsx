import {
  ArrowCircleRightIcon,
  BookOpenIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/macro';
import { ReactNode } from 'react';
import { ROUTES } from 'src/components/primitives/Link';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';

import { MarketDataType } from '../marketsConfig';

interface Navigation {
  link: string;
  title: MessageDescriptor;
  isVisible?: (data: MarketDataType) => boolean | undefined;
  dataCy?: string;
}

export const navigation: Navigation[] = [
  {
    link: ROUTES.dashboard,
    title: msg`Dashboard`,
    dataCy: 'menuDashboard',
  },
  {
    link: ROUTES.markets,
    title: msg`Markets`,
    dataCy: 'menuMarkets',
  },
  {
    link: ROUTES.staking,
    title: msg`Stake`,
    dataCy: 'menuStake',
    isVisible: () =>
      process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true' &&
      process.env.NEXT_PUBLIC_ENV === 'prod' &&
      !ENABLE_TESTNET,
  },
  {
    link: ROUTES.governance,
    title: msg`Governance`,
    dataCy: 'menuGovernance',
    // isVisible: () =>
    //   process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true' &&
    //   process.env.NEXT_PUBLIC_ENV === 'prod' &&
    //   !ENABLE_TESTNET,
  },
  {
    link: ROUTES.faucet,
    title: msg`Faucet`,
    isVisible: () => process.env.NEXT_PUBLIC_ENV === 'staging' || ENABLE_TESTNET,
  },
];

interface MoreMenuItem extends Navigation {
  icon: ReactNode;
  makeLink?: (walletAddress: string) => string;
}

const moreMenuItems: MoreMenuItem[] = [
  {
    link: 'https://docs.aave.com/faq/',
    title: msg`FAQ`,
    icon: <QuestionMarkCircleIcon />,
  },
  {
    link: 'https://docs.aave.com/portal/',
    title: msg`Developers`,
    icon: <BookOpenIcon />,
  },
  {
    link: 'https://legacy-markets.aave.com/',
    title: msg`Legacy Markets`,
    icon: <ArrowCircleRightIcon />,
  },
];

const fiatEnabled = process.env.NEXT_PUBLIC_FIAT_ON_RAMP;
if (fiatEnabled === 'true') {
  moreMenuItems.push({
    link: 'https://global.transak.com',
    makeLink: (walletAddress) =>
      `${process.env.NEXT_PUBLIC_TRANSAK_APP_URL}/?apiKey=${process.env.NEXT_PUBLIC_TRANSAK_API_KEY}&walletAddress=${walletAddress}&disableWalletAddressForm=true`,
    title: msg`Buy Crypto With Fiat`,
    icon: <CreditCardIcon />,
  });
}
export const moreNavigation: MoreMenuItem[] = [...moreMenuItems];
