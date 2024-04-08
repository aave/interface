import { ArrowRightAltOutlined } from '@mui/icons-material';
import { Box, Skeleton, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';

import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';

export const BridgeHistoryItemLoader = () => {
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  return (
    <ListItem px={6} minHeight={76}>
      <ListColumn isRow maxWidth={280}>
        <Skeleton variant="circular" width={24} height={24} />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Skeleton width={75} height={24} />
        </Box>
      </ListColumn>

      <ListColumn isRow maxWidth={280} gap={downToXSM ? 0 : 2}>
        <Skeleton variant="circular" width={24} height={24} />
        {!downToXSM && (
          <SvgIcon
            sx={{
              marginLeft: '10px',
              marginRight: '10px',
              fontSize: '20px',
              color: 'text.secondary',
            }}
          >
            <ArrowRightAltOutlined />
          </SvgIcon>
        )}
        <Skeleton variant="circular" width={24} height={24} />
      </ListColumn>

      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>

      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>

      <ListColumn maxWidth={280} align="center">
        <Skeleton width={70} height={24} />
      </ListColumn>
    </ListItem>
  );
};
