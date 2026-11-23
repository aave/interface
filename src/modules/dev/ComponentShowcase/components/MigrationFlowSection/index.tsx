import { ChainId } from '@aave/contract-helpers';
import { Box, Skeleton, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
import { ChainIcon } from 'src/components/ChainIcon';
import { FlowHeader } from 'src/components/FlowHeader';
import { SearchInput } from 'src/components/SearchInput';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const STEPS = [
  { value: 'select-hub', label: 'Select hub' },
  { value: 'review', label: 'Review' },
  { value: 'loading', label: 'Loading' },
] as const;

type Step = (typeof STEPS)[number]['value'];

const CHAINS = [ChainId.mainnet, ChainId.arbitrum_one, ChainId.base, ChainId.avalanche].map(
  (chainId) => ({ value: chainId, label: getNetworkConfig(chainId).name })
);

const chainChip = (chainId: ChainId) => (
  <span>
    <ChainIcon chainId={chainId} />
    <strong>{getNetworkConfig(chainId).name}</strong>
  </span>
);

const subheadingFor = (step: Step, chainId: ChainId): ReactNode => {
  switch (step) {
    case 'select-hub':
      return <>Select a hub to migrate your position on{chainChip(chainId)}</>;
    case 'review':
      return <>Review and confirm your migration on{chainChip(chainId)}</>;
    case 'loading':
      return (
        <Skeleton variant="rectangular" width={370} height={17} sx={{ borderRadius: '0.5rem' }} />
      );
  }
};

const Control = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <Typography variant="caption" color="fg-3" sx={{ minWidth: '2.5rem' }}>
      {label}
    </Typography>
    <StyledTxModalToggleGroup
      value={value}
      exclusive
      onChange={(_, next: T | null) => next !== null && onChange(next)}
      aria-label={label}
      sx={{ width: 'auto', display: 'inline-grid', gridAutoFlow: 'column', gridAutoColumns: '1fr' }}
    >
      {options.map((option) => (
        <StyledTxModalToggleButton key={option.value} value={option.value} sx={{ px: 2.5 }}>
          <Typography variant="h5" noWrap>
            {option.label}
          </Typography>
        </StyledTxModalToggleButton>
      ))}
    </StyledTxModalToggleGroup>
  </Box>
);

const FlowHeaderDemo = () => {
  const [step, setStep] = useState<Step>('select-hub');
  const [chainId, setChainId] = useState<ChainId>(ChainId.mainnet);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem' }}>
        <Control label="Step" value={step} options={STEPS} onChange={setStep} />
        <Control label="Chain" value={chainId} options={CHAINS} onChange={setChainId} />
      </Box>
      <FlowHeader title="Migrate" subheading={subheadingFor(step, chainId)} />
    </Box>
  );
};

export const MigrationFlowSection = () => (
  <Section
    title="Migration flow"
    description="Pieces for the migrate flow's pages, ported from Aave Pro. FlowHeader animates its step line whenever the step text changes. Only the hub-selection copy is from Figma; the other steps are placeholders until they're designed."
  >
    <Specimen label="FlowHeader — switch the step or chain to see the step line animate" fullWidth>
      <FlowHeaderDemo />
    </Specimen>
    <Specimen label="SearchInput — large, the hub list's search" fullWidth>
      <SearchInput
        size="large"
        placeholder="Search earn hubs"
        onSearchTermChange={() => undefined}
        wrapperSx={{ width: '100%', maxWidth: '33.5rem' }}
      />
    </Specimen>
  </Section>
);
