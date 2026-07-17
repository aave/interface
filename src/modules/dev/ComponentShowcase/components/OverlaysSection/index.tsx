import { Button, Menu, MenuItem, Select, Typography } from '@mui/material';
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

const SelectDemo = () => {
  const [value, setValue] = useState('ethereum');
  return (
    <Select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      size="small"
      sx={{ minWidth: 180 }}
    >
      <MenuItem value="ethereum">Ethereum</MenuItem>
      <MenuItem value="optimism">Optimism</MenuItem>
      <MenuItem value="arbitrum">Arbitrum</MenuItem>
    </Select>
  );
};

const MenuDemo = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const close = () => setAnchorEl(null);
  return (
    <>
      <Button variant="outlined" color="primary" onClick={(e) => setAnchorEl(e.currentTarget)}>
        Open menu
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem onClick={close}>First option</MenuItem>
        <MenuItem onClick={close}>Second option</MenuItem>
        <MenuItem onClick={close}>Third option</MenuItem>
      </Menu>
    </>
  );
};

export const OverlaysSection = () => (
  <Section title="Overlays & modal">
    <Specimen label="BasicModal">
      <ModalDemo />
    </Specimen>

    <Specimen label="Select (menu pop)">
      <SelectDemo />
    </Specimen>

    <Specimen label="Menu (dropdown pop)">
      <MenuDemo />
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
