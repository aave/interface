import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { AnimationArrow, DropdownWrapper, useThemeContext } from '@aave/aave-ui-kit';

import messages from './messages';
import staticStyles from './style';
import { getNetworkConfig } from '../../../../helpers/config/markets-and-network-config';
import { ChainId } from '@aave/contract-helpers';

interface SelectPreferredNetworkProps {
  preferredNetwork: ChainId;
  onSelectPreferredNetwork: (network: ChainId) => void;
  supportedNetworks: ChainId[];
}

export default function SelectPreferredNetwork({
  preferredNetwork,
  onSelectPreferredNetwork,
  supportedNetworks,
}: SelectPreferredNetworkProps) {
  const intl = useIntl();
  const { currentTheme } = useThemeContext();

  const [visible, setVisible] = useState(false);

  const getFormattedName = (chainId: ChainId) => {
    const config = getNetworkConfig(chainId);
    if (config?.isFork) return intl.formatMessage(messages.forkNetwork, { network: config.name });
    if (config?.isTestnet)
      return intl.formatMessage(messages.testNetwork, { network: config.name });
    return intl.formatMessage(messages.mainnet, { network: config.name });
  };

  return (
    <div className="SelectPreferredNetwork">
      <p className="SelectPreferredNetwork__title">{intl.formatMessage(messages.title)}</p>

      <DropdownWrapper
        visible={visible}
        setVisible={setVisible}
        buttonComponent={
          <button
            className="SelectPreferredNetwork__select"
            type="button"
            onClick={() => setVisible(true)}
          >
            <span>{getFormattedName(preferredNetwork)}</span>
            <AnimationArrow
              className="SelectPreferredNetwork__select-arrow"
              active={visible}
              width={12}
              height={6}
              arrowTopPosition={1}
              arrowWidth={7}
              arrowHeight={1}
              color={currentTheme.textDarkBlue.hex}
            />
          </button>
        }
        verticalPosition="bottom"
        horizontalPosition="center"
      >
        {supportedNetworks.map((network) => (
          <button
            type="button"
            className="SelectPreferredNetwork__option"
            onClick={() => {
              onSelectPreferredNetwork(network);
              setVisible(false);
            }}
            key={network}
            disabled={network === preferredNetwork}
          >
            <span>{getFormattedName(network)}</span>
          </button>
        ))}
      </DropdownWrapper>

      <style jsx={true} global={true}>
        {staticStyles}
      </style>
      <style jsx={true}>{`
        .SelectPreferredNetwork {
          &__select {
            background: ${currentTheme.whiteItem.hex};
            color: ${currentTheme.textDarkBlue.hex};
            &:hover {
              border-color: ${currentTheme.textDarkBlue.hex};
            }
          }

          &__option {
            color: ${currentTheme.darkBlue.hex};
            &:after {
              background: ${currentTheme.darkBlue.hex};
            }
            &:hover,
            &:disabled {
              background: ${currentTheme.mainBg.hex};
              color: ${currentTheme.textDarkBlue.hex};
            }
          }
        }
      `}</style>
    </div>
  );
}
