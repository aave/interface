import React, { ReactNode, ReactNodeArray } from 'react';
// import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { BasicModal, useThemeContext } from '@aave/aave-ui-kit';

import closeIcon from '../../../../images/closeIcon.svg';
import whiteCloseIcon from '../../../../images/whiteCloseIcon.svg';

interface ConnectWalletWrapperProps {
  children: ReactNode | ReactNodeArray;
  className?: string;
  isVisible: boolean;
  onBackdropPress: () => void;
}

export default function ConnectWalletWrapper({
  children,
  className,
  isVisible,
  onBackdropPress,
}: ConnectWalletWrapperProps) {
  // const intl = useIntl();
  const { currentTheme, isCurrentThemeDark } = useThemeContext();

  return (
    <BasicModal
      onBackdropPress={onBackdropPress}
      isVisible={isVisible}
      withCloseButton={true}
      closeIcon={isCurrentThemeDark ? whiteCloseIcon : closeIcon}
    >
      <div>
        <div>
          <h2>Connect your wallet</h2>
        </div>
        {children}
      </div>
    </BasicModal>
  );
}
