import { Trans } from '@lingui/macro';
import { Box, BoxProps, Button, Paper, PaperProps } from '@mui/material';
import { ReactNode, useState } from 'react';
import { MinusIcon } from 'src/components/icons/MinusIcon';
import { useRootStore } from 'src/store/root';
import { DASHBOARD } from 'src/utils/events';

import { toggleLocalStorageClick } from '../../helpers/toggle-local-storage-click';

interface ListWrapperProps {
  titleComponent: ReactNode;
  localStorageName?: string;
  subTitleComponent?: ReactNode;
  subChildrenComponent?: ReactNode;
  topInfo?: ReactNode;
  children: ReactNode;
  withTopMargin?: boolean;
  noData?: boolean;
  wrapperSx?: BoxProps['sx'];
  tooltipOpen?: boolean;
  paperSx?: PaperProps['sx'];
  topInfoSx?: BoxProps['sx'];
  onCollapseChange?: (collapsed: boolean) => void;
  /** What the card hides — renders the toggle as "Hide {collapseLabel}" / "Show {collapseLabel}". */
  collapseLabel?: string;
}

export const ListWrapper = ({
  children,
  localStorageName,
  titleComponent,
  subTitleComponent,
  subChildrenComponent,
  topInfo,
  withTopMargin,
  noData,
  wrapperSx,
  tooltipOpen,
  paperSx,
  topInfoSx,
  onCollapseChange,
  collapseLabel,
}: ListWrapperProps) => {
  const [isCollapse, setIsCollapse] = useState(
    localStorageName ? localStorage.getItem(localStorageName) === 'true' : false
  );
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleTrackingEvents = () => {
    if (!isCollapse) {
      switch (localStorageName as string | boolean) {
        case 'borrowAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, {
            visibility: 'Hidden',
            type: 'Available Borrow Assets',
          });
          break;
        case 'borrowedAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, { visibility: 'Hidden', type: 'Borrowed Assets' });
          break;
        case 'supplyAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, {
            visibility: 'Hidden',
            type: 'Available Supply Assets',
          });
          break;
        case 'suppliedAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, { visibility: 'Hidden', type: 'Supplied Assets' });
        default:
          return null;
      }
    } else {
      switch (localStorageName as string | boolean) {
        case 'borrowAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, {
            visibility: 'Show',
            type: 'Available Borrow Assets',
          });
          break;
        case 'borrowedAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, { visibility: 'Show', type: 'Borrowed Assets' });
          break;
        case 'supplyAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, {
            visibility: 'Show',
            type: 'Available Supply Assets',
          });
          break;
        case 'suppliedAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, { visibility: 'Show', type: 'Supplied Assets' });
        default:
          return null;
      }
    }
  };

  const collapsed = isCollapse && !noData;

  const collapseText = collapsed ? (
    collapseLabel ? (
      <Trans>Show {collapseLabel}</Trans>
    ) : (
      <Trans>Show</Trans>
    )
  ) : collapseLabel ? (
    <Trans>Hide {collapseLabel}</Trans>
  ) : (
    <Trans>Hide</Trans>
  );

  return (
    <Paper
      variant="card"
      sx={[
        { mt: withTopMargin ? 4 : 0 },
        ...(paperSx ? (Array.isArray(paperSx) ? paperSx : [paperSx]) : []),
      ]}
    >
      <Box
        sx={{
          px: { xs: 4, xsm: 6 },
          py: { xs: 3.5, xsm: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...wrapperSx,
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: { xs: 'flex-start', xsm: 'center' },
            flexDirection: { xs: 'column', xsm: 'row' },
          }}
        >
          {titleComponent}
          {subTitleComponent}
        </Box>

        {!!localStorageName && !noData && (
          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              handleTrackingEvents();

              if (localStorageName && !noData) {
                const nextIsCollapse = !isCollapse;
                toggleLocalStorageClick(isCollapse, setIsCollapse, localStorageName);
                onCollapseChange?.(nextIsCollapse);
              }
            }}
            endIcon={
              // − when expanded; a rotated copy fades in to form a + when collapsed.
              <Box sx={{ position: 'relative', display: 'inline-flex', color: 'fg-3' }}>
                <MinusIcon sx={{ fontSize: 18 }} />
                <MinusIcon
                  sx={{
                    fontSize: 18,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: 'rotate(90deg)',
                    opacity: collapsed ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                  }}
                />
              </Box>
            }
          >
            {collapseText}
          </Button>
        )}
      </Box>

      {topInfo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: { xs: 4, xsm: 6 },
            pb: { xs: collapsed && !noData ? 6 : 2, xsm: collapsed && !noData ? 6 : 0 },
            overflowX: tooltipOpen ? 'hidden' : 'auto',
            ...topInfoSx,
          }}
        >
          {topInfo}
        </Box>
      )}
      {subChildrenComponent && !collapsed && (
        <Box sx={{ marginBottom: { xs: 2, xsm: 0 } }}>{subChildrenComponent}</Box>
      )}
      <Box sx={{ display: collapsed ? 'none' : 'block' }}>{children}</Box>
    </Paper>
  );
};
