import { Trans } from '@lingui/macro';
import { GitHub, Twitter } from '@mui/icons-material';
import { Box, styled, SvgIcon, Typography } from '@mui/material';
import { Link } from 'src/components/primitives/Link';

import DiscordIcon from '/public/icons/discord.svg';
import LensLogoIcon from '/public/icons/lens-logo.svg';

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.muted,
  '&:hover': {
    color: theme.palette.text.primary,
  },
  display: 'flex',
  alignItems: 'center',
}));

const FOOTER_LINKS = [
  {
    href: '',
    label: <Trans>Terms</Trans>,
    key: 'Terms',
  },
  {
    href: '',
    label: <Trans>Privacy</Trans>,
    key: 'Privacy',
  },
  {
    href: '',
    label: <Trans>Docs</Trans>,
    key: 'Docs',
  },
  {
    href: '',
    label: <Trans>FAQS</Trans>,
    key: 'FAQS',
  },
  {
    href: '',
    label: <Trans>Send feedback</Trans>,
    key: 'Send feedback',
  },
];

const FOOTER_ICONS = [
  {
    href: '',
    icon: <LensLogoIcon />,
    title: 'Twitter',
  },
  {
    href: '',
    icon: <Twitter />,
    title: 'Lens',
  },
  {
    href: '',
    icon: <DiscordIcon />,
    title: 'Discord',
  },
  {
    href: '',
    icon: <GitHub />,
    title: 'Github',
  },
];

export function AppFooter() {
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
