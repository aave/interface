import { TypographyProps } from '@mui/material';
import useGetEns from 'src/libs/hooks/use-get-ens';
import { useRootStore } from 'src/store/root';
import shallow from 'zustand/shallow';

import { CompactableTypography, CompactMode } from './CompactableTypography';

export interface UserNameTextProps extends TypographyProps {
  addressCompactMode?: CompactMode;
  domainCompactMode?: CompactMode;
  domainName?: string;
  loading?: boolean;
  address: string;
}

export const UserNameText: React.FC<UserNameTextProps> = ({
  addressCompactMode = CompactMode.SM,
  domainCompactMode = CompactMode.LG,
  loading,
  domainName,
  address,
  ...rest
}) => {
  const isDomainNameLong = Boolean(domainName && domainName?.length > 18);

  const shouldCompact = !domainName || isDomainNameLong;

  return (
    <CompactableTypography
      compactMode={domainName ? domainCompactMode : addressCompactMode}
      compact={shouldCompact}
      loading={loading}
      {...rest}
    >
      {domainName ? domainName : address}
    </CompactableTypography>
  );
};

export interface ConnectedUserNameProps extends TypographyProps {
  addressCompactMode?: CompactMode;
  domainCompactMode?: CompactMode;
}

export const ConnectedUserNameText: React.FC<ConnectedUserNameProps> = ({ ...props }) => {
  const { account, defaultDomain, domainsLoading, accountLoading } = useRootStore(
    (state) => ({
      account: state.account,
      defaultDomain: state.defaultDomain,
      domainsLoading: state.domainsLoading,
      accountLoading: state.accountLoading,
    }),
    shallow
  );

  return (
    <UserNameText
      address={account}
      domainName={defaultDomain?.name}
      loading={domainsLoading || accountLoading}
      {...props}
    />
  );
};

export interface ExternalUserNameTextProps extends TypographyProps {
  addressCompactMode?: CompactMode;
  domainCompactMode?: CompactMode;
  address: string;
}

export const ExternalUserNameText: React.FC<ExternalUserNameTextProps> = ({ address, ...rest }) => {
  const { name } = useGetEns(address);
  return <UserNameText address={address} domainName={name} {...rest} />;
};
