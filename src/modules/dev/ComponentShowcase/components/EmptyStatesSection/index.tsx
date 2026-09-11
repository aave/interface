import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { SGhoLoggedOutPreview } from 'src/modules/sGho/SGhoLoggedOutPreview';
import { YourInfoSidebar } from 'src/modules/sGho/YourInfoSidebar';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

// A titled sub-group within the section — a full-width band with a subheader and a wrapping
// row of specimens (mirrors the grouping used in ColorsSection).
const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box sx={{ flex: '1 1 100%', mb: 8 }}>
    <Typography variant="subheader1" sx={{ mb: 4, display: 'block' }}>
      {title}
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 6 }}>
      {children}
    </Box>
  </Box>
);

/**
 * Live gallery of the app's empty-state UI (connect-wallet prompts and the no-positions
 * placeholder). The showcase page never connects a wallet, so these render in their real
 * disconnected/empty state off ambient app context — only literal/mock props are supplied.
 *
 * The Specimen stage is a flex row (children size to content), so wide/card-like empty states are
 * wrapped in a full-width box to make them span the stage the way they do on their real page.
 */
export const EmptyStatesSection = () => (
  <Section
    title="Empty states"
    description="Connect-wallet and no-positions states from across the app. Flip the theme toggle to see both schemes."
  >
    <Group title="Connect wallet">
      <Specimen label="Dashboard / general — ConnectWalletPaper" fullWidth>
        <Box sx={{ width: '100%' }}>
          <ConnectWalletPaper />
        </Box>
      </Specimen>
      <Specimen label="Custom copy — ConnectWalletPaper (history / bridge / faucet)" fullWidth>
        <Box sx={{ width: '100%' }}>
          <ConnectWalletPaper description="Connect your wallet to view transaction history." />
        </Box>
      </Specimen>
      <Specimen label="Sidebar — Your info (sGHO / reserve overview)">
        <YourInfoSidebar />
      </Specimen>
      <Specimen label="Logged-out product preview — SGhoLoggedOutPreview" fullWidth>
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <SGhoLoggedOutPreview rate={0.075} />
        </Box>
      </Specimen>
    </Group>

    <Group title="No positions">
      <Specimen label="No positions — EmptyStatePaper" fullWidth>
        <Box sx={{ width: '100%' }}>
          <EmptyStatePaper
            title="No Positions"
            description="You haven't supplied or borrowed any assets yet."
          />
        </Box>
      </Specimen>
    </Group>
  </Section>
);
