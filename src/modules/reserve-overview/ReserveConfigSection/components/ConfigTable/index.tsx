import { Plural, Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';
import { LIST_CARDS_BELOW } from 'src/components/lists/listBreakpoints';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ShowMoreButton } from 'src/components/ShowMoreButton';
import { useLocalStorageState } from 'src/hooks/compliance/useLocalStorageState';

import {
  compareConfigRows,
  ConfigRow,
  ConfigSortKey,
  ConfigValueKey,
} from '../../utils/configRows';
import { ConfigCard } from './components/ConfigCard';
import { ConfigLabel } from './components/ConfigLabel';
import { ConfigValue } from './components/ConfigValue';

const COLLAPSED_ROW_COUNT = 7;

export interface ConfigSort {
  key: ConfigSortKey;
  desc: boolean;
}

export interface ConfigColumnWeights {
  label: number;
  value: number;
}

type StoredSort = { name: string; desc: boolean };

interface ConfigTableProps {
  rows: ConfigRow[];
  assetsTitle: ReactNode;
  columnWeights: ConfigColumnWeights;
  sortSource: string;
  sortStorageKey: string;
  showSupplied?: boolean;
  defaultSort?: ConfigSort;
}

export const ConfigTable = ({
  rows,
  assetsTitle,
  columnWeights,
  sortSource,
  sortStorageKey,
  showSupplied = false,
  defaultSort,
}: ConfigTableProps) => {
  const { breakpoints } = useTheme();
  const showCards = useMediaQuery(breakpoints.down(LIST_CARDS_BELOW));
  const [storedSort, setStoredSort] = useLocalStorageState<StoredSort>(sortStorageKey);
  const [expanded, setExpanded] = useState(false);

  const valueColumns: { key: ConfigValueKey; title: ReactNode }[] = [
    ...(showSupplied ? [{ key: 'supplied' as const, title: <Trans>Supplied</Trans> }] : []),
    { key: 'maxLTV', title: <Trans>Max LTV</Trans> },
    { key: 'liquidationThreshold', title: <Trans>Liq. Threshold</Trans> },
    { key: 'liquidationPenalty', title: <Trans>Liq. Penalty</Trans> },
    { key: 'assets', title: assetsTitle },
  ];
  const columns: { key: ConfigSortKey; title: ReactNode }[] = [
    { key: 'label', title: <Trans>Market & E-Mode</Trans> },
    ...valueColumns,
  ];

  const storedName = typeof storedSort?.name === 'string' ? storedSort.name : '';
  const sortName = columns.some((column) => column.key === storedName) ? storedName : '';
  const sortDesc = storedSort?.desc === true;
  const setSortName = (name: string) =>
    setStoredSort((prev) => ({ desc: prev?.desc === true, name }));
  const setSortDesc = (desc: boolean) =>
    setStoredSort((prev) => ({ name: typeof prev?.name === 'string' ? prev.name : '', desc }));

  const sortedRows = useMemo(() => {
    const sort = sortName ? { key: sortName as ConfigSortKey, desc: sortDesc } : defaultSort;
    if (!sort) return rows;
    return [...rows].sort((a, b) => {
      const result = compareConfigRows(a, b, sort.key);
      return sort.desc ? -result : result;
    });
  }, [rows, sortName, sortDesc, defaultSort]);

  const hiddenCount = Math.max(sortedRows.length - COLLAPSED_ROW_COUNT, 0);
  const visibleRows = expanded ? sortedRows : sortedRows.slice(0, COLLAPSED_ROW_COUNT);
  const toggleExpanded = () => setExpanded(!expanded);
  const showMoreLabel = (
    <Plural
      value={hiddenCount}
      one="Show # more configuration"
      other="Show # more configurations"
    />
  );

  const emptyMessage = (
    <Typography variant="description" color="fg-3">
      <Trans>No configurations match the selected filters.</Trans>
    </Typography>
  );

  if (showCards) {
    return (
      <Stack gap="1.5rem">
        {visibleRows.map((row) => (
          <ConfigCard key={row.id} row={row} fields={valueColumns} />
        ))}
        {sortedRows.length === 0 && emptyMessage}
        {hiddenCount > 0 && (
          <ShowMoreButton
            expanded={expanded}
            label={showMoreLabel}
            onClick={toggleExpanded}
            sx={{ borderRadius: '0.5rem' }}
          />
        )}
      </Stack>
    );
  }

  const gridSx = {
    display: 'grid',
    gridTemplateColumns: `minmax(0, ${columnWeights.label}fr) repeat(${valueColumns.length}, minmax(0, ${columnWeights.value}fr))`,
    columnGap: '1rem',
    alignItems: 'center',
    px: '1rem',
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'border-0',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ ...gridSx, minHeight: '2.875rem', bgcolor: 'bg-2' }}>
        {columns.map((column) => (
          <ListHeaderTitle
            key={column.key}
            sortKey={column.key}
            sortName={sortName}
            sortDesc={sortDesc}
            setSortName={setSortName}
            setSortDesc={setSortDesc}
            source={sortSource}
          >
            {column.title}
          </ListHeaderTitle>
        ))}
      </Box>

      {visibleRows.map((row) => (
        <Box
          key={row.id}
          sx={{ ...gridSx, minHeight: '3rem', borderTop: '1px solid', borderColor: 'border-0' }}
        >
          <ConfigLabel label={row.label} isEMode={row.isEMode} noWrap />
          {valueColumns.map((column) => (
            <ConfigValue key={column.key} row={row} columnKey={column.key} />
          ))}
        </Box>
      ))}

      {sortedRows.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minHeight: '3rem',
            px: '1rem',
            borderTop: '1px solid',
            borderColor: 'border-0',
          }}
        >
          {emptyMessage}
        </Box>
      )}

      {hiddenCount > 0 && (
        <ShowMoreButton
          expanded={expanded}
          label={showMoreLabel}
          onClick={toggleExpanded}
          sx={{ borderTop: '1px solid', borderColor: 'border-0' }}
        />
      )}
    </Box>
  );
};
