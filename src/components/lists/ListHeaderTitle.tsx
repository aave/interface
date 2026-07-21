import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useRootStore } from 'src/store/root';
import { figVars } from 'src/utils/figmaColors';

import { MARKETS } from '../../utils/events';

interface ListHeaderTitleProps {
  sortName?: string;
  sortDesc?: boolean;
  sortKey?: string;
  source?: string;
  setSortName?: (value: string) => void;
  setSortDesc?: (value: boolean) => void;
  onClick?: () => void;
  children: ReactNode;
}

export const ListHeaderTitle = ({
  sortName,
  sortDesc,
  sortKey,
  source,
  setSortName,
  setSortDesc,
  onClick,
  children,
}: ListHeaderTitleProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleSorting = (name: string) => {
    trackEvent(MARKETS.SORT, { sort_by: name, tile: source });
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
      color="fg-2"
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
            sx={{
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 4px 4px 4px',
              borderColor: `transparent transparent ${
                sortName === sortKey && sortDesc ? figVars['fg-2'] : figVars['border-2']
              } transparent`,
              mb: 0.5,
            }}
          />
          <Box
            component="span"
            sx={{
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '4px 4px 0 4px',
              borderColor: `${
                sortName === sortKey && !sortDesc ? figVars['fg-2'] : figVars['border-2']
              } transparent transparent transparent`,
            }}
          />
        </Box>
      )}
    </Typography>
  );
};
