import { Trans } from '@lingui/macro';
import { GitHub, Twitter } from '@mui/icons-material';
import { Box, styled, SvgIcon, Typography } from '@mui/material';
import { Link } from 'src/components/primitives/Link';

import DiscordIcon from '/public/icons/discord.svg';

interface StyledLinkProps {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const StyledLink = styled(Link)<StyledLinkProps>(({ theme }) => ({
  color: theme.palette.text.muted,
  '&:hover': {
    color: theme.palette.text.primary,
  },
  display: 'flex',
  alignItems: 'center',
}));

const FOOTER_ICONS = [
  {
    href: 'https://twitter.com/mooncakefi?s=11&t=ZixFmUt1SIHLEMvx18gUGw',
    icon: <Twitter />,
    title: 'Twitter',
  },
  {
    href: 'https://discord.gg/fCcv8K6Uqy',
    icon: <DiscordIcon />,
    title: 'Discord',
  },
  {
    href: 'https://github.com/MooncakeFi',
    icon: <GitHub />,
    title: 'Github',
  },
];

export function AppFooter() {
  const FOOTER_LINKS = [
    {
      href: 'https://github.com/MooncakeFi',
      label: <Trans>Github</Trans>,
      key: 'Github',
    },
    {
      href: 'https://docs.mooncake.fi',
      label: <Trans>Documentation</Trans>,
      key: 'Docs',
    },
    {
      href: 'https://twitter.com/mooncakefi',
      label: <Trans>Twitter</Trans>,
      key: 'Twitter',
    },
  ];

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        padding: ['22px 0px 40px 0px', '0 22px 0 40px', '20px 22px'],
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '22px',
        flexDirection: ['column', 'column', 'row'],
        boxShadow:
          theme.palette.mode === 'light'
            ? 'inset 0px 1px 0px rgba(0, 0, 0, 0.04)'
            : 'inset 0px 1px 0px rgba(255, 255, 255, 0.12)',
      })}
    >
      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {FOOTER_LINKS.map((link) => (
          <StyledLink key={link.key} href={link.href}>
            <Typography variant="caption">{link.label}</Typography>
          </StyledLink>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {FOOTER_ICONS.map((icon) => (
          <StyledLink href={icon.href} key={icon.title}>
            <SvgIcon
              sx={{
                fontSize: [24, 24, 20],
              }}
            >
              {icon.icon}
            </SvgIcon>
          </StyledLink>
        ))}
      </Box>
    </Box>
  );
}
