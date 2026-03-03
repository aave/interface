import { Button, Typography } from '@mui/material';

import { BaseModalProps, ClaimRewardsModalProps } from '../types';
import { Actions, Content, Dialog, Header } from './styles';

type Props = BaseModalProps & ClaimRewardsModalProps;

export default function ClaimRewardsModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Header>
        <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.87)' }}>
          Claim rewards
        </Typography>
      </Header>

      <Content>
        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.87)' }}>
          You have no rewards to claim at this time
        </Typography>
      </Content>

      <Actions>
        <Button variant="text" color="primary" onClick={onClose}>
          close
        </Button>
        <Button variant="text" color="primary" disabled>
          Claim
        </Button>
      </Actions>
    </Dialog>
  );
}
