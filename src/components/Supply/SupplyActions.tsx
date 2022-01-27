import { ChainId, EthereumTransactionTypeExtended, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { EthTransactionData, sendEthTx, TxStatusType } from 'src/utils/sendTxHelper';
import { SupplyState } from './Supply';

export type SupplyActionProps = {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  onClose: () => void;
  amount: string;
};

export const SupplyActions = ({
  amountToSupply,
  poolReserve,
  onClose,
  amount,
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
  const [breadCrumbs, setBreadCrumbs] = useState({
    amount: false,
    approved: false,
    supplied: false,
  });

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
      setBreadCrumbs({ ...breadCrumbs, amount: true });
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
          setBreadCrumbs({ ...breadCrumbs, approved: true });
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
        setBreadCrumbs({ ...breadCrumbs, supplied: true });
        setSupplyStep(SupplyState.success);
      } else if (actionTxData.txStatus === TxStatusType.error) {
        setTxError(actionTxData.error);
        setSupplyStep(SupplyState.error);
        // Maybe check here if error was in permit to give link to try again with approval
      }
    }
  }, [actionTxData?.txStatus]);

  useEffect(() => {
    if (chainId !== connectedChainId) {
      setSupplyStep(SupplyState.networkMisMatch);
    }
  }, [chainId, connectedChainId]);
  console.log('state: ', supplyStep);

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

  // Button states

  const getButtonName = (): string => {
    switch (supplyStep) {
      case SupplyState.amountInput:
        return 'ENTER AN AMOUNT';
      case SupplyState.approval:
      case SupplyState.sendTx:
        return 'APPROVE TO CONTINUE';
      case SupplyState.success:
        return 'OK, CLOSE';
      case SupplyState.error:
        return 'OK, CLOSE';
      case SupplyState.networkMisMatch:
        return 'CHANGE NETWORK';
    }
  };

  const handleActionButtonClick = () => {
    switch (supplyStep) {
      case SupplyState.amountInput:
        handleGetTransactions();
      case SupplyState.approval:
        handleApprovalTx();
      case SupplyState.sendTx:
        return;
      case SupplyState.success:
        handleClose();
      case SupplyState.error:
        handleError();
      case SupplyState.networkMisMatch:
        switchNetwork(chainId);
    }
  };

  const handleActionButtonDisabled = (): boolean => {
    switch (supplyStep) {
      case SupplyState.amountInput:
        return !(amount !== '' && Number(amount) > 0);
      case SupplyState.approval:
        return approveTxData?.loading ? true : false;
      case SupplyState.success:
        return false;
      case SupplyState.error:
        return false;
      case SupplyState.networkMisMatch:
        return false;
      default:
        return true;
    }
  };
  console.log('amount: ', amount);
  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      <Button
        variant="outlined"
        onClick={handleActionButtonClick}
        disabled={handleActionButtonDisabled()}
      >
        {getButtonName()}
      </Button>
      {(supplyStep === SupplyState.approval || supplyStep === SupplyState.sendTx) && (
        <Button
          sx={{ mt: '8px' }}
          variant="outlined"
          onClick={handleSendMainTx}
          disabled={supplyStep === SupplyState.approval || (actionTxData?.loading ? true : false)}
        >
          SUPLY
        </Button>
      )}
    </Box>
  );
};
