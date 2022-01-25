import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';

import { toggleLocalStorageClick } from '../../helpers/toggle-local-storage-click';

interface DashboardListWrapperProps {
  title: ReactNode;
  localStorageName?: string;
  subTitleComponent?: ReactNode;
  children: ReactNode;
  withBottomText?: boolean;
  withTopMargin?: boolean;
  noData?: boolean;
}

export const DashboardListWrapper = ({
  children,
  localStorageName,
  title,
  subTitleComponent,
}: DashboardListWrapperProps) => {
  const [isCollapse, setIsCollapse] = useState(
    localStorageName ? localStorage.getItem(localStorageName) === 'true' : false
  );

  return (
    <Box>
      <Box
        onClick={() =>
          !!localStorageName
            ? toggleLocalStorageClick(isCollapse, setIsCollapse, localStorageName)
            : undefined
        }
      >
        <Typography component="div" variant="h3">
          {title}
        </Typography>

        {!!localStorageName && (
          <Box>
            <Typography variant="buttonM">
              <Trans>{isCollapse ? 'Show' : 'Hide'}</Trans>
            </Typography>
            <span />
          </Box>
        )}
      </Box>

      <Box>{subTitleComponent}</Box>
      <Box>{children}</Box>
    </Box>
  );
};
