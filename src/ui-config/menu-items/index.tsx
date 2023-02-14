import { BookOpenIcon, CreditCardIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline';
import { t } from '@lingui/macro';
import { ReactNode } from 'react';
import { ROUTES } from 'src/components/primitives/Link';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';

import DiscordIcon from '/public/icons/discord.svg';
import GithubIcon from '/public/icons/github.svg';

import { MarketDataType } from '../marketsConfig';
import { RampWidget } from 'src/layouts/RampWidget';

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
    link: ROUTES.staking,
    title: t`Stake`,
    dataCy: 'menuStake',
    isVisible: () =>
      process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true' &&
      process.env.NEXT_PUBLIC_ENV === 'prod' &&
      !ENABLE_TESTNET,
  },
  {
    link: ROUTES.governance,
    title: t`Governance`,
    dataCy: 'menuGovernance',
    isVisible: () =>
      process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true' &&
      process.env.NEXT_PUBLIC_ENV === 'prod' &&
      !ENABLE_TESTNET,
  },
  {
    link: ROUTES.faucet,
    title: t`Faucet`,
    isVisible: () => process.env.NEXT_PUBLIC_ENV === 'staging' || ENABLE_TESTNET,
  },
];

type BuySellCryptoMenuItem = {
  onClick: typeof RampWidget;
  title: string;
  icon: ReactNode;
  type: 'WIDGET'
} & Omit<Navigation , 'link'>

const widgetMenuItems: BuySellCryptoMenuItem[] = [
  {
    type:'WIDGET',
    onClick: (walletAddress) =>  RampWidget(walletAddress),
    title: t`Buy/sell crypto with Ramp`,
    icon: <CreditCardIcon />,
  },
]

interface HostedMenuItems extends Navigation {
  type: 'HOSTED'
  icon: ReactNode;
  makeLink: (walletAddress: string) => string;
}

const hostedMenuItems: HostedMenuItems[] = [
  {
    type: 'HOSTED',
    link: 'https://global.transak.com',
    makeLink: (walletAddress) =>
      `${process.env.NEXT_PUBLIC_TRANSAK_APP_URL}/?apiKey=${process.env.NEXT_PUBLIC_TRANSAK_API_KEY}&walletAddress=${walletAddress}&disableWalletAddressForm=true`,
    title: t`Buy crypto with Transak`,
    icon: <CreditCardIcon />,
  },
]

interface MoreMenuItem extends Navigation {
  icon: ReactNode;
}

const moreMenuItems: MoreMenuItem[] = [
  {
    link: 'https://docs.aave.com/faq/',
    title: t`FAQ`,
    icon: <QuestionMarkCircleIcon />,
  },
  {
    link: 'https://docs.aave.com/portal/',
    title: t`Developers`,
    icon: <BookOpenIcon />,
  },
  {
    link: 'https://discord.gg/7kHKnkDEUf',
    title: t`Discord`,
    icon: <DiscordIcon />,
  },
  {
    link: 'https://github.com/aave/interface',
    title: t`Github`,
    icon: <GithubIcon />,
  },
];


export const moreMenuExtraItems: MoreMenuItem[] = [];
export const moreMenuMobileOnlyItems: MoreMenuItem[] = [];

export const moreNavigation: MoreMenuItem[] = [...moreMenuItems, ...moreMenuExtraItems];

export const buySellCryptoNavigation = [...widgetMenuItems, ...hostedMenuItems];

export const mobileNavigation: Navigation[] = [
  ...navigation,
  ...moreMenuItems,
  ...moreMenuMobileOnlyItems,
];
