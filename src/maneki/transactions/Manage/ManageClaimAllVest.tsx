import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Contract } from 'ethers';
import Image from 'next/image';
import { useEffect } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ManekiModalChildProps } from 'src/maneki/components/ManekiModalWrapper';
import { useManageContext } from 'src/maneki/hooks/manage-data-provider/ManageDataProvider';
import MULTI_FEE_ABI from 'src/maneki/modules/manage/MultiFeeABI';
import { TxAction } from 'src/ui-config/errorMapping';

import { marketsData } from '../../../ui-config/marketsConfig';

export const ManageClaimAllVest = ({ symbol, isWrongNetwork, action }: ManekiModalChildProps) => {
  const { provider, currentAccount } = useWeb3Context();
  const { setMainTxState, setTxError } = useModalContext();
  const { setTopPanelLoading, setMainActionsLoading, setQuickActionsLoading } = useManageContext();
  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;
  useEffect(() => {
    const handleClaimAllVest = async () => {
      const signer = provider?.getSigner(currentAccount as string);
      const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);
      try {
        const promises = await contract.exit(false);
        await promises.wait(1);
        setMainTxState({
          loading: false,
          success: true,
        });
        setTopPanelLoading(true);
        setMainActionsLoading(true);
        setQuickActionsLoading(true);
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
    handleClaimAllVest();
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
      <Image
        src={'/maneki-logo-center.png'}
        width={'200px'}
        height={'200px'}
        alt="maneki cat in 3d"
      />
      <Typography variant="h3" sx={{ color: 'text.secondary' }}>
        <Trans>Claiming All Vests</Trans>
      </Typography>
      <CircularProgress />
    </Box>
  );
};
