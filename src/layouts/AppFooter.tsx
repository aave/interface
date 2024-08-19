import { Trans } from '@lingui/macro';
import { Box, Container, styled, SvgIcon, Typography } from '@mui/material';
import { Link } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';

import DiscordIcon from '/public/icons/discord.svg';
import GithubIcon from '/public/icons/github.svg';
import TwitterIcon from '/public/icons/twitter.svg';
import XIcon from '/public/icons/x.svg';

interface StyledLinkProps {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const StyledLink = styled(Link)<StyledLinkProps>(({ theme }) => ({
  color: theme.palette.text.mainTitle,
  '&:hover': {
    color: theme.palette.primary.main,
  },
  display: 'flex',
  alignItems: 'center',
  transition: '0.3s',
}));

const FOOTER_ICONS = [
  {
    href: 'https://hey.xyz/u/aave',
    icon: <TwitterIcon />,
    title: 'Twitter',
  },
  {
    href: 'https://twitter.com/aave',
    icon: <XIcon />,
    title: 'X',
  },
  {
    href: 'https://github.com/aave',
    icon: <GithubIcon />,
    title: 'Github',
  },
  {
    href: 'https://discord.com/invite/aave',
    icon: <DiscordIcon />,
    title: 'Discord',
  },
];

export function AppFooter() {
  const [_, setFeedbackOpen] = useRootStore((store) => [
    store.setAnalyticsConfigOpen,
    store.setFeedbackOpen,
  ]);

  const FOOTER_LINKS = [
    {
      href: 'https://aave.com/term-of-use/',
      label: <Trans>Bug Bounty</Trans>,
      key: 'Terms',
    },
    {
      href: 'https://aave.com/privacy-policy/',
      label: <Trans>Forum</Trans>,
      key: 'Privacy',
    },
    {
      href: 'https://docs.aave.com/hub/',
      label: <Trans>Privacy Policy</Trans>,
      key: 'Docs',
    },
    {
      href: 'https://docs.aave.com/faq/',
      label: <Trans>Term of Conditions</Trans>,
      key: 'FAQS',
    },
    {
      href: 'https://discord.com/invite/aave',
      label: <Trans>Contact Us</Trans>,
      key: 'Send feedback',
      onClick: (event: React.MouseEvent) => {
        event.preventDefault();
        setFeedbackOpen(true);
      },
    },
    // {
    //   href: '/',
    //   label: <Trans>Manage analytics</Trans>,
    //   key: 'Manage analytics',
    //   onClick: (event: React.MouseEvent) => {
    //     event.preventDefault();
    //     setAnalyticsConfigOpen(true);
    //   },
    // },
  ];

  return (
    <Box sx={(theme) => ({ borderTop: `1px solid ${theme.palette.border.contents}` })}>
      <Container
        sx={{
          flex: 0,
          display: 'flex',
          paddingBlock: ['20px 40px', '20px 60px'],
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          flexDirection: ['column', 'column', 'row'],
        }}
      >
        <Box sx={{ display: 'flex', gap: { sm: 4, md: 6 }, alignItems: 'center' }}>
          {FOOTER_LINKS.map((link) => (
            <StyledLink onClick={link.onClick} key={link.key} href={link.href}>
              <Typography variant="h4">{link.label}</Typography>
            </StyledLink>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {FOOTER_ICONS.map((icon) => (
            <StyledLink href={icon.href} key={icon.title}>
              <SvgIcon
                sx={{
                  fontSize: [24, 24, 36],
                }}
              >
                {icon.icon}
              </SvgIcon>
            </StyledLink>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
