import { Close, ContentCopy, Logout } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { useCallback, useState } from 'react';

import { BaseModalProps, WalletModalProps } from '../types';
import {
  AddressRow,
  AvatarCircle,
  Balance,
  CloseButton,
  CopyButton,
  Dialog,
  DisconnectButton,
  Header,
} from './styles';

type Props = BaseModalProps & WalletModalProps;

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function WalletModal({ open, onClose, address }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Header>
        <Typography variant="subtitle1" fontWeight={600} color="background.default">
          Connected
        </Typography>
        <CloseButton onClick={onClose}>
          <Close fontSize="small" />
        </CloseButton>
      </Header>

      <AvatarCircle />

      <AddressRow>
        <Typography variant="body1" color="background.default">
          {shortenAddress(address)}
        </Typography>
        <CopyButton onClick={handleCopy}>
          <ContentCopy fontSize="small" />
        </CopyButton>
      </AddressRow>
      {copied && (
        <Typography variant="caption" color="primary" textAlign="center" display="block">
          Copied!
        </Typography>
      )}

      <Balance variant="body1">0.00 ETH</Balance>

      <DisconnectButton variant="contained" color="secondary" size="small" startIcon={<Logout />}>
        DISCONNECT
      </DisconnectButton>
    </Dialog>
  );
}
