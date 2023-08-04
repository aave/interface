import { Button, CircularProgress } from '@mui/material';
import { BigNumber, Contract } from 'ethers';
import React from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import LENDING_PROTOCOL_DATA_PROVIDER_ABI from 'src/maneki/abi/lendingProtocolDataProviderABI';
import MANEKI_LEVERAGER_V2_ABI from 'src/maneki/abi/leveragerV2ABI';
import PROXY_TOKEN_ABI from 'src/maneki/abi/proxyTokenABI';
import VARIABLE_DEBT_TOKEN_ABI from 'src/maneki/abi/variableDebtTokenABI';
import {
  IBorrowAssets,
  useLeverageContext,
} from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';
import { manekiParseUnits } from 'src/maneki/utils/stringConverter';
import { marketsData } from 'src/ui-config/marketsConfig';

interface IReserveTokensAddr {
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
}

interface IApprovals {
  collateral: boolean;
  unstable: boolean;
  stable: boolean;
}

export default function LeverageActionButton({ amount }: { amount: string }) {
  const { provider, currentAccount } = useWeb3Context();
  const {
    currentCollateral,
    leverage,
    borrowAssets,
    borrowAmount,
    ratio,
    setTxStatus,
    setAssetsLoading,
  } = useLeverageContext();
  const [loading, setLoading] = React.useState(false);
  const [variableAddresses, setVariableAddresses] = React.useState<IBorrowAssets>({
    unstable: '',
    stable: '',
  });
  const [approvals, setApprovals] = React.useState<IApprovals>({
    collateral: true,
    unstable: true,
    stable: true,
  });
  const LEVERAGER_V2_ADDR = marketsData.arbitrum_mainnet_v3.addresses.LEVERAGER_V2 as string;
  const PROTOCOL_DATA_PROVIDER_ADDR = marketsData.arbitrum_mainnet_v3.addresses
    .LENDING_PROTOCOL_DATA_PROVIDER as string;

  const handleButtonClick = async () => {
    setLoading(true);
    if (approvals.collateral) await handleCollateralApproval();
    if (!approvals.collateral && approvals.unstable) await handleUnstableApproval();
    if (!approvals.unstable && approvals.stable) await handleStableApproval();
    if (approvals.collateral || approvals.unstable || approvals.stable) {
      setLoading(false);
      return;
    }

    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(LEVERAGER_V2_ADDR, MANEKI_LEVERAGER_V2_ABI, signer);
    const convertedAmount = manekiParseUnits(amount, currentCollateral.decimals);
    try {
      const promise = await contract.leverageGlp(
        currentCollateral.address,
        convertedAmount,
        [borrowAssets.unstable, borrowAssets.stable],
        ratio,
        leverage
      );
      await promise.wait(1);
      setTxStatus({ status: 'success', message: 'Transaction Successful.', hash: promise.hash });
      setAssetsLoading(true);
      console.log('Transaction Promise:', promise);
    } catch (error) {
      setTxStatus({ status: 'error', message: error.message });
      console.log('Transaction Error:', error.message);
    }
    setLoading(false);
  };

  const handleCollateralApproval = async () => {
    const signer = provider?.getSigner(currentAccount);
    const contract = new Contract(currentCollateral.address, PROXY_TOKEN_ABI, signer);
    const amountBN = BigNumber.from(manekiParseUnits(amount, currentCollateral.decimals));
    try {
      const promise = await contract.approve(LEVERAGER_V2_ADDR, amountBN);
      await promise.wait(1);
      setApprovals((prevState) => ({ ...prevState, collateral: false }));
      setTxStatus({ status: 'approve', message: 'Approval Successful.', hash: promise.hash });
    } catch (error) {
      setTxStatus({ status: 'error', message: error.message });
      console.log('Approve Collateral Error:', error.message);
    }
  };

  const handleUnstableApproval = async () => {
    const signer = provider?.getSigner(currentAccount);
    const unstableContract = new Contract(
      variableAddresses.unstable,
      VARIABLE_DEBT_TOKEN_ABI,
      signer
    );

    try {
      const promise = await unstableContract.approveDelegation(
        LEVERAGER_V2_ADDR,
        borrowAmount.unstable
      );
      await promise.wait(1);
      setApprovals((prevState) => ({ ...prevState, unstable: false }));
      setTxStatus({ status: 'approve', message: 'Approval Successful.', hash: promise.hash });
    } catch (error) {
      setTxStatus({ status: 'error', message: error.message });
      console.log('Unstable Variable Approval Error:', error.message);
    }
  };

  const handleStableApproval = async () => {
    const signer = provider?.getSigner(currentAccount);
    const stableContract = new Contract(variableAddresses.stable, VARIABLE_DEBT_TOKEN_ABI, signer);
    try {
      const promise = await stableContract.approveDelegation(
        LEVERAGER_V2_ADDR,
        borrowAmount.stable
      );
      await promise.wait(1);
      setApprovals((prevState) => ({ ...prevState, stable: false }));
      setTxStatus({ status: 'approve', message: 'Approval Successful.', hash: promise.hash });
    } catch (error) {
      setTxStatus({ status: 'error', message: error.message });
      console.log('Stable Variable Approval Error:', error.message);
    }
  };

  React.useEffect(() => {
    const contract = new Contract(
      PROTOCOL_DATA_PROVIDER_ADDR,
      LENDING_PROTOCOL_DATA_PROVIDER_ABI,
      provider
    );
    const promises = [];

    promises.push(contract.getReserveTokensAddresses(borrowAssets.unstable));
    promises.push(contract.getReserveTokensAddresses(borrowAssets.stable));

    Promise.all(promises)
      .then((data: IReserveTokensAddr[]) => {
        setVariableAddresses({
          unstable: data[0].variableDebtTokenAddress,
          stable: data[1].variableDebtTokenAddress,
        });
      })
      .catch((e) => console.log(e));
  }, [provider, borrowAssets, PROTOCOL_DATA_PROVIDER_ADDR]);

  React.useEffect(() => {
    if (
      (!provider || !currentAccount || currentCollateral.address === '',
      variableAddresses.unstable === '' || variableAddresses.stable === '')
    )
      return;

    const collateralContract = new Contract(currentCollateral.address, PROXY_TOKEN_ABI, provider);
    const unstableContract = new Contract(
      variableAddresses.unstable,
      VARIABLE_DEBT_TOKEN_ABI,
      provider
    );
    const stableContract = new Contract(
      variableAddresses.stable,
      VARIABLE_DEBT_TOKEN_ABI,
      provider
    );
    const promises = [];

    promises.push(collateralContract.allowance(currentAccount, LEVERAGER_V2_ADDR));
    promises.push(unstableContract.borrowAllowance(currentAccount, LEVERAGER_V2_ADDR));
    promises.push(stableContract.borrowAllowance(currentAccount, LEVERAGER_V2_ADDR));
    Promise.all(promises)
      .then((data: BigNumber[]) => {
        const apprv = {
          collateral: true,
          unstable: true,
          stable: true,
        };
        const currentAmountBN = BigNumber.from(
          manekiParseUnits(amount, currentCollateral.decimals)
        );
        data[0].lt(currentAmountBN) ? (apprv.collateral = true) : (apprv.collateral = false);
        data[1].lt(borrowAmount.unstable) ? (apprv.unstable = true) : (apprv.unstable = false);
        data[2].lt(borrowAmount.stable) ? (apprv.stable = true) : (apprv.stable = false);
        setApprovals(apprv);
      })
      .catch((error) => console.log('Checking Allowance Error: ', error.message));
  }, [
    provider,
    currentCollateral,
    amount,
    leverage,
    borrowAmount,
    variableAddresses,
    currentAccount,
    LEVERAGER_V2_ADDR,
  ]);

  return (
    <Button
      variant={'contained'}
      sx={{ width: '100%', borderRadius: '15px' }}
      onClick={handleButtonClick}
      disabled={BigNumber.from(manekiParseUnits(amount, currentCollateral.decimals)).lte(0)}
    >
      {loading ? (
        <CircularProgress size={24} sx={{ color: 'background.default' }} />
      ) : approvals.collateral || approvals.unstable || approvals.stable ? (
        'Approve'
      ) : (
        'Confirm'
      )}
    </Button>
  );
}
