import { ReactNode } from 'react';
import { BalanceAsset, BalanceAssets } from 'src/components/BalanceAssets';
import { SelectModal } from 'src/components/SelectModal';

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
  <SelectModal open={open} setOpen={setOpen} title={title}>
    <BalanceAssets {...list} />
  </SelectModal>
);
