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
  username?: string | null;
  link?: string;
  iconSize?: number;
  funnel?: string;
}

export const UserNameText: React.FC<UserNameTextProps> = ({
  addressCompactMode = CompactMode.SM,
  domainCompactMode = CompactMode.LG,
  loading,
  domainName,
  username,
  address,
  link,
  iconSize = 16,
  funnel,
  ...rest
}) => {
  // Decide what to show: username > domainName > address
  const displayLabel = username ?? domainName ?? address;

  // If we're showing a username or domain, use the "domain" compact mode
  const usingDomainStyle = Boolean(username || domainName);
  const compactMode = usingDomainStyle ? domainCompactMode : addressCompactMode;

  // If it's a domain or username and it's long-ish, compact it
  const isLong = displayLabel.length > 18;
  const shouldCompact = usingDomainStyle ? isLong : true;

  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CompactableTypography
        compactMode={compactMode}
        compact={shouldCompact}
        loading={loading}
        {...rest}
      >
        {displayLabel}
      </CompactableTypography>

      {link && (
        <DarkTooltip title="View on Etherscan">
          <Link
            href={link}
            target="_blank"
            sx={{ display: 'flex' }}
            onClick={() =>
              trackEvent(GENERAL.EXTERNAL_LINK, {
                funnel,
                Link: 'Etherscan',
              })
            }
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
