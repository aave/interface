import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Contract } from 'ethers';
import { useEffect } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import MULTI_FEE_ABI from 'src/maneki/modules/manage/MultiFeeABI';
import { ManekiModalChildProps } from 'src/maneki/utils/ManekiModalWrapper';
import { TxAction } from 'src/ui-config/errorMapping';

import LoveManeki from '/public/loveManeki.svg';

import { marketsData } from '../../../ui-config/marketsConfig';

export const ManageClaimAllVest = ({ symbol, isWrongNetwork, action }: ManekiModalChildProps) => {
  const { provider, currentAccount } = useWeb3Context();
  const { setMainTxState, setTxError } = useModalContext();
  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;
  const theme = useTheme();
  useEffect(() => {
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);

    const promises = [];

    setMainTxState({ loading: true });
    promises.push(contract.exit(false)); // claim vested and unlocked

    // call promise all nad handle sucess error
    Promise.all(promises)
      .then(() => {
        setMainTxState({
          loading: false,
          success: true,
        });
      })
      .catch((error) => {
        setMainTxState({
          loading: false,
          success: false,
        });
        setTxError({
          blocking: false,
          actionBlocked: false,
          error: <Trans>Claim Failed</Trans>,
          rawError: error,
          txAction: TxAction.MAIN_ACTION,
        });
      });
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
        <Trans>Claiming All Vests</Trans>
      </Typography>
      <CircularProgress />
    </Box>
  );
};
