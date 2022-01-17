import React from 'react';
import { useThemeContext } from '@aave/aave-ui-kit';

import { Wallet } from '../../index';
import { AvailableWeb3Connectors } from '../../../../libs/web3-data-provider';

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

      <div>
        <div>
          <img src={icon} alt={title} />
        </div>

        <div>
          <p>{title}</p>
          {!!description && <span>{description}</span>}
        </div>
      </div>
    </button>
  );
}
