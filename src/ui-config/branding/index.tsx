import React from 'react';
import { IntlShape } from 'react-intl/src/types';
import { SocialIcon, SocialType } from '@aave/aave-ui-kit';

import FormattedTxErrorTextUI from './FormattedTxErrorText';
import TopDisclaimerUI from './TopDisclaimer';
import LegalBanner from './LegalBanner';
import { UnlockWalletExtraText as UnlockWalletExtraTextUI } from './UnlockWalletExtraText';

import logo from './images/aaveLogo.svg';

export const LOGO = logo;

export const socialIcons: SocialIcon[] = [
  {
    url: 'https://github.com/aave/aave-ui',
    type: SocialType.Github,
  },
  {
    url: 'https://discord.gg/7kHKnkDEUf',
    type: SocialType.Discord,
  },
];

export const TopDisclaimer: React.FC = TopDisclaimerUI;
export const BottomDisclaimer: React.FC = LegalBanner;
export const FormattedTxErrorText: React.FC = FormattedTxErrorTextUI;
export const UnlockWalletExtraText: React.FC<{ intl: IntlShape }> = UnlockWalletExtraTextUI;
