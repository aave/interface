import React, { ReactNode, ReactNodeArray } from 'react';
// import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { BasicModal, useThemeContext } from '@aave/aave-ui-kit';

import messages from './messages';
import staticStyles from './style';

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
      className={classNames('ConnectWalletWrapper', className)}
      closeIcon={isCurrentThemeDark ? whiteCloseIcon : closeIcon}
    >
      <div className="ConnectWalletWrapper__inner">
        <div className="ConnectWalletWrapper__caption-inner">
          {/* <h2>{intl.formatMessage(messages.caption)}</h2> */}
          <h2>Connect place holder message</h2>
        </div>

        {children}
      </div>

      <style jsx={true} global={true}>
        {staticStyles}
      </style>
      <style jsx={true} global={true}>{`
        .ConnectWalletWrapper {
          color: ${currentTheme.textDarkBlue.hex};
          background: ${currentTheme.whiteElement.hex} !important;
          h2 {
            color: ${isCurrentThemeDark ? currentTheme.textDarkBlue.hex : currentTheme.primary.hex};
          }
        }
      `}</style>
    </BasicModal>
  );
}
