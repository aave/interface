import { Trans } from '@lingui/macro';
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
    const chainIds = Object.keys(campaigns).map(Number);
    const firstChainId = chainIds[0];
    return firstChainId ? campaigns[firstChainId] || null : null;
  };

  const currentCampaign = getCurrentCampaign();
  const campaignChainId = currentCampaign
    ? Object.keys(campaigns)
        .map(Number)
        .find((chainId) => campaigns[chainId] === currentCampaign) || currentChainId
    : currentChainId;

  const [showWarning, setShowWarning] = useState(() => {
    if (!currentCampaign) return false;

    const storedBannerVersion = localStorage.getItem(`bannerVersion_${campaignChainId}`);
    const warningBarOpen = localStorage.getItem(`warningBarOpen_${campaignChainId}`);

    if (storedBannerVersion !== currentCampaign.bannerVersion) {
      return true;
    }

    return warningBarOpen !== 'false';
  });

  useEffect(() => {
    if (!currentCampaign) return;

    const storedBannerVersion = localStorage.getItem(`bannerVersion_${campaignChainId}`);

    if (storedBannerVersion !== currentCampaign.bannerVersion) {
      localStorage.setItem(`bannerVersion_${campaignChainId}`, currentCampaign.bannerVersion);
      localStorage.setItem(`warningBarOpen_${campaignChainId}`, 'true');
      setShowWarning(true);
    }
  }, [currentCampaign, campaignChainId]);

  // If no campaign is configured for the current network, don't show anything
  if (!currentCampaign) {
    return null;
  }

  const handleClose = () => {
    localStorage.setItem(`warningBarOpen_${campaignChainId}`, 'false');
    setShowWarning(false);
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
                    sx={{ color: 'white', textDecoration: 'underline', paddingLeft: 2 }}
                    href={currentCampaign.learnMoreLink}
                  >
                    <Trans>
                      {currentCampaign.buttonText ? currentCampaign.buttonText : `Learn more`}
                    </Trans>
                  </Link>
                ) : (
                  <Button
                    sx={{
                      color: 'white',
                      textDecoration: 'underline',
                      paddingLeft: 2,
                      background: 'none',
                      textTransform: 'none',
                      minWidth: 'auto',
                      padding: 0,
                      marginLeft: 2,
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
                <Trans>{currentCampaign.buttonText.toUpperCase()}</Trans>
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
