import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { ApySparkline } from 'src/components/charts/ApySparkline';
import { SparklineChart } from 'src/components/charts/SparklineChart';
import { figVars } from 'src/utils/figmaColors';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const HISTORY = Array.from({ length: 120 }, (_, i) => ({
  date: new Date(Date.UTC(2026, 6, 1, i * 6)),
  value: 6 + Math.sin(i / 9) * 0.4 + Math.sin(i * 1.7) * 0.12,
}));

const Frame = ({ width, children }: { width: string; children: ReactNode }) => (
  <Box sx={{ width: '100%', maxWidth: width, pt: '1rem' }}>{children}</Box>
);

export const ChartsSection = () => (
  <Section
    title="Charts"
    description="Charts ported from Aave Pro. The sparkline family is in; the line, multiline, range bar and dot charts follow when they replace ours."
  >
    <Specimen label="SparklineChart — area and pulsing end dot" fullWidth>
      <Frame width="20rem">
        <SparklineChart data={HISTORY} />
      </Frame>
    </Specimen>
    <Specimen label="SparklineChart — loading" fullWidth>
      <Frame width="20rem">
        <SparklineChart loading />
      </Frame>
    </Specimen>
    <Specimen label="ApySparkline — dashed average with label, left fade" fullWidth>
      <Frame width="15.5rem">
        <ApySparkline
          history={HISTORY}
          color={figVars['data-purple']}
          baselineLabel="7D avg."
          fadeLeft
        />
      </Frame>
    </Specimen>
    <Specimen label="ApySparkline — loading" fullWidth>
      <Frame width="15.5rem">
        <ApySparkline loading color={figVars['data-purple']} baselineLabel="7D avg." fadeLeft />
      </Frame>
    </Specimen>
  </Section>
);
