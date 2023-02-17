import { TypographyProps } from '@mui/material';
import { useRootStore } from 'src/store/root';
import shallow from 'zustand/shallow';

import { CompactableTypography } from './CompactableTypography';

enum AddressCompactMode {
  SM,
  MD,
  LG,
}

enum DomainCompactMode {
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

interface ConnectedUserNameProps extends TypographyProps {
  addressCompactMode?: AddressCompactMode;
  domainCompactMode?: DomainCompactMode;
  compact?: boolean;
}

export const ConnectedUserNameText: React.FC<ConnectedUserNameProps> = ({
  addressCompactMode = AddressCompactMode.SM,
  domainCompactMode = DomainCompactMode.LG,
  compact = false,
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

  return (
    <CompactableTypography
      {...rest}
      from={domainName ? selectedDomainCompactMode.from : selectedAddressCompactMode.from}
      to={domainName ? selectedDomainCompactMode.from : selectedAddressCompactMode.to}
      compact={compact && shouldCompact}
      loading={domainsLoading || accountLoading}
      skeletonWidth={100}
    >
      {domainName || account}
    </CompactableTypography>
  );
};
