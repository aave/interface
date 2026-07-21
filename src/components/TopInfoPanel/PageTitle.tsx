import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { FAVOURITE_STAR_COLOR, StarIcon } from 'src/components/icons/StarIcon';
import { figVars } from 'src/utils/figmaColors';

import { useRootStore } from '../../store/root';
import { selectIsMigrationAvailable } from '../../store/v3MigrationSelectors';
import { NetworkConfig } from '../../ui-config/networksConfig';
// import { BridgeButton } from '../BridgeButton';
import { MarketSwitcher } from '../MarketSwitcher';
import { Link, ROUTES } from '../primitives/Link';

export interface PageTitleProps extends Pick<NetworkConfig, 'bridge'> {
  pageTitle?: ReactNode;
  withMarketSwitcher?: boolean;
  withMigrateButton?: boolean;
  withFavoriteButton?: boolean;
}

export const PageTitle = ({
  pageTitle,
  withMarketSwitcher,
  withMigrateButton,
  withFavoriteButton,
}: PageTitleProps) => {
  const isMigrateToV3Available = useRootStore((state) => selectIsMigrationAvailable(state));
  const currentMarket = useRootStore((state) => state.currentMarket);
  const isFavoriteMarket = useRootStore((state) => state.isFavoriteMarket);
  const toggleFavoriteMarket = useRootStore((state) => state.toggleFavoriteMarket);
  // Subscribe to favoriteMarkets to trigger re-renders when favorites change
  useRootStore((state) => state.favoriteMarkets);

  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  // const upToMD = useMediaQuery(theme.breakpoints.up('md'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const isCurrentMarketFavorite = isFavoriteMarket(currentMarket);

  const handleFavoriteClick = () => {
    toggleFavoriteMarket(currentMarket);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', xsm: 'center' },
        mb: pageTitle ? 4 : 0,
        flexDirection: { xs: 'column', xsm: 'row' },
        boxShadow: `inset 0px -1px 0px ${figVars['border-0']}`,
      }}
    >
      {pageTitle && (downToXSM || !withMarketSwitcher) && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography
            variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'}
            sx={{
              color: withMarketSwitcher ? 'fg-3' : 'text.white',
              mr: { xs: 5, xsm: 3 },
              mb: { xs: 1, xsm: 0 },
            }}
          >
            {pageTitle}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: !pageTitle ? 4 : 0,
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {withMarketSwitcher && <MarketSwitcher />}
          {/* <BridgeButton bridge={bridge} variant="outlined" withoutIcon={!upToMD} /> */}
          {/* NOTE:// Removing for now  */}
          {isMigrateToV3Available && withMigrateButton && (
            <Link href={ROUTES.migrationTool} sx={{ mt: { xs: 2, xsm: 0 } }}>
              <Button variant="contained" size="small">
                <Trans>Migrate to V3</Trans>
              </Button>
            </Link>
          )}
        </Box>

        {withFavoriteButton && (
          <Button
            onClick={handleFavoriteClick}
            variant="outlined"
            sx={{
              display: 'none',
              [theme.breakpoints.up(800)]: { display: 'flex' }, // Hide on mobile (xs) and for widths between 759px and 800px, show on small screens and up
              minWidth: 'unset',
              gap: 2,
              alignItems: 'center',
            }}
            aria-label="Favorite tool"
          >
            <Typography component="span" typography="subheader1" sx={{ fontWeight: 500 }}>
              {isCurrentMarketFavorite ? (
                <Trans>Favourited</Trans>
              ) : (
                <Trans>Add to Favourites</Trans>
              )}
            </Typography>

            <StarIcon
              sx={{
                fontSize: '18px',
                color: isCurrentMarketFavorite ? FAVOURITE_STAR_COLOR : 'fg-4',
              }}
            />
          </Button>
        )}
      </Box>
    </Box>
  );
};
