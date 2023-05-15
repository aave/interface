import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Contract } from 'ethers';
import { useEffect, useState } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import MANEKI_DATA_PROVIDER_ABI from 'src/maneki/modules/manage/DataABI';
import MULTI_FEE_ABI from 'src/maneki/modules/manage/MultiFeeABI';
import {
  Claimables,
  ClaimablesTuple,
  convertClaimables,
} from 'src/maneki/modules/manage/utils/manageActionHelper';
import { ManekiModalChildProps } from 'src/maneki/utils/ManekiModalWrapper';
import { TxAction } from 'src/ui-config/errorMapping';

import LoveManeki from '/public/loveManeki.svg';

import { marketsData } from '../../../ui-config/marketsConfig';

export const ManageClaimAll = ({ symbol, isWrongNetwork, action }: ManekiModalChildProps) => {
  const { provider, currentAccount } = useWeb3Context();
  const { setMainTxState, setTxError } = useModalContext();
  const [claimables, setClaimables] = useState<Claimables[]>([]);
  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;
  const theme = useTheme();
  useEffect(() => {
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);
    const promises = [];
    promises.push(contract.getClaimableRewards(currentAccount));
    setMainTxState({ loading: true });
    Promise.all(promises)
      .then((data) => {
        setClaimables(convertClaimables(data[0] as ClaimablesTuple[]));
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

  useEffect(() => {
    if (claimables.length === 0) return;
    const handleClaimAll = async () => {
      const signer = provider?.getSigner(currentAccount as string);
      const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);
      try {
        const promises = await contract.getReward(claimables.map((e) => e.token));
        await promises.wait(1);
        setMainTxState({
          loading: false,
          success: true,
        });
      } catch (error) {
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
      }
    };
    handleClaimAll();
  }, [claimables]);
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
        <Trans>Claiming All Rewards</Trans>
      </Typography>
      <CircularProgress />
    </Box>
  );
};
