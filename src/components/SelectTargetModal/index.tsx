import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { Fragment, ReactNode, useState } from 'react';
import {
  AssetList,
  AssetListEmpty,
  AssetListGroup,
  AssetListItem,
} from 'src/components/AssetListItem';
import { HubMarketIcon } from 'src/components/HubMarketIcon';
import { HubMarketKind } from 'src/components/HubMarketIcon/utils/glyphs';
import { DotIcon } from 'src/components/icons/DotIcon';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { SearchInput } from 'src/components/SearchInput';
import { SelectModal } from 'src/components/SelectModal';

export interface TargetOption {
  id: string;
  kind: HubMarketKind;
  name: ReactNode;
  subtitle?: ReactNode | ReactNode[];
  apy: number;
  balanceUSD?: number;
  disabled?: boolean;
  keywords?: string[];
}

export interface TargetGroup<T extends TargetOption> {
  label: ReactNode;
  tooltip?: ReactNode;
  options: T[];
}

interface SelectTargetModalProps<T extends TargetOption> {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: ReactNode;
  groups: TargetGroup<T>[];
  onSelect: (option: T) => void;
  searchPlaceholder?: string;
}

const SEARCH_SX = { width: '100%', flexShrink: 0 } as const;

const DETAILS_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  minWidth: 0,
  overflow: 'hidden',
  typography: 'base',
  color: 'fg-3',
  whiteSpace: 'nowrap',
} as const;

const DOT = <DotIcon sx={{ color: 'fg-4' }} />;

const matchesSearch = (option: TargetOption, term: string) =>
  !term || !option.keywords || option.keywords.some((word) => word.toLowerCase().includes(term));

const Subtitle = ({ subtitle }: { subtitle: ReactNode | ReactNode[] }) =>
  Array.isArray(subtitle) ? (
    <Box component="span" sx={DETAILS_SX}>
      {subtitle.map((item, index) => (
        <Fragment key={index}>
          {index > 0 ? DOT : null}
          {item}
        </Fragment>
      ))}
    </Box>
  ) : (
    <Typography component="span" variant="base" color="fg-3" noWrap>
      {subtitle}
    </Typography>
  );

const TargetRow = <T extends TargetOption>({
  option,
  onSelect,
}: {
  option: T;
  onSelect: (option: T) => void;
}) => {
  const { balanceUSD } = option;
  const hasBalance = balanceUSD !== undefined;

  return (
    <AssetListItem
      onClick={() => onSelect(option)}
      disabled={option.disabled}
      icon={<HubMarketIcon kind={option.kind} size={44} tone="picker" />}
      left={
        <>
          <Typography component="span" variant="h5" color="fg-1" noWrap>
            {option.name}
          </Typography>
          {option.subtitle ? <Subtitle subtitle={option.subtitle} /> : null}
        </>
      }
      right={
        <>
          {hasBalance ? (
            <FormattedNumber
              component="span"
              value={balanceUSD}
              symbol="USD"
              compact
              variant="h5"
              color="fg-1"
            />
          ) : null}
          <Typography
            component="span"
            variant={hasBalance ? 'base' : 'h5'}
            color={hasBalance ? 'fg-3' : 'fg-1'}
            noWrap
          >
            <Trans>
              <FormattedNumber component="span" value={option.apy} percent variant="inherit" /> APY
            </Trans>
          </Typography>
        </>
      }
    />
  );
};

const TargetList = <T extends TargetOption>({
  groups,
  onSelect,
  searchPlaceholder,
}: Pick<SelectTargetModalProps<T>, 'groups' | 'onSelect' | 'searchPlaceholder'>) => {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const visible = groups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => matchesSearch(option, term)),
    }))
    .filter((group) => group.options.length > 0);

  return (
    <>
      {searchPlaceholder ? (
        <SearchInput
          size="large"
          placeholder={searchPlaceholder}
          onSearchTermChange={setQuery}
          wrapperSx={SEARCH_SX}
        />
      ) : null}
      <AssetList>
        {visible.map((group, index) => (
          <AssetListGroup key={index} label={group.label} tooltip={group.tooltip}>
            {group.options.map((option) => (
              <TargetRow key={option.id} option={option} onSelect={onSelect} />
            ))}
          </AssetListGroup>
        ))}
        {term && visible.length === 0 ? <AssetListEmpty query={query} /> : null}
      </AssetList>
    </>
  );
};

export const SelectTargetModal = <T extends TargetOption>({
  open,
  setOpen,
  title,
  groups,
  onSelect,
  searchPlaceholder,
}: SelectTargetModalProps<T>) => (
  <SelectModal open={open} setOpen={setOpen} title={title}>
    <TargetList groups={groups} onSelect={onSelect} searchPlaceholder={searchPlaceholder} />
  </SelectModal>
);
