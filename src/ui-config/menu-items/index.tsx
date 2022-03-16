import { BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline';
import { t } from '@lingui/macro';
import { ReactNode } from 'react';
import { ROUTES } from 'src/components/primitives/Link';

import DiscordIcon from '/public/icons/discord.svg';
import GithubIcon from '/public/icons/github.svg';
import AaveClassic from '/public/icons/aave_classic.svg';

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
  },
  {
    link: ROUTES.staking,
    title: t`Stake`,
    isVisible: () => process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true',
  },
  {
    link: ROUTES.governance,
    title: t`Governance`,
    isVisible: () => process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true',
  },
];

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
  {
    link: 'https://classic.aave.com',
    title: t`Switch to Aave Classic`,
    icon: <AaveClassic />,
  },
];

export const moreMenuExtraItems: MoreMenuItem[] = [];
export const moreMenuMobileOnlyItems: MoreMenuItem[] = [];

export const moreNavigation: MoreMenuItem[] = [...moreMenuItems, ...moreMenuExtraItems];

export const mobileNavigation: Navigation[] = [
  ...navigation,
  ...moreMenuItems,
  ...moreMenuMobileOnlyItems,
];
