import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useRootStore } from 'src/store/root';

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
        textTransform: 'uppercase',
      }}
    >
      {children}

      {!!sortKey && (
        <Box sx={{ display: 'inline-flex', flexShrink: 0, ml: 1, color: 'fg-icon' }}>
          {/* Static sortable indicator: an up/down chevron. Color comes from the fg-icon token via
              currentColor on the Box — the P3-safe way to tint an SVG, since var() doesn't resolve
              in SVG presentation attributes. stroke/width/caps are inherited by both paths. */}
          <svg
            width="8"
            height="10"
            viewBox="0 0 8 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1.59961 3L3.99961 1L6.39961 3" />
            <path d="M1.59961 7L3.99961 9L6.39961 7" />
          </svg>
        </Box>
      )}
    </Typography>
  );
};
