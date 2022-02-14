import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import Typography from '@mui/material/Typography';

import { BasicModal } from '../primitives/BasicModal';
import { Link } from '../primitives/Link';

interface IsolatedAssetModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export const IsolatedAssetModal = ({ open, setOpen }: IsolatedAssetModalProps) => {
  return (
    <BasicModal open={open} setOpen={setOpen}>
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            <Trans>Isolated asset</Trans>
          </Typography>
          <Typography>
            <Trans>
              Some newly listed assets have limited exposure until the Aave governance decides
              otherwise.
            </Trans>
          </Typography>
        </Box>

        <Box component="aside" sx={{ mb: 4 }}>
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
              To exit isolation mode, you will need to repay all your borrowed positions and turn
              off the isolated asset being used as collateral from your dashboard.
            </Trans>
          </Typography>
        </Box>

        <Typography variant="subheader2" color="text.secondary">
          Learn more in our{' '}
          <Link href="https://docs.aave.com/faq/" fontWeight={500}>
            FAQ guide
          </Link>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
          <Button variant="contained" onClick={() => setOpen(false)}>
            <Trans>Ok, I got it</Trans>
          </Button>
        </Box>
      </Box>
    </BasicModal>
  );
};
