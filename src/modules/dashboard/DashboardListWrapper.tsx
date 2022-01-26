import { Trans } from '@lingui/macro';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';

import { toggleLocalStorageClick } from '../../helpers/toggle-local-storage-click';

interface DashboardListWrapperProps {
  title: ReactNode;
  localStorageName?: string;
  subTitleComponent?: ReactNode;
  subChildrenComponent?: ReactNode;
  children: ReactNode;
  withTopMargin?: boolean;
  noData?: boolean;
  withBottomText?: ReactNode;
}

export const DashboardListWrapper = ({
  children,
  localStorageName,
  title,
  subTitleComponent,
  subChildrenComponent,
  withTopMargin,
  noData,
  withBottomText,
}: DashboardListWrapperProps) => {
  const [isCollapse, setIsCollapse] = useState(
    localStorageName ? localStorage.getItem(localStorageName) === 'true' : false
  );

  return (
    <Paper sx={{ mt: withTopMargin ? 4 : 0 }}>
      <Box
        sx={{
          px: 6,
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          mb: noData ? 0 : 4,
        }}
        onClick={() =>
          !!localStorageName
            ? toggleLocalStorageClick(isCollapse, setIsCollapse, localStorageName)
            : undefined
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: '3.6px' }}>
          <Typography component="div" variant="h3" sx={{ mr: 4 }}>
            {title}
          </Typography>
          {subTitleComponent}
        </Box>

        {!!localStorageName && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              span: {
                width: '14px',
                height: '2px',
                bgcolor: 'text.secondary',
                position: 'relative',
                ml: 1,
                '&:after': {
                  content: "''",
                  position: 'absolute',
                  width: '14px',
                  height: '2px',
                  bgcolor: 'text.secondary',
                  transition: 'all 0.2s ease',
                  transform: isCollapse ? 'rotate(90deg)' : 'rotate(0)',
                  opacity: isCollapse ? 1 : 0,
                },
              },
            }}
          >
            <Typography variant="buttonM" color="text.secondary">
              {isCollapse ? <Trans>Show</Trans> : <Trans>Hide</Trans>}
            </Typography>
            <span />
          </Box>
        )}
      </Box>

      {subChildrenComponent && <Box>{subChildrenComponent}</Box>}
      <Box sx={{ display: isCollapse ? 'none' : 'block' }}>{children}</Box>

      {withBottomText && !isCollapse && (
        <Box>
          <Divider />
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '71px', px: 6 }}>
            BottomText
          </Box>
        </Box>
      )}
    </Paper>
  );
};
