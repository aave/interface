import { Trans } from '@lingui/macro';
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { SxProps, Theme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
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
interface RouteCampaigns {
  [route: string]: CampaignConfig;
}
interface TopBarNotifyProps {
  campaigns: NetworkCampaigns;
  routeCampaigns?: RouteCampaigns;
  /**
   * Showcase/preview mode (e.g. /dev/components): force the banner visible regardless of the
   * per-chain localStorage dismissal state, skip persisting any dismissal, and fall back to the
   * first configured campaign when none matches the current chain. Never set in production.
   */
  preview?: boolean;
}

export default function TopBarNotify({
  campaigns,
  routeCampaigns,
  preview = false,
}: TopBarNotifyProps) {
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));
  const router = useRouter();

  const currentChainId = useRootStore((store) => store.currentChainId);
  const mobileDrawerOpen = useRootStore((state) => state.mobileDrawerOpen);

  const getCurrentCampaign = (): CampaignConfig | null => {
    return campaigns[currentChainId] || null;
  };

  const currentCampaign =
    routeCampaigns?.[router.pathname] ??
    getCurrentCampaign() ??
    (preview ? Object.values(campaigns)[0] ?? null : null);

  const [showWarning, setShowWarning] = useState(() => {
    if (!currentCampaign) return false;
    if (preview) return true;

    const storedBannerVersion = localStorage.getItem(`bannerVersion_${currentChainId}`);
    const warningBarOpen = localStorage.getItem(`warningBarOpen_${currentChainId}`);

    if (storedBannerVersion !== currentCampaign.bannerVersion) {
      return true;
    }

    return warningBarOpen !== 'false';
  });

  useEffect(() => {
    if (!currentCampaign || preview) return;

    const storedBannerVersion = localStorage.getItem(`bannerVersion_${currentChainId}`);

    if (storedBannerVersion !== currentCampaign.bannerVersion) {
      localStorage.setItem(`bannerVersion_${currentChainId}`, currentCampaign.bannerVersion);
      localStorage.setItem(`warningBarOpen_${currentChainId}`, 'true');
      setShowWarning(true);
    }
  }, [currentCampaign, currentChainId, preview]);

  // If no campaign is configured for the current network, don't show anything
  if (!currentCampaign) {
    return null;
  }

  const handleClose = () => {
    if (!preview) {
      localStorage.setItem(`warningBarOpen_${currentChainId}`, 'false');
    }
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
      // break;
    }
  };

  // Note: hide warnings when mobile menu is open
  if (mobileDrawerOpen && !preview) return null;

  // Resolve the single call-to-action. A URL action becomes a real external <Link> (proper anchor
  // semantics; the primitive adds target=_blank + rel=noopener); any other action type — or a
  // function-style learnMoreLink — falls back to a click handler.
  const { buttonAction, learnMoreLink } = currentCampaign;
  const ctaHref =
    buttonAction?.type === 'url'
      ? buttonAction.value
      : typeof learnMoreLink === 'string'
      ? learnMoreLink
      : undefined;
  const ctaOnClick =
    buttonAction && buttonAction.type !== 'url'
      ? handleButtonAction
      : typeof learnMoreLink === 'function'
      ? learnMoreLink
      : undefined;
  const ctaLabel = currentCampaign.buttonText ?? 'Learn more';
  const showCta = Boolean(ctaHref || ctaOnClick);

  // "Try it out" text link — purple-2, Base type, with the arrow 0.25rem after the label. Shared
  // by both the <Link> (URL) and <Button> (handler) render paths.
  const ctaSx: SxProps<Theme> = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    minWidth: 'auto',
    p: 0,
    color: 'purple-2',
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1,
    textTransform: 'none',
    textDecoration: 'underline',
    textDecorationColor: 'transparent',
    transition: 'text-decoration-color 100ms ease',
    '&:hover': { textDecorationColor: 'inherit', backgroundColor: 'transparent' },
  };

  // Label + trailing arrow, shared by the <Link> (URL) and <Button> (handler) render paths.
  const ctaInner = (
    <>
      <Trans>{ctaLabel}</Trans>
      <ArrowUpRightIcon sx={{ fontSize: '1rem' }} />
    </>
  );

  if (showWarning) {
    return (
      <AppBar
        component="header"
        position="static"
        sx={{
          bgcolor: 'bgp-1',
          color: 'fg-1',
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'border-0',
          boxShadow: 'none',
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.38rem',
            width: '100%',
            px: 6,
          }}
        >
          <Typography
            component="div"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              textAlign: 'center',
              color: 'fg-1',
              fontSize: '0.875rem',
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            <Trans>{currentCampaign.notifyText}</Trans>

            {currentCampaign.customIcon ? currentCampaign.customIcon : null}

            {currentCampaign.icon && !sm ? (
              <MarketLogo sx={{ ml: 2 }} size={28} logo={currentCampaign.icon} />
            ) : null}
          </Typography>

          {showCta ? (
            ctaHref ? (
              <Link href={ctaHref} sx={ctaSx}>
                {ctaInner}
              </Link>
            ) : (
              <Button onClick={ctaOnClick} disableRipple sx={ctaSx}>
                {ctaInner}
              </Button>
            )
          ) : null}

          <IconButton
            onClick={handleClose}
            aria-label="Dismiss notification"
            size="small"
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'fg-1',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }
  return null;
}
