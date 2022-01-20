import { t } from '@lingui/macro';
import { ReactNode } from 'react';

import BookIcon from '/public/icons/book.svg';
import DiscordIcon from '/public/icons/discord.svg';
import GithubIcon from '/public/icons/github.svg';
import QuestionIcon from '/public/icons/question.svg';

import { governanceConfig } from '../governanceConfig';
import { MarketDataType } from '../marketsConfig';
import { stakeConfig } from '../stakeConfig';

interface Navigation {
  link: string;
  title: string;
  isVisible?: (data: MarketDataType) => boolean | undefined;
  dataCy?: string;
}

export const navigation: Navigation[] = [
  {
    link: '/dashboard',
    title: t`Dashboard`,
    dataCy: 'menuDashboard',
  },
  {
    link: '/markets',
    title: t`Markets overview`,
  },
  {
    link: '/staking',
    title: t`Stake`,
    isVisible: () => !!stakeConfig,
  },
  {
    link: '/governance',
    title: t`Governance`,
    isVisible: () => !!governanceConfig,
  },
];

interface MoreMenuItem extends Navigation {
  icon: ReactNode;
}

const moreMenuItems: MoreMenuItem[] = [
  {
    link: 'https://docs.aave.com/faq/',
    title: t`FAQ`,
    icon: <QuestionIcon />,
  },
  {
    link: 'https://docs.aave.com/portal/',
    title: t`Developers`,
    icon: <BookIcon />,
  },
  {
    link: 'https://discord.gg/7kHKnkDEUf',
    title: t`Discord`,
    icon: <DiscordIcon />,
  },
  {
    link: 'https://github.com/aave/aave-ui',
    title: t`Github`,
    icon: <GithubIcon />,
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
