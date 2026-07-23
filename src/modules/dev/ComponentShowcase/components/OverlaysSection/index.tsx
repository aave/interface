import { Button, Menu, MenuItem, Typography } from '@mui/material';
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
        <Typography variant="description" color="fg-2">
          BasicModal renders the Paper &quot;modal&quot; variant plus the themed backdrop and close
          icon.
        </Typography>
      </BasicModal>
    </>
  );
};

const MenuDemo = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);
  return (
    <>
      {/* aria-expanded lets the outlined trigger keep the open/active fill (secondaryPillStyle
          keys off it) — MUI does not set it automatically for Menu triggers. */}
      <Button
        variant="outlined"
        color="primary"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Open menu
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={close} disablePortal>
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

    <Specimen label="Menu (dropdown pop)">
      <MenuDemo />
    </Specimen>

    <Specimen label="ContentWithTooltip (click)">
      <ContentWithTooltip
        tooltipContent={<Typography variant="caption">Tooltip body content.</Typography>}
      >
        <Typography variant="subheader1" sx={{ borderBottom: '1px dashed', cursor: 'pointer' }}>
          Click me
        </Typography>
      </ContentWithTooltip>
    </Specimen>

    <Specimen label="TextWithTooltip">
      <TextWithTooltip text="Supply APY">
        <Typography variant="caption">Explanation of the metric goes here.</Typography>
      </TextWithTooltip>
    </Specimen>
  </Section>
);
