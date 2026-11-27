import { t } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { AvatarSize } from 'src/components/Avatar';
import { CloseIcon } from 'src/components/icons/CloseIcon';
import { Link } from 'src/components/primitives/Link';
import { UserDisplay } from 'src/components/UserDisplay';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { iconButtonSx } from 'src/utils/buttonStyles';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

/** Width of the flow's single column, side padding included. */
export const FLOW_COLUMN_WIDTH = '35rem';

interface FlowLayoutProps {
  /** Where the close button leaves to: the page the flow was started from. */
  closeHref: string;
  children: ReactNode;
}

/**
 * Full-page shell for a focused, multi-step flow. It replaces the app header and footer with a
 * bar that only holds the way out and the wallet, over one centred column.
 *
 *   Page.getLayout = (page) => <FlowLayout closeHref={ROUTES.migrationToolV4}>{page}</FlowLayout>;
 */
export function FlowLayout({ closeHref, children }: FlowLayoutProps) {
  const { readOnlyMode } = useWeb3Context();
  const { openReadMode } = useModalContext();

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '1.125rem 1rem',
          bgcolor: 'bg-1',
        }}
      >
        <Button
          component={Link}
          href={closeHref}
          variant="outlined"
          aria-label={t`Close`}
          sx={iconButtonSx}
        >
          <CloseIcon sx={{ fontSize: '1.25rem' }} />
        </Button>

        {readOnlyMode ? (
          <Button variant="outlined" onClick={() => openReadMode()}>
            <UserDisplay
              avatarProps={{ size: AvatarSize.SM }}
              oneLiner={true}
              titleProps={{ variant: 'buttonM' }}
            />
          </Button>
        ) : (
          <ConnectWalletButton />
        )}
      </Box>

      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          width: '100%',
          maxWidth: FLOW_COLUMN_WIDTH,
          mx: 'auto',
          p: '3rem 1rem 5rem',
        }}
      >
        {children}
      </Box>

      {FORK_ENABLED ? null : <AnalyticsConsent />}
    </>
  );
}
