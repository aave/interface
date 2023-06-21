import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useRootStore } from 'src/store/root';

import { MARKETS } from '../../utils/mixPanelEvents';

interface ListHeaderTitleProps {
  sortName?: string;
  sortDesc?: boolean;
  sortKey?: string;
  setSortName?: (value: string) => void;
  setSortDesc?: (value: boolean) => void;
  onClick?: () => void;
  children: ReactNode;
}

export const ListHeaderTitle = ({
  sortName,
  sortDesc,
  sortKey,
  setSortName,
  setSortDesc,
  onClick,
  children,
}: ListHeaderTitleProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleTracking = (sortName: string) => {
    switch (sortName) {
      case 'asset':
        trackEvent(MARKETS.SORT, { sort_by: 'asset', page: 'market' });
        break;
      case 'totalLiquidityUSD':
        trackEvent(MARKETS.SORT, { sort_by: 'totalLiquidityUSD', page: 'market' });
        break;
      case 'supplyAPY':
        trackEvent(MARKETS.SORT, { sort_by: 'supplyAPY', page: 'market' });
        break;
      case 'totalDebtUSD':
        trackEvent(MARKETS.SORT, { sort_by: 'totalDebtUSD', page: 'market' });

        break;
      case 'variableBorrowAPY':
        trackEvent(MARKETS.SORT, { sort_by: 'variableBorrowAPY', page: 'market' });

        break;
      case 'stableBorrowAPY':
        trackEvent(MARKETS.SORT, { sort_by: 'stableBorrowAPY', page: 'market' });
        break;
      default:
        return null;
    }
  };

  const handleSorting = (name: string) => {
    handleTracking(name);
    setSortDesc && setSortDesc(false);
    setSortName && setSortName(name);
    if (sortName === name) {
      setSortDesc && setSortDesc(!sortDesc);
    }
  };

  return (
    <Typography
      component="div"
      variant="subheader2"
      color="text.secondary"
      noWrap
      onClick={() => (!!onClick ? onClick() : !!sortKey && handleSorting(sortKey))}
      sx={{
        cursor: !!onClick || !!sortKey ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {children}

      {!!sortKey && (
        <Box sx={{ display: 'inline-flex', flexDirection: 'column', ml: 1 }}>
          <Box
            component="span"
            sx={(theme) => ({
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 4px 4px 4px',
              borderColor: `transparent transparent ${
                sortName === sortKey && sortDesc
                  ? theme.palette.text.secondary
                  : theme.palette.divider
              } transparent`,
              mb: 0.5,
            })}
          />
          <Box
            component="span"
            sx={(theme) => ({
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '4px 4px 0 4px',
              borderColor: `${
                sortName === sortKey && !sortDesc
                  ? theme.palette.text.secondary
                  : theme.palette.divider
              } transparent transparent transparent`,
            })}
          />
        </Box>
      )}
    </Typography>
  );
};
