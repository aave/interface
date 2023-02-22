import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Box, Link, SvgIcon, TypographyProps } from '@mui/material';

import { CompactableTypography, CompactMode } from './CompactableTypography';

export interface UserNameTextProps extends TypographyProps {
  addressCompactMode?: CompactMode;
  domainCompactMode?: CompactMode;
  domainName?: string;
  loading?: boolean;
  address: string;
  link?: string;
  iconSize?: number;
}

export const UserNameText: React.FC<UserNameTextProps> = ({
  addressCompactMode = CompactMode.SM,
  domainCompactMode = CompactMode.LG,
  loading,
  domainName,
  address,
  link,
  iconSize = 16,
  ...rest
}) => {
  const isDomainNameLong = Boolean(domainName && domainName?.length > 18);

  const shouldCompact = !domainName || isDomainNameLong;

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
        <Link href={link} target="_blank" sx={{ display: 'flex' }}>
          <SvgIcon sx={{ fontSize: iconSize }}>
            <ExternalLinkIcon />
          </SvgIcon>
        </Link>
      )}
    </Box>
  );
};
