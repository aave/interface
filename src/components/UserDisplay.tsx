import { Box, TypographyProps } from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import { useMemo } from 'react';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import shallow from 'zustand/shallow';

import { Avatar, AvatarProps } from './Avatar';
import { BadgeSize, ExclamationBadge } from './badges/ExclamationBadge';
import { UserNameText, UserNameTextProps } from './ConnectedUserName';

type UserDisplayProps = {
  oneLiner?: boolean;
  avatarProps?: AvatarProps;
  titleProps?: Omit<UserNameTextProps, 'address' | 'domainName'>;
  subtitleProps?: Omit<UserNameTextProps, 'address' | 'domainName'>;
};

export const UserDisplay: React.FC<UserDisplayProps> = ({
  oneLiner = false,
  avatarProps,
  titleProps,
  subtitleProps,
}) => {
  const { account, defaultDomain, domainsLoading, accountLoading } = useRootStore(
    (state) => ({
      account: state.account,
      defaultDomain: state.defaultDomain,
      domainsLoading: state.domainsLoading,
      accountLoading: state.accountLoading,
    }),
    shallow
  );
  const { readOnlyMode } = useWeb3Context();
  const fallbackImage = useMemo(() => (account ? makeBlockie(account) : undefined), [account]);
  const loading = domainsLoading || accountLoading;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        fallbackImage={fallbackImage}
        loading={loading}
        badge={<ExclamationBadge size={BadgeSize.SM} />}
        invisibleBadge={!readOnlyMode}
        {...avatarProps}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {!oneLiner && defaultDomain?.name ? (
          <>
            <UserNameText
              address={account}
              loading={loading}
              domainName={defaultDomain.name}
              variant="h4"
              {...titleProps}
            />
            <UserNameText
              address={account}
              loading={loading}
              variant="caption"
              {...subtitleProps}
            />
          </>
        ) : (
          <UserNameText address={account} loading={loading} variant="h4" {...titleProps} />
        )}
      </Box>
    </Box>
  );
};

interface ExternalUserDisplayProps {
  avatarProps?: AvatarProps;
  titleProps?: TypographyProps;
  address: string;
}

export const ExternalUserDisplay: React.FC<ExternalUserDisplayProps> = ({
  avatarProps,
  titleProps,
  address,
}) => {
  const { name, avatar } = useGetEns(address);

  const fallbackImage = useMemo(() => (address ? makeBlockie(address) : undefined), [address]);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar image={avatar} fallbackImage={fallbackImage} {...avatarProps} />
      <UserNameText variant="h4" address={address} domainName={name} {...titleProps} />
    </Box>
  );
};
