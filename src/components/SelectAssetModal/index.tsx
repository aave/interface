import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { BalanceAsset, BalanceAssets } from 'src/components/BalanceAssets';
import { BasicModal } from 'src/components/primitives/BasicModal';

interface SelectAssetModalProps<T extends BalanceAsset> {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: ReactNode;
  supportedAssets: T[];
  supportedLabel?: ReactNode;
  otherAssets?: T[];
  loading?: boolean;
  onSelect: (asset: T) => void;
}

export const SelectAssetModal = <T extends BalanceAsset>({
  open,
  setOpen,
  title,
  ...list
}: SelectAssetModalProps<T>) => (
  <BasicModal open={open} setOpen={setOpen} contentMaxWidth={480} contentHeight={640}>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.375rem', height: '100%' }}>
      <Typography
        variant="inherit"
        component="h2"
        color="fg-1"
        sx={{ fontSize: '1rem', fontWeight: 500, lineHeight: '1.125rem', pr: '2rem' }}
      >
        {title}
      </Typography>
      <BalanceAssets {...list} />
    </Box>
  </BasicModal>
);
