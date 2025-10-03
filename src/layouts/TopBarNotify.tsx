import { Trans } from '@lingui/macro';
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { Link } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';

export type ButtonAction =
  | { type: 'url'; value: string; target?: '_blank' | '_self' }
  | { type: 'function'; value: () => void }
  | { type: 'route'; value: string }
  | { type: 'modal'; value: string; params?: Record<string, unknown> };

interface CampaignConfig {
  notifyText: ReactNode;
  learnMoreLink?: string | (() => void);
  buttonText?: string;
  buttonAction?: ButtonAction;
  bannerVersion: string;
  icon?: string;
  customIcon?: ReactNode;
}

interface NetworkCampaigns {
  [chainId: number]: CampaignConfig;
}

interface TopBarNotifyProps {
  campaigns: NetworkCampaigns;
}

export default function TopBarNotify({ campaigns }: TopBarNotifyProps) {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const sm = useMediaQuery(breakpoints.down('sm'));
  const router = useRouter();

  const currentChainId = useRootStore((store) => store.currentChainId);
  const mobileDrawerOpen = useRootStore((state) => state.mobileDrawerOpen);

  const getCurrentCampaign = (): CampaignConfig | null => {
    return campaigns[currentChainId] || null;
  };

  const currentCampaign = getCurrentCampaign();

  const [showWarning, setShowWarning] = useState(false);

  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    if (!currentCampaign) {
      setShowWarning(false);
      setSlideIn(false);
      return;
    }

    const storedBannerVersion = localStorage.getItem(`bannerVersion_${currentChainId}`);
    const warningBarOpen = localStorage.getItem(`warningBarOpen_${currentChainId}`);

    // Check if this is a new banner version for this chain
    if (storedBannerVersion !== currentCampaign.bannerVersion) {
      localStorage.setItem(`bannerVersion_${currentChainId}`, currentCampaign.bannerVersion);
      localStorage.setItem(`warningBarOpen_${currentChainId}`, 'true');
      setShowWarning(true);
    } else {
      // Use stored preference for this chain
      setShowWarning(warningBarOpen !== 'false');
    }
  }, [currentCampaign, currentChainId]);

  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => {
        setSlideIn(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setSlideIn(false);
    }
  }, [showWarning]);

  // If no campaign is configured for the current network, don't show anything
  if (!currentCampaign) {
    return null;
  }

  const handleClose = () => {
    setSlideIn(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      localStorage.setItem(`warningBarOpen_${currentChainId}`, 'false');
      setShowWarning(false);
    }, 300); // Match MUI Slide animation duration
  };

  const handleButtonAction = () => {
    if (!currentCampaign.buttonAction) return;

    switch (currentCampaign.buttonAction.type) {
      case 'url':
        if (currentCampaign.buttonAction.target === '_blank') {
          window.open(currentCampaign.buttonAction.value, '_blank');
        } else {
          window.location.href = currentCampaign.buttonAction.value;
        }
        break;
      case 'function':
        currentCampaign.buttonAction.value();
        break;
      case 'route':
        router.push(currentCampaign.buttonAction.value);
        break;
        // case 'modal':
        //   console.log(
        //     'Modal action:',
        //     currentCampaign.buttonAction.value,
        //     currentCampaign.buttonAction.params
        //   );
        break;
    }
  };

  // Note: hide warnings when mobile menu is open
  if (mobileDrawerOpen) return null;

  if (showWarning) {
    return (
      <Slide direction="down" in={slideIn} timeout={300}>
        <AppBar
          component="header"
          sx={{
            padding: `8px, 12px, 8px, 12px`,
            background: slideIn
              ? (theme) => theme.palette.gradients.newGradient
              : (theme) => theme.palette.background.header,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 0,
            transition: 'background 0.3s ease-in-out, color 0.3s ease-in-out',
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
                <Trans>{currentCampaign.notifyText}</Trans>

                {currentCampaign.customIcon ? currentCampaign.customIcon : null}

                {currentCampaign.icon && !sm ? (
                  <MarketLogo sx={{ ml: 2 }} size={28} logo={currentCampaign.icon} />
                ) : (
                  ''
                )}

                {currentCampaign.learnMoreLink && md ? (
                  typeof currentCampaign.learnMoreLink === 'string' ? (
                    <Link
                      sx={{
                        color: 'inherit',
                        textDecoration: 'underline',
                        paddingLeft: 2,
                        transition: 'color 0.3s ease-in-out',
                      }}
                      href={currentCampaign.learnMoreLink}
                    >
                      <Trans>
                        {currentCampaign.buttonText ? currentCampaign.buttonText : `Learn more`}
                      </Trans>
                    </Link>
                  ) : (
                    <Button
                      sx={{
                        color: 'inherit',
                        textDecoration: 'underline',
                        paddingLeft: 2,
                        background: 'none',
                        textTransform: 'none',
                        minWidth: 'auto',
                        padding: 0,
                        marginLeft: 2,
                        transition: 'color 0.3s ease-in-out',
                      }}
                      onClick={currentCampaign.learnMoreLink}
                    >
                      <Trans>
                        {currentCampaign.buttonText ? currentCampaign.buttonText : `Learn more`}
                      </Trans>
                    </Button>
                  )
                ) : null}
              </Typography>
            </Box>

            <Box>
              {!md && currentCampaign.buttonText && currentCampaign.buttonAction ? (
                <Button
                  size="small"
                  onClick={handleButtonAction}
                  sx={{
                    minWidth: '90px',
                    marginLeft: 5,
                    height: '24px',
                    background: '#383D51',
                    color: '#EAEBEF',
                  }}
                >
                  <Trans>{currentCampaign.buttonText}</Trans>
                </Button>
              ) : null}
            </Box>
            <Button
              sx={{
                color: 'inherit',
                paddingRight: 0,
                transition: 'color 0.3s ease-in-out',
              }}
              onClick={handleClose}
              startIcon={<CloseIcon />}
            />
          </Toolbar>
        </AppBar>
      </Slide>
    );
  }
  return null;
}
