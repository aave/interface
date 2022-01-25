import { ChainId, EthereumTransactionTypeExtended, Pool } from '@aave/contract-helpers';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
// import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useConnectionStatusContext } from 'src/hooks/useConnectionStatusContext';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { EthTransactionData, sendEthTx, TxStatusType } from 'src/utils/sendTxHelper';
import { SupplyState } from './Supply';

export type SupplyActionProps = {
  setSupplyStep: (step: SupplyState) => void;
  supplyStep: SupplyState;
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  mainTxType?: string;
  onClose: () => void;
};

export const SupplyActions = ({
  setSupplyStep,
  supplyStep,
  amountToSupply,
  poolReserve,
  mainTxType,
  onClose,
}: SupplyActionProps) => {
  const { signTxData, switchNetwork, getTxError, sendTx } = useWeb3Context();
  // const { refechIncentiveData, refetchPoolData, refetchWalletBalances } =
  //   useBackgroundDataProvider();
  const { isRPCActive } = useConnectionStatusContext();
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();

  // error
  const [txError, setTxError] = useState<undefined | string | Error>();

  // tx obj
  const [approveTxData, setApproveTxData] = useState({} as EthTransactionData);
  const [actionTxData, setActionTxData] = useState({} as EthTransactionData);

  // Permit states
  const [signature, setSignature] = useState();
  const [permitError, setPermitError] = useState<string | null>(null);

  // Custom gas
  const [customGasPrice, setCustomGasPrice] = useState<string | null>(null);

  const [depositWithPermitEnabled, setDepositWithPermitEnable] = useState(
    currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet
  );

  // Get approve and supply transactions without using permit flow
  const handleGetTransactions = async () => {
    let txs: EthereumTransactionTypeExtended[];
    try {
      if (currentMarketData.v3) {
        // TO-DO: No need for this cast once a single Pool type is used in use-tx-builder-context
        const newPool: Pool = lendingPool as Pool;
        txs = await newPool.supply({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
        });
      } else {
        txs = await lendingPool.deposit({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
        });
      }
      const approvalTx = txs.find((tx) => tx.txType === 'ERC20_APPROVAL');
      const actionTx = txs.find((tx) => ['DLP_ACTION'].includes(tx.txType));

      if (approvalTx) {
        setApproveTxData({
          txType: approvalTx.txType,
          unsignedData: approvalTx.tx,
          gas: approvalTx.gas,
          // name: 'Approve', // TODO: put this into translations?
        });
      }
      if (actionTx) {
        setActionTxData({
          txType: actionTx.txType,
          unsignedData: actionTx.tx,
          gas: actionTx.gas,
          // name: mainTxName,
        });
      }
      // TODO: not supper sure this is needed or
      // if we should conditional here
      setSupplyStep(SupplyState.approval);

      return true;
    } catch (error) {
      setTxError(error);
      setSupplyStep(SupplyState.error);
    }
  };

  // useEffect(() => {
  //   handleGetTransactions();
  // }, []);

  // Generate supply transaction with signed permit
  const handleSupplyWithPermit = async () => {
    // TO-DO: No need for this cast once a single Pool type is ued in use-tx-builder-context
    const newPool: Pool = lendingPool as Pool;
    if (signature) {
      try {
        const supplyPermitTx = await newPool.supplyWithPermit({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
          signature,
        });
        setActionTxData({
          txType: supplyPermitTx[0].txType,
          unsignedData: supplyPermitTx[0].tx,
          gas: supplyPermitTx[0].gas,
          // name: mainTxName,
        });
      } catch (error) {
        // Manage / set error
      }
    }
  };

  const handleApprovalTx = async () => {
    if (depositWithPermitEnabled) {
      const newPool: Pool = lendingPool as Pool;
      try {
        const unsingedPayload = await newPool.signERC20Approval({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
        });

        const signature = await signTxData(unsingedPayload);
        setSignature(signature);
        setPermitError(null);
        setSupplyStep(SupplyState.sendTx);
      } catch (error) {
        setPermitError('Error initializing permit signature');
      }
    } else {
      if (approveTxData && approveTxData.unsignedData) {
        // TODO: how to fix this typo
        sendEthTx(approveTxData.unsignedData, setApproveTxData, customGasPrice, sendTx, getTxError);
      }
    }
  };

  // TODO: what to do with callbacks?? should b enough with state
  const handleSendMainTx = async () => {
    await handleGetTransactions();
    if (actionTxData && actionTxData.unsignedData) {
      sendEthTx(actionTxData.unsignedData, setActionTxData, customGasPrice, sendTx, getTxError);
    } else {
    }
  };

  // Approval state
  useEffect(() => {
    if (supplyStep === SupplyState.approval) {
      if (!depositWithPermitEnabled) {
        if (actionTxData.txStatus === TxStatusType.submitted) {
          // approval tx submitted
          // TODO: set tx link with actionTxData.txHash
        } else if (actionTxData.txStatus === TxStatusType.confirmed && actionTxData.txReceipt) {
          // supply tx finished with success
          setSupplyStep(SupplyState.sendTx);
        } else if (actionTxData.txStatus === TxStatusType.error) {
          setSupplyStep(SupplyState.error);
          setTxError(actionTxData.error);
        }
      }
    }
  }, [approveTxData?.txStatus]);

  // Approval state
  useEffect(() => {
    if (supplyStep === SupplyState.sendTx) {
      if (actionTxData.txStatus === TxStatusType.submitted) {
        // supply tx submitted
        // TODO: set tx link with actionTxData.txHash
      } else if (actionTxData.txStatus === TxStatusType.confirmed && actionTxData.txReceipt) {
        // supply tx finished with success
        setSupplyStep(SupplyState.success);
      } else if (actionTxData.txStatus === TxStatusType.error) {
        setSupplyStep(SupplyState.error);
        setTxError(actionTxData.error);
        // Maybe check here if error was in permit to give link to try again with approval
      }
    }
  }, [actionTxData?.txStatus]);

  // After tx finishes force refresh
  // const handleMainTxConfirmed = () => {
  //   if (isRPCActive) {
  //     refechIncentiveData && refechIncentiveData();
  //     refetchPoolData && refetchPoolData();
  //     refetchWalletBalances();
  //   }
  // };

  // TODO: provably need to change this to add
  // breadCrums
  // tx gas estimator
  // how to show ehterscan tx link???
  console.log('state::: ', supplyStep);
  useEffect(() => {
    if (chainId !== connectedChainId) {
      setSupplyStep(SupplyState.networkMisMatch);
    }
  }, []);

  switch (supplyStep) {
    case SupplyState.amountInput:
      return <Button onClick={handleGetTransactions}>Confirm Amount</Button>;
    case SupplyState.approval:
      return <Button onClick={handleApprovalTx}>Approve</Button>;
    case SupplyState.sendTx:
      return <Button onClick={handleSendMainTx}>Send Tx</Button>;
    case SupplyState.success:
      return <Button onClick={onClose}>Close</Button>;
    case SupplyState.error:
      return <div>Add here the error stuff</div>;
    case SupplyState.networkMisMatch:
      return <Button onClick={() => switchNetwork(chainId)}>ChangeNetwork</Button>;
  }
};
