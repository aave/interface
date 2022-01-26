import { ChainId, EthereumTransactionTypeExtended, Pool } from '@aave/contract-helpers';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useConnectionStatusContext } from 'src/hooks/useConnectionStatusContext';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { EthTransactionData, sendEthTx, TxStatusType } from 'src/utils/sendTxHelper';
import { SupplyState } from './Supply';

export type SupplyActionProps = {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  mainTxType?: string;
  onClose: () => void;
};

export const SupplyActions = ({
  amountToSupply,
  poolReserve,
  mainTxType,
  onClose,
}: SupplyActionProps) => {
  const { signTxData, switchNetwork, getTxError, sendTx } = useWeb3Context();
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();

  const [supplyStep, setSupplyStep] = useState<SupplyState>(SupplyState.amountInput);

  // error
  const [txError, setTxError] = useState<undefined | string | Error>();

  // tx obj
  const [approveTxData, setApproveTxData] = useState({} as EthTransactionData);
  const [actionTxData, setActionTxData] = useState({} as EthTransactionData);

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

      if (!approvalTx) {
        setSupplyStep(SupplyState.sendTx);
      } else if (supplyStep < SupplyState.sendTx) {
        setSupplyStep(SupplyState.approval);
      }
    } catch (error) {
      setTxError(error);
      setSupplyStep(SupplyState.error);
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

        // should it really be here?
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

        setSupplyStep(SupplyState.sendTx);
        console.log('approved');
      } catch (error) {
        setTxError('Error initializing permit signature');
        setSupplyStep(SupplyState.error);
      }
    } else {
      if (approveTxData && approveTxData.unsignedData) {
        // TODO: how to fix this typo
        sendEthTx(approveTxData.unsignedData, setApproveTxData, customGasPrice, sendTx, getTxError);
      }
    }
  };

  const handleSendMainTx = async () => {
    if (actionTxData && actionTxData.unsignedData) {
      sendEthTx(actionTxData.unsignedData, setActionTxData, customGasPrice, sendTx, getTxError);
    }
  };

  // Approval state
  useEffect(() => {
    if (supplyStep === SupplyState.approval) {
      if (!depositWithPermitEnabled) {
        if (approveTxData.txStatus === TxStatusType.submitted) {
          // approval tx submitted
        } else if (approveTxData.txStatus === TxStatusType.confirmed && approveTxData.txReceipt) {
          // TODO: set tx link with actionTxData.txHash
          // supply tx finished with success
          setSupplyStep(SupplyState.sendTx);
        } else if (approveTxData.txStatus === TxStatusType.error) {
          setSupplyStep(SupplyState.error);
          setTxError(approveTxData.error);
        }
      }
    }
  }, [approveTxData?.txStatus]);

  useEffect(() => {
    if (supplyStep === SupplyState.sendTx) {
      if (actionTxData.txStatus === TxStatusType.submitted) {
        // supply tx submitted
        // TODO: set tx link with actionTxData.txHash
      } else if (actionTxData.txStatus === TxStatusType.confirmed && actionTxData.txReceipt) {
        // supply tx finished with success
        setSupplyStep(SupplyState.success);
      } else if (actionTxData.txStatus === TxStatusType.error) {
        setTxError(actionTxData.error);
        setSupplyStep(SupplyState.error);
        // Maybe check here if error was in permit to give link to try again with approval
      }
    }
  }, [actionTxData?.txStatus]);

  console.log('state::: ', supplyStep);
  console.log('sign enabled: ', depositWithPermitEnabled);
  console.log('action: ', actionTxData);

  useEffect(() => {
    if (chainId !== connectedChainId) {
      setSupplyStep(SupplyState.networkMisMatch);
    }
  }, [chainId, connectedChainId]);

  const handleClose = () => {
    setTxError(undefined);
    setApproveTxData({} as EthTransactionData);
    setActionTxData({} as EthTransactionData);
    // setSignature(undefined);
    setCustomGasPrice(null);
    onClose();
  };

  const handleError = () => {
    setSupplyStep(SupplyState.amountInput);
  };
  const handlePermitError = () => {
    setDepositWithPermitEnable(false);
    setSupplyStep(SupplyState.amountInput);
  };

  // TODO: provably need to change this to add
  // breadCrums
  // tx gas estimator
  // how to show ehterscan tx link???
  switch (supplyStep) {
    case SupplyState.amountInput:
      return <Button onClick={handleGetTransactions}>Confirm Amount</Button>;
    case SupplyState.approval:
      return <Button onClick={handleApprovalTx}>Approve</Button>;
    case SupplyState.sendTx:
      return <Button onClick={handleSendMainTx}>Send Tx</Button>;
    case SupplyState.success:
      return <Button onClick={handleClose}>Close</Button>;
    case SupplyState.error:
      return (
        <div>
          <Button onClick={handleError}>try again</Button>
          {depositWithPermitEnabled && (
            <Button onClick={handlePermitError}>try with normal approval</Button>
          )}
          <div>{txError}</div>
        </div>
      );
    case SupplyState.networkMisMatch:
      return <Button onClick={() => switchNetwork(chainId)}>ChangeNetwork</Button>;
  }
};
