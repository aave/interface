import { Button, Typography } from '@mui/material';
import { useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const ModalDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <BasicModal open={open} setOpen={setOpen}>
        <Typography variant="h2" sx={{ mb: 4 }}>
          Modal title
        </Typography>
        <Typography variant="description" color="text.secondary">
          BasicModal renders the Paper &quot;modal&quot; variant plus the themed backdrop and close
          icon.
        </Typography>
      </BasicModal>
    </>
  );
};

export const OverlaysSection = () => (
  <Section title="Overlays & modal">
    <Specimen label="BasicModal">
      <ModalDemo />
    </Specimen>

    <Specimen label="ContentWithTooltip (click)">
      <ContentWithTooltip
        tooltipContent={<Typography variant="tooltip">Tooltip body content.</Typography>}
      >
        <Typography variant="main14" sx={{ borderBottom: '1px dashed', cursor: 'pointer' }}>
          Click me
        </Typography>
      </ContentWithTooltip>
    </Specimen>

    <Specimen label="TextWithTooltip">
      <TextWithTooltip text="Supply APY">
        <Typography variant="tooltip">Explanation of the metric goes here.</Typography>
      </TextWithTooltip>
    </Specimen>
  </Section>
);
