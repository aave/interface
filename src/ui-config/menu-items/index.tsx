import { t } from '@lingui/macro';
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
    title: t`Home`,
    dataCy: 'menuDashboard',
  },
  {
    link: ROUTES.education,
    title: t`Education`,
    dataCy: 'menuEducation',
  },
  {
    link: ROUTES.about,
    title: t`About`,
    dataCy: 'menuAbout',
  },
  {
    link: ROUTES.playground,
    title: t`Playground`,
    dataCy: 'menuPlayground',
  },
  {
    link: ROUTES.faucet,
    title: t`Faucet`,
    isVisible: () => process.env.NEXT_PUBLIC_ENV === 'staging' || ENABLE_TESTNET,
  },
];
