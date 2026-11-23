import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';
import { CheckmarkIcon } from 'src/components/icons/CheckmarkIcon';
import { CrossIcon } from 'src/components/icons/CrossIcon';
import { EModeIcon } from 'src/components/icons/EModeIcon';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

import { ConfigFilterButton, ConfigFilterOption } from './components/ConfigFilterButton';
import { ConfigColumnWeights, ConfigSort, ConfigTable } from './components/ConfigTable';
import { ConfigAsset, ConfigRow } from './utils/configRows';

interface ReserveConfigSectionProps {
  enabled: boolean;
  title: ReactNode;
  description: ReactNode;
  rows: ConfigRow[];
  assetsTitle: ReactNode;
  assetsFilterLabel: ReactNode;
  columnWeights: ConfigColumnWeights;
  sortSource: string;
  sortStorageKey: string;
  showSupplied?: boolean;
  defaultSort?: ConfigSort;
  children?: ReactNode;
}

export const ReserveConfigSection = ({
  enabled,
  title,
  description,
  rows,
  assetsTitle,
  assetsFilterLabel,
  columnWeights,
  sortSource,
  sortStorageKey,
  showSupplied,
  defaultSort,
  children,
}: ReserveConfigSectionProps) => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([]);

  const assetOptions = useMemo<ConfigFilterOption[]>(() => {
    const byAddress = new Map<string, ConfigAsset>();
    rows.forEach((row) => row.assets.forEach((asset) => byAddress.set(asset.address, asset)));
    return Array.from(byAddress.values())
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .map((asset) => ({
        key: asset.address,
        label: asset.symbol,
        icon: <TokenIcon symbol={asset.iconSymbol} sx={{ fontSize: '1.25rem' }} />,
      }));
  }, [rows]);

  const configOptions = useMemo<ConfigFilterOption[]>(() => {
    const byKey = new Map<string, ConfigRow>();
    rows.forEach((row) => {
      if (!byKey.has(row.configKey)) byKey.set(row.configKey, row);
    });
    return Array.from(byKey.values()).map((row) => ({
      key: row.configKey,
      label: (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {row.configLabel}
          {row.isEMode && <EModeIcon />}
        </Box>
      ),
    }));
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (selectedConfigs.length === 0 || selectedConfigs.includes(row.configKey)) &&
          (selectedAssets.length === 0 ||
            row.assets.some((asset) => selectedAssets.includes(asset.address)))
      ),
    [rows, selectedAssets, selectedConfigs]
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        {enabled ? (
          <CheckmarkIcon sx={{ fontSize: '1.25rem', color: 'data-green' }} />
        ) : (
          <CrossIcon sx={{ fontSize: '1.25rem', color: 'data-red' }} />
        )}
        <Typography variant="secondary16" component="h3">
          {title}
        </Typography>
      </Box>
      <Typography
        variant="description"
        color="fg-3"
        sx={{ mt: '0.4375rem', lineHeight: '1.125rem', letterSpacing: 0 }}
      >
        {description}
      </Typography>

      {children}

      {enabled && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', mt: '1.5rem' }}>
          <ConfigFilterButton
            label={assetsFilterLabel}
            options={assetOptions}
            selected={selectedAssets}
            onChange={setSelectedAssets}
          />
          <ConfigFilterButton
            label={<Trans>Markets</Trans>}
            options={configOptions}
            selected={selectedConfigs}
            onChange={setSelectedConfigs}
          />
        </Box>
      )}

      {rows.length > 0 && (
        <Box sx={{ mt: '1.5rem' }}>
          <ConfigTable
            rows={filteredRows}
            assetsTitle={assetsTitle}
            columnWeights={columnWeights}
            sortSource={sortSource}
            sortStorageKey={sortStorageKey}
            showSupplied={showSupplied}
            defaultSort={defaultSort}
          />
        </Box>
      )}
    </Box>
  );
};
