import { Box } from '@mui/material';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { Avatar, AvatarProps } from './Avatar';
import { BadgeSize, ExclamationBadge } from './badges/ExclamationBadge';
import { ConnectedUserAvatar } from './ConnectedUserAvatar';
import {
  ConnectedUserNameProps,
  ConnectedUserNameText,
  UserNameText,
  UserNameTextProps,
} from './ConnectedUserName';

type UserDisplayProps = {
  oneLiner?: boolean;
  avatarProps?: AvatarProps;
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
            <ConnectedUserNameText typography="h4" {...titleProps} />
            <ConnectedUserNameText typography="caption" {...subtitleProps} />
          </>
        ) : (
          <ConnectedUserNameText typography="h4" {...titleProps} />
        )}
      </Box>
    </Box>
  );
};

interface ExternalUserDisplayProps {
  avatarProps?: AvatarProps;
  titleProps?: UserNameTextProps;
  address: string;
}

export const ExternalUserDisplay: React.FC<ExternalUserDisplayProps> = ({
  avatarProps,
  titleProps,
  address,
}) => {
  const { name, avatar } = useGetEns(address);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar image={avatar} {...avatarProps} />
      <UserNameText {...titleProps} variant="h4" address={address} domainName={name} />
    </Box>
  );
};
