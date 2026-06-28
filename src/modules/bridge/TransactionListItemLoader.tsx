import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { Skeleton, Stack, SvgIcon } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';

export const TransactionListItemLoader = () => {
  return (
    <ListItem>
      <ListColumn isRow>
        <Skeleton variant="circular" width={32} height={32} />
        <Stack direction="column" gap={1}>
          <Skeleton sx={{ ml: 2 }} width={50} height={12} />
          {/* <Skeleton sx={{ ml: 2 }} width={50} height={12} /> */}
        </Stack>
      </ListColumn>

      <ListColumn align="left">
        <Stack direction="row" gap={3} alignItems="center">
          <Skeleton variant="circular" width={28} height={28} />
          <SvgIcon sx={{ fontSize: '13px' }}>
            <ArrowNarrowRightIcon />
          </SvgIcon>
          <Skeleton variant="circular" width={28} height={28} />
        </Stack>
      </ListColumn>

      <ListColumn align="left">
        <Stack direction="column" gap={1}>
          <Skeleton width={90} height={12} />
          <Skeleton width={140} height={12} />
        </Stack>
      </ListColumn>

      <ListColumn align="left">
        <Skeleton width={90} height={24} />
      </ListColumn>

      <ListColumn maxWidth={95} minWidth={95} align="left">
        <Skeleton width={24} height={24} />
      </ListColumn>
    </ListItem>
  );
};

export const TransactionMobileListItemLoader = () => {
  return (
    <ListItem>
      <Stack direction="row" my={4} justifyContent="space-between" sx={{ width: '100%' }}>
        <Stack direction="column" gap={2}>
          <Stack direction="column" gap={1}>
            <Skeleton width={90} height={16} />
            <Skeleton width={140} height={16} />
          </Stack>
          <Stack direction="row" alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Stack direction="column" gap={1}>
              <Skeleton sx={{ ml: 2 }} width={50} height={12} />
              {/* <Skeleton sx={{ ml: 2 }} width={50} height={12} /> */}
            </Stack>
          </Stack>
        </Stack>
        <Stack gap={3} alignItems="center">
          <Stack direction="row" gap={3} mr={1}>
            <Skeleton width={90} height={24} />
            <Skeleton width={70} height={24} />
          </Stack>
          <Stack direction="row" gap={3} alignItems="center">
            <Skeleton variant="circular" width={28} height={28} />
            <SvgIcon sx={{ fontSize: '13px' }}>
              <ArrowNarrowRightIcon />
            </SvgIcon>
            <Skeleton variant="circular" width={28} height={28} />
          </Stack>
        </Stack>
      </Stack>
    </ListItem>
  );
};
