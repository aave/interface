import { Box } from '@mui/material';
import { blo } from 'blo';
import { useMemo } from 'react';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { Avatar, AvatarProps } from './Avatar';
import { BadgeSize, ExclamationBadge } from './badges/ExclamationBadge';
import { UserNameText, UserNameTextProps } from './UserNameText';
import { useInfinexUser } from '@connect-poc/sdk';

type UserDisplayProps = {
  oneLiner?: boolean;
  avatarProps?: AvatarProps;
  titleProps?: Omit<UserNameTextProps, 'address' | 'domainName'>;
  subtitleProps?: Omit<UserNameTextProps, 'address' | 'domainName'>;
  withLink?: boolean;
  funnel?: string;
};

export const UserDisplay: React.FC<UserDisplayProps> = ({
  oneLiner = false,
  avatarProps,
  titleProps,
  subtitleProps,
  withLink,
  funnel,
}) => {
  const [account, defaultDomain, domainsLoading] = useRootStore(
    useShallow((state) => [state.account, state.defaultDomain, state.domainsLoading])
  );
  const { readOnlyMode } = useWeb3Context();
  const { user } = useInfinexUser();

  const fallbackImage = useMemo(
    () => (account ? blo(account as `0x${string}`) : undefined),
    [account]
  );
  const loading = domainsLoading;

  const infinexAvatar = user?.username
    ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzU3IiBoZWlnaHQ9IjM1NyIgdmlld0JveD0iMCAwIDM1NyAzNTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjguMDU1NTgiIHk9IjguMjUwOSIgd2lkdGg9IjM0MC45MDUiIGhlaWdodD0iMzQwLjkwNSIgcng9IjUwLjc3NDIiIGZpbGw9IiMxNTE2MTkiLz4KPHJlY3QgeD0iOC4wNTU1OCIgeT0iOC4yNTA5IiB3aWR0aD0iMzQwLjkwNSIgaGVpZ2h0PSIzNDAuOTA1IiByeD0iNTAuNzc0MiIgZmlsbD0idXJsKCNwYWludDBfcmFkaWFsXzZfMzEyNSkiLz4KPHBhdGggZD0iTTIxMy42MjQgMTUwLjc0OVYyNDguMjA1SDk1LjEwNzhWMTA5LjIwNUgxMjcuODQ0VjEzMS43NkgxMTcuODQ5VjIyNi42MDRIMTkwLjg4NFYxNTAuNzQ5SDIxMy42MjRaIiBmaWxsPSIjRkU2RjM5Ii8+CjxwYXRoIGQ9Ik0yNjEuOTA5IDEwOS4yMDVWMjQ4LjIwNUgyMjkuMTczVjIyNi42MDRIMjM5LjE2OFYxMzAuODA2SDE2Ni4wOFYyMDYuNjYxSDE0My4zMzlWMTA5LjIwNUgyNjEuOTA5WiIgZmlsbD0iI0ZFNkYzOSIvPgo8ZGVmcz4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDBfcmFkaWFsXzZfMzEyNSIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgxNy40OTk1IDE2LjA4MzEpIHNjYWxlKDMyNS40MDcgMzM3LjM4NikiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMkQzMDM2Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzE4MTkxRCIvPgo8L3JhZGlhbEdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo='
    : undefined;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        fallbackImage={fallbackImage}
        image={infinexAvatar ?? defaultDomain?.avatar}
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
              link={withLink ? `https://etherscan.io/address/${account}` : undefined}
              funnel={funnel}
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
          <UserNameText
            address={account}
            username={user?.username}
            domainName={defaultDomain?.name}
            loading={loading}
            variant="h4"
            link={withLink ? `https://etherscan.io/address/${account}` : undefined}
            funnel={funnel}
            {...titleProps}
          />
        )}
      </Box>
    </Box>
  );
};

interface ExternalUserDisplayProps {
  avatarProps?: AvatarProps;
  titleProps?: Omit<UserNameTextProps, 'address'>;
  address: string;
}

export const ExternalUserDisplay: React.FC<ExternalUserDisplayProps> = ({
  avatarProps,
  titleProps,
  address,
}) => {
  const { name, avatar } = useGetEns(address);

  const fallbackImage = useMemo(
    () => (address ? blo(address as `0x${string}`) : undefined),
    [address]
  );
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar image={avatar} fallbackImage={fallbackImage} {...avatarProps} />
      <UserNameText
        variant="h4"
        address={address}
        domainName={name}
        link={`https://etherscan.io/address/${address}`}
        iconSize={14}
        {...titleProps}
        funnel={'Delegation power panel: Governance'}
      />
    </Box>
  );
};
