import { Trans } from '@lingui/macro';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';

import { toggleLocalStorageClick } from '../../helpers/toggle-local-storage-click';

interface DashboardListWrapperProps {
  title: ReactNode;
  localStorageName?: string;
  subTitleComponent?: ReactNode;
  subChildrenComponent?: ReactNode;
  topInfo?: ReactNode;
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
  topInfo,
  withTopMargin,
  noData,
  withBottomText,
}: DashboardListWrapperProps) => {
  const [isCollapse, setIsCollapse] = useState(
    localStorageName ? localStorage.getItem(localStorageName) === 'true' : false
  );

  const collapsed = isCollapse && !noData;

  return (
    <Paper sx={{ mt: withTopMargin ? 4 : 0 }}>
      <Box
        sx={{
          px: 6,
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: !noData ? 'pointer' : 'default',
          mb: noData ? 0 : 4,
        }}
        onClick={() =>
          !!localStorageName && !noData
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

        {!!localStorageName && !noData && (
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
                  transform: collapsed ? 'rotate(90deg)' : 'rotate(0)',
                  opacity: collapsed ? 1 : 0,
                },
              },
            }}
          >
            <Typography variant="buttonM" color="text.secondary">
              {collapsed ? <Trans>Show</Trans> : <Trans>Hide</Trans>}
            </Typography>
            <span />
          </Box>
        )}
      </Box>

      {topInfo && (
        <Box
          sx={{ display: 'flex', alignItems: 'center', px: 6, pb: collapsed && !noData ? 6 : 0 }}
        >
          {topInfo}
        </Box>
      )}
      {subChildrenComponent && !collapsed && <Box>{subChildrenComponent}</Box>}
      <Box sx={{ display: collapsed ? 'none' : 'block' }}>{children}</Box>

      {withBottomText && !collapsed && (
        <Box>
          <Divider />
          {/* TODO: need to add bottom text component (link to faucet)*/}
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '71px', px: 6 }}>
            BottomText
          </Box>
        </Box>
      )}
    </Paper>
  );
};
