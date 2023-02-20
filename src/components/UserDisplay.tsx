import { Box } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { BadgeSize, ExclamationBadge } from './badges/ExclamationBadge';
import { ConnectedUserAvatar, ConnectedUserAvatarProps } from './ConnectedUserAvatar';
import { ConnectedUserNameProps, ConnectedUserNameText } from './ConnectedUserName';

type UserDisplayProps = {
  oneLiner?: boolean;
  avatarProps?: ConnectedUserAvatarProps;
  titleProps?: ConnectedUserNameProps;
  subtitleProps?: ConnectedUserNameProps;
};

export const UserDisplay: React.FC<UserDisplayProps> = ({
  oneLiner = false,
  avatarProps,
  titleProps,
  subtitleProps,
}) => {
  const defaultDomain = useRootStore((state) => state.defaultDomain);
  const { readOnlyMode } = useWeb3Context();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <ConnectedUserAvatar
        badge={<ExclamationBadge size={BadgeSize.SM} />}
        invisibleBadge={!readOnlyMode}
        {...avatarProps}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {!oneLiner && defaultDomain?.name ? (
          <>
            <ConnectedUserNameText {...titleProps} />
            <ConnectedUserNameText {...subtitleProps} showDomain={false} />
          </>
        ) : (
          <ConnectedUserNameText {...titleProps} />
        )}
      </Box>
    </Box>
  );
};
