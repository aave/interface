import { Trans } from '@lingui/macro';
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ReactNode, useEffect, useState } from 'react';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { Link } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';

interface TopBarNotifyProps {
  notifyText: ReactNode;
  learnMoreLink?: string;
  buttonText?: string;
  bannerVersion: string;
  icon?: string;
}

export default function TopBarNotify({
  notifyText,
  learnMoreLink,
  buttonText,
  bannerVersion,
  icon,
}: TopBarNotifyProps) {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const sm = useMediaQuery(breakpoints.down('sm'));

  const [showWarning, setShowWarning] = useState(true);

  const [mobileDrawerOpen] = useRootStore((state) => [state.mobileDrawerOpen]);

  useEffect(() => {
    const storedBannerVersion = localStorage.getItem('bannerVersion');
    const warningBarOpen = localStorage.getItem('warningBarOpen');

    if (storedBannerVersion !== bannerVersion) {
      localStorage.setItem('bannerVersion', bannerVersion);
      setShowWarning(true);
      localStorage.setItem('warningBarOpen', 'true');
    } else if (warningBarOpen === 'false') {
      setShowWarning(false);
    }
  }, [bannerVersion]);

  const handleClose = () => {
    localStorage.setItem('warningBarOpen', 'false');
    setShowWarning(false);
  };

  // Note: hide warnings when mobile menu is open
  if (mobileDrawerOpen) return null;

  if (showWarning) {
    return (
      <AppBar
        component="header"
        sx={{
          padding: `8px, 12px, 8px, 12px`,
          background: (theme) => theme.palette.gradients.newGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 0,
        }}
        position="static"
      >
        <Toolbar
          sx={{
            display: 'flex',
            paddingRight: md ? 0 : '',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
          variant="dense"
        >
          <Box sx={{ padding: md ? '20px 10px' : '', paddingRight: 0 }}>
            <Typography
              sx={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}
              component="div"
            >
              <Trans>{notifyText}</Trans>

              {icon && !sm ? <MarketLogo sx={{ ml: 2 }} size={32} logo={icon} /> : ''}

              {learnMoreLink && md ? (
                <Link
                  sx={{ color: 'white', textDecoration: 'underline', paddingLeft: 2 }}
                  // target={'_blank'} Todo option to pass as prop
                  href={learnMoreLink}
                >
                  <Trans>{buttonText ? buttonText : `Learn more`}</Trans>
                </Link>
              ) : null}
            </Typography>
          </Box>
          <Box>
            {!md && learnMoreLink ? (
              <Button
                component="a"
                // target={'_blank'} Todo option to pass as prop
                size="small"
                href={learnMoreLink}
                sx={{
                  minWidth: '90px',
                  marginLeft: 5,
                  height: '24px',
                  background: '#383D51',
                  color: '#EAEBEF',
                }}
              >
                <Trans> {buttonText ? buttonText.toUpperCase() : `LEARN MORE`}</Trans>
              </Button>
            ) : null}
          </Box>
          <Button
            sx={{ color: 'white', paddingRight: 0 }}
            onClick={handleClose}
            startIcon={<CloseIcon />}
          />
        </Toolbar>
      </AppBar>
    );
  }
  return null;
}
