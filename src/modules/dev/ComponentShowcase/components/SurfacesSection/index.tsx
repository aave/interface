import { Box, Button, Paper, Typography } from '@mui/material';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from 'src/components/TopInfoPanel/TopInfoPanelItem';
import { StakeActionBox } from 'src/modules/staking/StakeActionBox';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const PAPER_VARIANTS = ['elevation', 'outlined', 'modal', 'card'] as const;

export const SurfacesSection = () => (
  <Section title="Surfaces & cards">
    {PAPER_VARIANTS.map((variant) => (
      <Specimen key={variant} label={`Paper "${variant}"`}>
        <Paper variant={variant} sx={{ p: 4, minWidth: 160 }}>
          <Typography variant="subheader1">Paper {variant}</Typography>
        </Paper>
      </Specimen>
    ))}

    <Specimen label="ListWrapper (dashboard card shell)" fullWidth>
      <Box sx={{ width: '100%' }}>
        <ListWrapper titleComponent={<Typography variant="h3">Card title</Typography>}>
          <Box sx={{ px: 6, pb: 4 }}>
            <Row caption="Supply balance">
              <FormattedNumber value={1234.56} symbol="USD" variant="h5" />
            </Row>
            <Row caption="APY">
              <FormattedNumber value={0.0425} percent variant="h5" />
            </Row>
          </Box>
        </ListWrapper>
      </Box>
    </Specimen>

    <Specimen label="TopInfoPanel (page header — uses legacy hardcoded dark colors)" fullWidth>
      <Box sx={{ width: '100%' }}>
        <TopInfoPanel
          titleComponent={
            <Typography variant="h2" color="common.white" sx={{ mb: 4 }}>
              Showcase panel
            </Typography>
          }
        >
          <TopInfoPanelItem title="Total supplied">
            <FormattedNumber
              value={1234567}
              symbol="USD"
              compact
              variant="h4"
              color="common.white"
            />
          </TopInfoPanelItem>
          <TopInfoPanelItem title="Total borrowed">
            <FormattedNumber
              value={456789}
              symbol="USD"
              compact
              variant="h4"
              color="common.white"
            />
          </TopInfoPanelItem>
        </TopInfoPanel>
      </Box>
    </Specimen>

    <Specimen label="ReserveOverviewBox" fullWidth>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '2%', width: '100%' }}>
        <ReserveOverviewBox title="Max LTV">
          <FormattedNumber value={0.8} percent variant="h5" />
        </ReserveOverviewBox>
        <ReserveOverviewBox title="Liquidation threshold">
          <FormattedNumber value={0.825} percent variant="h5" />
        </ReserveOverviewBox>
        <ReserveOverviewBox title="Liquidation penalty">
          <FormattedNumber value={0.05} percent variant="h5" />
        </ReserveOverviewBox>
      </Box>
    </Specimen>

    <Specimen label="StakeActionBox">
      <Box sx={{ width: 280 }}>
        <StakeActionBox
          title="Staked AAVE"
          value="120.5"
          valueUSD="10450"
          bottomLineTitle="Cooldown"
          bottomLineComponent={<Typography variant="h5">—</Typography>}
          dataCy="showcaseStake"
        >
          <Button variant="contained" fullWidth>
            Stake
          </Button>
        </StakeActionBox>
      </Box>
    </Specimen>
  </Section>
);
