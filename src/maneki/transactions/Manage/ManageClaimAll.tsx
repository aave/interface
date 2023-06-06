import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { BigNumber, Contract } from 'ethers';
import { useEffect, useState } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import MANEKI_PAW_PRICE_ORACLE_ABI from 'src/maneki/abi/pawPriceOracleABI';
import MANEKI_PRICE_ORACLE_ABI from 'src/maneki/abi/priceOracleABI';
import { ManekiModalChildProps } from 'src/maneki/components/ManekiModalWrapper';
import { useManageContext } from 'src/maneki/hooks/manage-data-provider/ManageDataProvider';
import MANEKI_DATA_PROVIDER_ABI from 'src/maneki/modules/manage/DataABI';
import MULTI_FEE_ABI from 'src/maneki/modules/manage/MultiFeeABI';
import {
  Claimables,
  ClaimablesTuple,
  convertClaimables,
  PriceOracleType,
} from 'src/maneki/modules/manage/utils/manageActionHelper';
import {
  addressReserveMatching,
  addressSymbolMatching,
} from 'src/maneki/modules/manage/utils/tokenMatching';
import { TxAction } from 'src/ui-config/errorMapping';

import LoveManeki from '/public/loveManeki.svg';

import { marketsData } from '../../../ui-config/marketsConfig';

export const ManageClaimAll = ({ symbol, isWrongNetwork, action }: ManekiModalChildProps) => {
  const { provider, currentAccount } = useWeb3Context();
  const { setMainTxState, setTxError } = useModalContext();
  const { setTopPanelLoading, setMainActionsLoading, setQuickActionsLoading } = useManageContext();
  const [claimables, setClaimables] = useState<Claimables[]>([]);
  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;
  const MANEKI_PAW_PRICE_ORACLE_ADDR = marketsData.bsc_testnet_v3.addresses
    .PAW_PRICE_ORACLE as string;
  const MANEKI_PRICE_ORACLE_ADDR = marketsData.bsc_testnet_v3.addresses.PRICE_ORACLE as string;
  const theme = useTheme();
  useEffect(() => {
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);
    const pawPriceOracleContract = new Contract(
      MANEKI_PAW_PRICE_ORACLE_ADDR,
      MANEKI_PAW_PRICE_ORACLE_ABI,
      provider
    );
    const priceOracleContract = new Contract(
      MANEKI_PRICE_ORACLE_ADDR,
      MANEKI_PRICE_ORACLE_ABI,
      provider
    );
    const promises = [];
    promises.push(contract.getClaimableRewards(currentAccount));
    promises.push(pawPriceOracleContract.latestAnswer()); // PAW price in USD
    promises.push(priceOracleContract.getAssetsPrices(Object.values(addressReserveMatching)));
    setMainTxState({ loading: true });
    Promise.all(promises)
      .then((data) => {
        const priceOracleObj: PriceOracleType | undefined = {};
        const keys = Object.keys(addressSymbolMatching);
        priceOracleObj[keys[0]] = data[1] as BigNumber;
        (data[2] as BigNumber[]).map((d, i) => {
          // 8 Decimal percision
          priceOracleObj[keys[i + 1]] = d;
        });
        setClaimables(convertClaimables(data[0] as ClaimablesTuple[], priceOracleObj));
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
