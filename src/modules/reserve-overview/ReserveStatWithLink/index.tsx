import { Box, Button, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { Link } from 'src/components/primitives/Link';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

interface ReserveStatWithLinkProps {
  reserve: ReserveWithId;
  href: string;
  linkName: string;
  linkLabel: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export const ReserveStatWithLink = ({
  reserve,
  href,
  linkName,
  linkLabel,
  children,
  sx,
}: ReserveStatWithLinkProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
      <Button
        onClick={() => {
          trackEvent(GENERAL.EXTERNAL_LINK, {
            asset: reserve.underlyingToken.address,
            Link: linkName,
            assetName: reserve.underlyingToken.name,
          });
        }}
        href={href}
        endIcon={<ArrowUpRightIcon sx={{ width: 14, height: 14 }} />}
        component={Link}
        size="small"
        variant="tertiary"
      >
        {linkLabel}
      </Button>
    </Box>
  );
};
