import { Box } from '@mui/material';
import { blo } from 'blo';
import { useMemo } from 'react';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import shallow from 'zustand/shallow';

import { Avatar, AvatarProps } from './Avatar';
import { BadgeSize, ExclamationBadge } from './badges/ExclamationBadge';
import { UserNameText, UserNameTextProps } from './UserNameText';

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
  const { walletAddressTonWallet } = useTonConnectContext();
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
  const fallbackImage = useMemo(
    () => (account ? blo(account as `0x${string}`) : undefined),
    [account]
  );
  const loading = (domainsLoading || accountLoading) && !walletAddressTonWallet;

  const accountAddress = account || walletAddressTonWallet;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 0 }}>
      <Avatar
        fallbackImage={fallbackImage}
        loading={loading}
        badge={<ExclamationBadge size={BadgeSize.SM} />}
        invisibleBadge={!readOnlyMode}
        {...avatarProps}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        {!oneLiner && defaultDomain?.name ? (
          <>
            <UserNameText
              address={accountAddress}
              loading={loading}
              domainName={defaultDomain.name}
              variant="h4"
              link={withLink ? `https://etherscan.io/address/${accountAddress}` : undefined}
              funnel={funnel}
              {...titleProps}
            />
            <UserNameText
              address={accountAddress}
              loading={loading}
              variant="caption"
              {...subtitleProps}
            />
          </>
        ) : (
          <UserNameText
            address={accountAddress}
            domainName={defaultDomain?.name}
            loading={loading}
            variant="h4"
            link={withLink ? `https://etherscan.io/address/${accountAddress}` : undefined}
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
