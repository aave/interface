import makeBlockie from 'ethereum-blockies-base64';
import { useMemo } from 'react';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useRootStore } from 'src/store/root';
import shallow from 'zustand/shallow';

import { Avatar, AvatarProps } from './Avatar';

export const ConnectedUserAvatar: React.FC<AvatarProps> = ({
  invisibleBadge = true,
  ...avatarProps
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
    <Avatar
      image={defaultDomain?.avatar}
      fallbackImage={fallbackImage}
      loading={loading}
      invisibleBadge={invisibleBadge}
      {...avatarProps}
    />
  );
};

export interface UserAvatar extends AvatarProps {
  address: string;
}

export const UserAvatar: React.FC<UserAvatar> = ({ address, ...avatarProps }) => {
  const { avatar } = useGetEns(address);
  const fallbackImage = useMemo(() => (address ? makeBlockie(address) : undefined), [address]);

  return <Avatar image={avatar} fallbackImage={fallbackImage} {...avatarProps} />;
};
