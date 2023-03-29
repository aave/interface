import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Box, Link, SvgIcon, TypographyProps } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { CompactableTypography, CompactMode } from './CompactableTypography';
import { DarkTooltip } from './infoTooltips/DarkTooltip';

export interface UserNameTextProps extends TypographyProps {
  addressCompactMode?: CompactMode;
  domainCompactMode?: CompactMode;
  domainName?: string;
  loading?: boolean;
  address: string;
  link?: string;
  iconSize?: number;
  funnel?: string;
}

export const UserNameText: React.FC<UserNameTextProps> = ({
  addressCompactMode = CompactMode.SM,
  domainCompactMode = CompactMode.LG,
  loading,
  domainName,
  address,
  link,
  iconSize = 16,
  funnel,
  ...rest
}) => {
  const isDomainNameLong = Boolean(domainName && domainName?.length > 18);

  const shouldCompact = !domainName || isDomainNameLong;
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CompactableTypography
        compactMode={domainName ? domainCompactMode : addressCompactMode}
        compact={shouldCompact}
        loading={loading}
        {...rest}
      >
        {domainName ? domainName : address}
      </CompactableTypography>
      {link && (
        <DarkTooltip title="View on Etherscan">
          <Link
            href={link}
            target="_blank"
            sx={{ display: 'flex' }}
            onClick={() => trackEvent(GENERAL.ETHERSCAN_LINK, { funnel: funnel })}
          >
            <SvgIcon sx={{ fontSize: iconSize }}>
              <ExternalLinkIcon />
            </SvgIcon>
          </Link>
        </DarkTooltip>
      )}
    </Box>
  );
};
