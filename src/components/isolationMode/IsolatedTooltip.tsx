import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';

import { Link } from '../primitives/Link';

// TODO: need fix text
export const IsolatedTooltip = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        {/* <Typography variant="h2" sx={{ mb: 2 }}>
          <Trans>Isolated asset</Trans>
        </Typography> */}
        <Typography>
          <Trans>
            Isolated assets have limited borrowing power and other assets cannot be used as
            collateral.
          </Trans>
        </Typography>
      </Box>

      {/* <Box component="aside" sx={{ mb: 4 }}>
        <Typography variant="subheader1" sx={{ mb: 1 }}>
          <Trans>How it works</Trans>
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <Trans>
            In Isolation mode you cannot supply other assets as collateral for borrowing. Assets
            used as collateral in Isolation mode can only be borrowed to a specific debt ceiling.
          </Trans>
        </Typography>
        <Typography>
          <Trans>
            To exit isolation mode, you will need to repay all your borrowed positions and turn off
            the isolated asset being used as collateral from your dashboard.
          </Trans>
        </Typography>
      </Box> */}

      <Typography variant="subheader2" color="text.secondary">
        <Trans>Learn more in our</Trans>
        <Link href="https://docs.aave.com/faq/" fontWeight={500}>
          <Trans>FAQ guide</Trans>
        </Link>
      </Typography>
    </Box>
  );
};
