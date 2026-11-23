import { Typography } from '@mui/material';
import { ReactNode } from 'react';
import { AssetList, AssetListGroup, AssetListItem } from 'src/components/AssetListItem';
import { HubMarketIcon } from 'src/components/HubMarketIcon';
import { HubMarketKind } from 'src/components/HubMarketIcon/utils/glyphs';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { SelectModal } from 'src/components/SelectModal';

export interface TargetOption {
  id: string;
  kind: HubMarketKind;
  name: ReactNode;
  subtitle?: ReactNode;
  apy: number;
  balanceUSD?: number;
  disabled?: boolean;
}

interface SelectTargetModalProps<T extends TargetOption> {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: ReactNode;
  groups: { label: ReactNode; options: T[] }[];
  onSelect: (option: T) => void;
}

export const SelectTargetModal = <T extends TargetOption>({
  open,
  setOpen,
  title,
  groups,
  onSelect,
}: SelectTargetModalProps<T>) => (
  <SelectModal open={open} setOpen={setOpen} title={title}>
    <AssetList>
      {groups
        .filter((group) => group.options.length > 0)
        .map((group, index) => (
          <AssetListGroup key={index} label={group.label}>
            {group.options.map((option) => {
              const { balanceUSD } = option;
              const hasBalance = balanceUSD !== undefined;

              return (
                <AssetListItem
                  key={option.id}
                  onClick={() => onSelect(option)}
                  disabled={option.disabled}
                  icon={<HubMarketIcon kind={option.kind} size={44} tone="grey" />}
                  left={
                    <>
                      <Typography component="span" variant="h5" color="fg-1" noWrap>
                        {option.name}
                      </Typography>
                      {option.subtitle ? (
                        <Typography component="span" variant="base" color="fg-3" noWrap>
                          {option.subtitle}
                        </Typography>
                      ) : null}
                    </>
                  }
                  right={
                    <>
                      {hasBalance ? (
                        <FormattedNumber
                          component="span"
                          value={balanceUSD}
                          symbol="USD"
                          variant="h5"
                          color="fg-1"
                        />
                      ) : null}
                      <FormattedNumber
                        component="span"
                        value={option.apy}
                        percent
                        variant={hasBalance ? 'base' : 'h5'}
                        color={hasBalance ? 'fg-3' : 'fg-1'}
                      />
                    </>
                  }
                />
              );
            })}
          </AssetListGroup>
        ))}
    </AssetList>
  </SelectModal>
);
