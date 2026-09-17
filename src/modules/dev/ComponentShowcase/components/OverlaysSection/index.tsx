import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { Row } from 'src/components/primitives/Row';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';

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
        <TxModalTitle title="Modal title" sx={{ mb: 4 }} />
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
      {/* aria-expanded lets the pill trigger keep the open/active fill (pillStyle keys off it)
          — MUI does not set it automatically for Menu triggers. */}
      <Button
        variant="tertiary"
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

const clickTrigger = (
  <Typography variant="subheader1" sx={{ borderBottom: '1px dashed', cursor: 'pointer' }}>
    Click me
  </Typography>
);

/** Sized to the widest real card row so the specimen catches wrapping, not just the surface. */
const cardContent = (
  <Box sx={{ width: '100%' }}>
    <Typography variant="caption" color="fg-2" sx={{ display: 'block', mb: 3 }}>
      A program initiated by the Aave DAO. Aave Labs does not guarantee it and accepts no liability.
    </Typography>
    <Row caption={<Typography variant="subheader2">Protocol APY</Typography>} width="100%">
      <Typography variant="subheader2">3.42%</Typography>
    </Row>
    <Row
      caption={<Typography variant="subheader2">Merit Incentives Combined (+)</Typography>}
      width="100%"
    >
      <Typography variant="subheader2">1.08%</Typography>
    </Row>
  </Box>
);

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
        {clickTrigger}
      </ContentWithTooltip>
    </Specimen>

    <Specimen label='ContentWithTooltip variant="card"'>
      <ContentWithTooltip variant="card" tooltipContent={cardContent}>
        {clickTrigger}
      </ContentWithTooltip>
    </Specimen>

    <Specimen label="TextWithTooltip">
      <TextWithTooltip text="Supply APY">
        <Typography variant="caption">Explanation of the metric goes here.</Typography>
      </TextWithTooltip>
    </Specimen>
  </Section>
);
