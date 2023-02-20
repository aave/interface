import { TypographyProps } from '@mui/material';
import { useRootStore } from 'src/store/root';
import shallow from 'zustand/shallow';

import { CompactableTypography } from './CompactableTypography';

export enum AddressCompactMode {
  SM,
  MD,
  LG,
}

export enum DomainCompactMode {
  LG,
}

const addressCompactModeMap = {
  [AddressCompactMode.SM]: {
    from: 4,
    to: 4,
  },
  [AddressCompactMode.MD]: {
    from: 7,
    to: 4,
  },
  [AddressCompactMode.LG]: {
    from: 12,
    to: 4,
  },
};

const domainCompactModeMap = {
  [DomainCompactMode.LG]: {
    from: 12,
    to: 3,
  },
};

export interface ConnectedUserNameProps extends TypographyProps {
  addressCompactMode?: AddressCompactMode;
  domainCompactMode?: DomainCompactMode;
  compact?: boolean;
  showDomain?: boolean;
}

export const ConnectedUserNameText: React.FC<ConnectedUserNameProps> = ({
  addressCompactMode = AddressCompactMode.SM,
  domainCompactMode = DomainCompactMode.LG,
  compact = false,
  showDomain = true,
  ...rest
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

  const domainName = defaultDomain?.name;
  const isDomainNameLong = Boolean(domainName && domainName?.length > 18);

  const shouldCompact = !domainName || isDomainNameLong;

  const selectedAddressCompactMode = addressCompactModeMap[addressCompactMode];
  const selectedDomainCompactMode = domainCompactModeMap[domainCompactMode];

  const domainMode = !!domainName && showDomain;

  return (
    <CompactableTypography
      {...rest}
      from={domainMode ? selectedDomainCompactMode.from : selectedAddressCompactMode.from}
      to={domainMode ? selectedDomainCompactMode.from : selectedAddressCompactMode.to}
      compact={compact && (shouldCompact || !domainMode)}
      loading={domainsLoading || accountLoading}
      skeletonWidth={100}
    >
      {domainMode ? domainName : account}
    </CompactableTypography>
  );
};
