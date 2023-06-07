import { Paper, Typography } from '@mui/material';
import * as React from 'react';

const TGEPhaseInfo = () => {
  return (
    <>
      <Paper>
        <Typography variant="h2">Whitelist Phase</Typography>
        <Typography>
          For the first 24 hours, 6 million PAW tokens (6% of the supply) are available for
          whitelist participates at the fixed price of 0.0002 ETH(~$0.36) and the FDV of ~$36m with
          a market cap of ~$6.8m. Whitelist addresses are selected from historic vault users,
          traders and contributors. The allocation of each whitelist address depends on the historic
          activities. First 30 mins of the whitelist phase has a max deposit limit of 1 ETH for each
          address. Participation is on a first come first served basis and will end early if all the
          allocation is filled. Please note that being whitelisted does not guarantee a spot if all
          the allocation is filled early.
        </Typography>
      </Paper>
      <Paper>
        <Typography variant="h2">Important Risks</Typography>
        <Typography>
          U.S. residents or citizens are not permitted to participant in the Token Generation Event
          (TGE). By taking part in the event you certify you are neither a U.S. citizen or resident.
        </Typography>
      </Paper>
    </>
  );
};

export default TGEPhaseInfo;
