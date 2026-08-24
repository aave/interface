import { Trans } from '@lingui/macro';
import { Box, BoxProps, Button, Paper, PaperProps } from '@mui/material';
import { ReactNode, useState } from 'react';
import { MinusIcon } from 'src/components/icons/MinusIcon';
import { useRootStore } from 'src/store/root';
import { DASHBOARD } from 'src/utils/events';
import { figVars } from 'src/utils/figmaColors';

import { toggleLocalStorageClick } from '../../helpers/toggle-local-storage-click';

interface ListWrapperProps {
  titleComponent: ReactNode;
  localStorageName?: string;
  subTitleComponent?: ReactNode;
  subChildrenComponent?: ReactNode;
  /**
   * Second header row. Must render NOTHING at all when it has no content (return null / a falsy
   * branch) — not an empty wrapper element — or its divider will be drawn above blank space, since
   * the row hides itself via `:empty`.
   */
  topInfo?: ReactNode;
  children: ReactNode;
  withTopMargin?: boolean;
  noData?: boolean;
  wrapperSx?: BoxProps['sx'];
  tooltipOpen?: boolean;
  paperSx?: PaperProps['sx'];
  onCollapseChange?: (collapsed: boolean) => void;
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
  onCollapseChange,
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

  const collapseText = collapsed ? <Trans>Show</Trans> : <Trans>Hide</Trans>;

  // When nothing renders below it, the band is the card's last visible element: round its bottom
  // corners to the Paper's radius and drop the hairline that would otherwise dangle over nothing.
  const bandIsCardTail = {
    boxShadow: 'none',
    borderBottomLeftRadius: 'inherit',
    borderBottomRightRadius: 'inherit',
  };

  return (
    <>
      <Paper
        variant="table"
        sx={[
          { mt: withTopMargin ? '2rem' : 0 },
          ...(paperSx ? (Array.isArray(paperSx) ? paperSx : [paperSx]) : []),
        ]}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            padding: { xs: '0.875rem 1rem', xsm: '1rem 1rem 1rem 1.25rem' },
            bgcolor: 'table-bg',
            // Hairline as an inset shadow rather than a border, so it doesn't add to the box height.
            boxShadow: `inset 0 -1px 0 ${figVars['border-0']}`,
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
            // Empty list: the children box is present but renders nothing.
            '&:has(+ div:empty)': bandIsCardTail,
            // Collapsed: the children box is `display: none`, so it is not `:empty`.
            ...(collapsed ? bandIsCardTail : {}),
            ...wrapperSx,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              // Title type (H4) — scoped to this row, NOT the whole band, or it would flatten the
              // second row's stat typography too. Consumers pass their own heading variant, so
              // neutralise those; control typography (search, selects) keeps its own smaller type.
              color: 'fg-1',
              fontSize: '1rem',
              fontWeight: 500,
              lineHeight: '1.125rem',
              '& .MuiTypography-h1, & .MuiTypography-h2, & .MuiTypography-h3, & .MuiTypography-h4':
                {
                  font: 'inherit',
                  letterSpacing: 'inherit',
                  textTransform: 'capitalize',
                },
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
                variant="tertiary"
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

          {/* Second header row. Its divider is drawn as this row's own top border rather than a
              sibling <Divider>, so an empty row takes the rule with it — consumers pass topInfo as
              a fragment that can render nothing (e.g. "Your borrows" with nothing borrowed), which
              is truthy here but produces no DOM. Being a child of the padded band, the rule insets
              to the band's left/right padding instead of running edge to edge like the bottom
              hairline. */}
          {topInfo && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                // Matches the stat spacing on the page header (PageHeader.tsx).
                gap: '2.5rem',
                borderTop: '1px solid',
                borderColor: 'border-0',
                pt: '1.25rem',
                '&:empty': { display: 'none' },
                overflowX: tooltipOpen ? 'hidden' : 'auto',
              }}
            >
              {topInfo}
            </Box>
          )}
        </Box>

        <Box sx={{ display: collapsed ? 'none' : 'block' }}>{children}</Box>
      </Paper>

      {/* Filters (e.g. "Show assets with 0 balance") sit below the card, outside it. */}
      {subChildrenComponent && !collapsed && <Box sx={{ mt: 3 }}>{subChildrenComponent}</Box>}
    </>
  );
};
