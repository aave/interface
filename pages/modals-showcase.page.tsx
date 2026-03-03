import { Box, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import BorrowModal from 'src/components/Modals/BorrowModal';
import ClaimRewardsModal from 'src/components/Modals/ClaimRewardsModal';
import { WALLET_ADDRESS } from 'src/components/Modals/const';
import RepayModal from 'src/components/Modals/RepayModal';
import SettingsMenu from 'src/components/Modals/SettingsMenu';
import SupplySuccessModal from 'src/components/Modals/SupplySuccessModal';
import WalletModal from 'src/components/Modals/WalletModal';
import WithdrawModal from 'src/components/Modals/WithdrawModal';

export default function ModalsShowcase() {
  const [walletOpen, setWalletOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [supplySuccessOpen, setSupplySuccessOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);

  return (
    <Box sx={{ p: 6, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant="h4" mb={4}>
        Modals & Dropdowns Showcase
      </Typography>

      <Typography variant="h6" mb={2} color="text.secondary">
        Dialogs
      </Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap" mb={4}>
        <Button variant="contained" onClick={() => setWalletOpen(true)}>
          Connected Wallet
        </Button>
        <Button variant="contained" onClick={() => setClaimOpen(true)}>
          Claim Rewards
        </Button>
        <Button variant="contained" onClick={() => setSupplySuccessOpen(true)}>
          Supply Success
        </Button>
        <Button variant="contained" onClick={() => setWithdrawOpen(true)}>
          Withdraw
        </Button>
        <Button variant="contained" onClick={() => setBorrowOpen(true)}>
          Borrow
        </Button>
        <Button variant="contained" onClick={() => setRepayOpen(true)}>
          Repay
        </Button>
      </Stack>

      <Typography variant="h6" mb={2} color="text.secondary">
        Dropdowns
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={(e) => setSettingsAnchor(e.currentTarget)}>
          Settings Menu
        </Button>
      </Stack>

      <WalletModal
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        address={WALLET_ADDRESS}
      />
      <ClaimRewardsModal open={claimOpen} onClose={() => setClaimOpen(false)} />
      <SupplySuccessModal
        open={supplySuccessOpen}
        onClose={() => setSupplySuccessOpen(false)}
        amount="0.0030000"
        token="ETH"
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        token="USDT"
        balance="9.00"
      />
      <BorrowModal
        open={borrowOpen}
        onClose={() => setBorrowOpen(false)}
        token="K613"
        available="5.67"
      />
      <RepayModal
        open={repayOpen}
        onClose={() => setRepayOpen(false)}
        token="ETHx"
        balance="0.00212"
      />
      <SettingsMenu anchorEl={settingsAnchor} onClose={() => setSettingsAnchor(null)} />
    </Box>
  );
}
