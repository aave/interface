import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Contract, utils } from 'ethers';
import { useEffect } from 'react';
// import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import EARLY_TOKEN_GENERATION_ABI from 'src/maneki/abi/earlyTokenGenerationABI';
import { useTGEContext } from 'src/maneki/hooks/tge-data-provider/TGEDataProvider';
import { TxAction } from 'src/ui-config/errorMapping';
import { marketsData } from 'src/ui-config/marketsConfig';

import LoveManeki from '/public/loveManeki.svg';

interface TGEModalActionsProps {
  action?: string;
  symbol: string;
  amount: string;
  isWrongNetwork: boolean;
}

export const TGEModalActions = ({
  action,
  symbol,
  amount,
  isWrongNetwork,
}: TGEModalActionsProps) => {
  const { provider, currentAccount } = useWeb3Context();
  const { setMainTxState, setTxError } = useModalContext();
  const { setTGELoading } = useTGEContext();
  const EARLY_TOKEN_GENERATION_ADDR = marketsData.bsc_testnet_v3.addresses
    .EARLY_TOKEN_GENERATION as string;
  const theme = useTheme();
  useEffect(() => {
    const handleContribution = async () => {
      const signer = provider?.getSigner(currentAccount as string);
      const contract = new Contract(
        EARLY_TOKEN_GENERATION_ADDR,
        EARLY_TOKEN_GENERATION_ABI,
        signer
      );
      try {
        const promise = await contract.deposit(currentAccount, '', {
          value: utils.parseEther(amount),
        });
        await promise.wait(1);
        setMainTxState({
          loading: false,
          success: true,
        });
        setTGELoading(true);
      } catch (error) {
        setMainTxState({
          loading: false,
          success: false,
        });
        setTxError({
          blocking: false,
          actionBlocked: false,
          error: <Trans>Contribute Failed</Trans>,
          rawError: error,
          txAction: TxAction.MAIN_ACTION,
        });
      }
    };
    handleContribution();
  }, []);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        gap: 4,
      }}
    >
      {/* Unused Param */}
      {symbol && isWrongNetwork && action}
      <LoveManeki
        style={{
          width: '100px',
          height: 'auto',
          fill: theme.palette.text.secondary,
        }}
      />
      <Typography variant="h3" sx={{ m: 6, color: 'text.secondary' }}>
        <Trans>Pending Transaction...</Trans>
      </Typography>
      <CircularProgress />
    </Box>
  );
};
