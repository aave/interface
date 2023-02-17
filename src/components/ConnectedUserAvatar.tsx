import { Badge } from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import { ReactNode, useMemo } from 'react';
import { useRootStore } from 'src/store/root';
import shallow from 'zustand/shallow';

import { Avatar, AvatarProps } from './Avatar';

type ConnectedUserAvatarProps = {
  badge?: ReactNode;
  invisibleBadge?: boolean;
  avatarProps?: AvatarProps;
};

export const ConnectedUserAvatar: React.FC<ConnectedUserAvatarProps> = ({
  badge,
  invisibleBadge = true,
  avatarProps = {},
}) => {
  const { defaultDomain, address, loading } = useRootStore(
    (state) => ({
      defaultDomain: state.defaultDomain,
      address: state.account,
      loading: state.domainsLoading,
    }),
    shallow
  );
  const fallbackImage = useMemo(() => (address ? makeBlockie(address) : undefined), [address]);
  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={badge}
      invisible={invisibleBadge || loading}
    >
      <Avatar
        image={defaultDomain?.avatar}
        fallbackImage={fallbackImage}
        {...avatarProps}
        loading={loading}
      />
    </Badge>
  );
};
