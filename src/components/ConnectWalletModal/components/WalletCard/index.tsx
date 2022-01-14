import React from 'react';
import { useThemeContext } from '@aave/aave-ui-kit';

import { Wallet } from '../../index';
import { AvailableWeb3Connectors } from '../../../../libs/web3-data-provider';

import staticStyles from './style';

interface WalletCardProps extends Wallet {
  handleUnlockExternalWallet: (providerName: AvailableWeb3Connectors) => void;
}

export default function WalletCard({
  title,
  description,
  icon,
  disabled,
  providerName,
  handleUnlockExternalWallet,
  errorMessage,
}: WalletCardProps) {
  const { currentTheme, isCurrentThemeDark } = useThemeContext();

  return (
    <button
      className="WalletCard"
      onClick={() => handleUnlockExternalWallet(providerName)}
      disabled={disabled}
      type="button"
    >
      {disabled && errorMessage && <strong className="WalletCard__error">{errorMessage}</strong>}

      <div className="WalletCard__inner">
        <div className="WalletCard__image-inner">
          <img src={icon} alt={title} />
        </div>

        <div className="WalletCard__text-inner">
          <p>{title}</p>
          {!!description && <span>{description}</span>}
        </div>
      </div>

      <style jsx={true}>{staticStyles}</style>
      <style jsx={true}>{`
        .WalletCard {
          &:hover {
            &:after {
              background: ${isCurrentThemeDark ? currentTheme.white.hex : currentTheme.primary.hex};
            }
          }
          &:disabled {
            .WalletCard__inner {
              border-color: ${currentTheme.red.hex};
            }
          }

          &__error {
            color: ${currentTheme.red.hex};
          }

          &__inner {
            background: ${currentTheme.whiteItem.hex};
          }

          &__text-inner {
            color: ${currentTheme.textDarkBlue.hex};
          }
        }
      `}</style>
    </button>
  );
}
