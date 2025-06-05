import {
  ArrowCircleRightIcon,
  BookOpenIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline';
import { t } from '@lingui/macro';
import { ReactNode } from 'react';
import { ROUTES } from 'src/components/primitives/Link';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';

import { MarketDataType } from '../marketsConfig';

interface Navigation {
  link: string;
  title: string;
  isVisible?: (data: MarketDataType) => boolean | undefined;
  dataCy?: string;
}

export const navigation: Navigation[] = [
  {
    link: ROUTES.dashboard,
    title: t`Dashboard`,
    dataCy: 'menuDashboard',
  },
  {
    link: ROUTES.markets,
    title: t`Markets`,
    dataCy: 'menuMarkets',
  },
  {
    link: ROUTES.governance,
    title: t`Governance`,
    dataCy: 'menuGovernance',
    // isVisible: () =>
    //   process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true' &&
    //   process.env.NEXT_PUBLIC_ENV === 'prod' &&
    //   !ENABLE_TESTNET,
  },

  {
    link: ROUTES.faucet,
    title: t`Faucet`,
    isVisible: () => process.env.NEXT_PUBLIC_ENV === 'staging' || ENABLE_TESTNET,
  },
];

interface MoreMenuItem extends Navigation {
  icon: ReactNode;
  makeLink?: (walletAddress: string) => string;
}

const moreMenuItems: MoreMenuItem[] = [
  {
    link: 'https://aave.com/faq/',
    title: t`FAQ`,
    icon: <QuestionMarkCircleIcon />,
  },
  {
    link: 'https://aave.com/docs/',
    title: t`Developers`,
    icon: <BookOpenIcon />,
  },
  {
    link: 'https://legacy-markets.aave.com/',
    title: t`Legacy Markets`,
    icon: <ArrowCircleRightIcon />,
  },
];

const fiatEnabled = process.env.NEXT_PUBLIC_FIAT_ON_RAMP;
if (fiatEnabled === 'true') {
  moreMenuItems.push({
    link: 'https://global.transak.com',
    makeLink: (walletAddress) =>
      `${process.env.NEXT_PUBLIC_TRANSAK_APP_URL}/?apiKey=${process.env.NEXT_PUBLIC_TRANSAK_API_KEY}&walletAddress=${walletAddress}&disableWalletAddressForm=true`,
    title: t`Buy Crypto With Fiat`,
    icon: <CreditCardIcon />,
  });
}
export const moreNavigation: MoreMenuItem[] = [...moreMenuItems];
