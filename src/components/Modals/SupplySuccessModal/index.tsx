import { ArrowForward, Check } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';

import { BaseModalProps, SupplySuccessModalProps } from '../types';
import {
  AddToWalletRow,
  ButtonsColumn,
  CheckCircle,
  Dialog,
  ModalCard,
  TitleSection,
} from './styles';

type Props = BaseModalProps & SupplySuccessModalProps;

export default function SupplySuccessModal({ open, onClose, amount, token }: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <ModalCard>
        <CheckCircle>
          <Check sx={{ color: '#80FF00', fontSize: 40 }} />
        </CheckCircle>

        <TitleSection>
          <Typography variant="h4" textAlign="center">
            All done
          </Typography>
          <Typography variant="h5" textAlign="center">
            You Supplied {amount} {token}
          </Typography>
        </TitleSection>

        <AddToWalletRow>
          <Typography variant="subtitle1" textAlign="center">
            Add aToken to wallet to track your balance.
          </Typography>
          <Button variant="contained" size="small" endIcon={<ArrowForward fontSize="small" />}>
            Add to wallet
          </Button>
        </AddToWalletRow>

        <ButtonsColumn>
          <Button variant="contained" size="large" fullWidth onClick={onClose}>
            Ok, close
          </Button>
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.16)' },
            }}
          >
            view details
          </Button>
        </ButtonsColumn>
      </ModalCard>
    </Dialog>
  );
}
