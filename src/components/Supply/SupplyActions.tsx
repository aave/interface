import { ChainId, EthereumTransactionTypeExtended, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import Link from 'next/link';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { EthTransactionData, sendEthTx, signEthTx, TxStatusType } from 'src/utils/sendTxHelper';
import { SupplyState } from './Supply';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { TextWithModal } from '../TextWithModal';
import { ApprovalInfoContent } from '../infoModalContents/ApprovalInfoContent';
import DoneIcon from '@mui/icons-material/Done';
import { RetryWithApprovalInfoContent } from '../infoModalContents/RetryWithApprovalInfoContent';

export type SupplyActionProps = {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  onClose: () => void;
  amount: string;
  isWrongNetwork: boolean;
  supplyStep: SupplyState;
  setSupplyStep: Dispatch<SetStateAction<SupplyState>>;
};

export const SupplyActions = ({
  amountToSupply,
  poolReserve,
  onClose,
  amount,
  isWrongNetwork,
  supplyStep,
  setSupplyStep,
}: SupplyActionProps) => {
  const { signTxData, getTxError, sendTx } = useWeb3Context();
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const networkConfig = getNetworkConfig(chainId);

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
        });
      }
      if (actionTx) {
        setActionTxData({
          txType: actionTx.txType,
          unsignedData: actionTx.tx,
          gas: actionTx.gas,
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
      const unsingedPayload = await newPool.signERC20Approval({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        amount: amountToSupply,
      });

      const signature = await signEthTx(unsingedPayload, setApproveTxData, signTxData);

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
      });

      setSupplyStep(SupplyState.sendTx);
      console.log('approved');
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
        } else if (approveTxData.txStatus === TxStatusType.confirmed && approveTxData.txReceipt) {
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
      } else if (actionTxData.txStatus === TxStatusType.confirmed && actionTxData.txReceipt) {
        setSupplyStep(SupplyState.success);
      } else if (actionTxData.txStatus === TxStatusType.error) {
        setTxError(actionTxData.error);
        setSupplyStep(SupplyState.error);
        // Maybe check here if error was in permit to give link to try again with approval
      }
    }
  }, [actionTxData?.txStatus]);

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

  const handleRetryWithApproval = () => {
    setSupplyStep(SupplyState.amountInput);
    setDepositWithPermitEnable(false);
  };

  // Button states
  const getButtonName = () => {
    if (isWrongNetwork) return 'WRONG NETWORK';
    switch (supplyStep) {
      case SupplyState.amountInput:
        return 'ENTER AN AMOUNT';
      case SupplyState.approval:
      case SupplyState.sendTx:
        if (approveTxData?.loading) {
          return `APPROVING ${poolReserve.symbol}...`;
        } else if (approveTxData?.txStatus === TxStatusType.confirmed) {
          return 'APPROVE CONFIRMED';
        }
        return 'APPROVE TO CONTINUE';
      case SupplyState.success:
        return 'OK, CLOSE';
      case SupplyState.error:
        return 'OK, CLOSE';
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
      default:
        return true;
    }
  };

  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      {supplyStep > SupplyState.amountInput && (
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          {approveTxData?.txStatus === TxStatusType.confirmed ? (
            <Typography variant="helperText" color="#318435">
              <Trans>
                <DoneIcon fontSize="small" /> Approve confirmed
              </Trans>
            </Typography>
          ) : approveTxData?.txStatus === TxStatusType.error ? (
            <TextWithModal
              text={<Trans>Retry What?</Trans>}
              iconSize={13}
              iconColor="#FFFFFF3B"
              withContentButton
            >
              <RetryWithApprovalInfoContent />
            </TextWithModal>
          ) : (
            <TextWithModal
              text={<Trans>Why do I need to approve</Trans>}
              iconSize={13}
              iconColor="#FFFFFF3B"
              withContentButton
            >
              <ApprovalInfoContent />
            </TextWithModal>
          )}
          {supplyStep === SupplyState.sendTx && approveTxData?.txHash && (
            <Typography
              component={Link}
              variant="helperText"
              href={networkConfig.explorerLinkBuilder({ tx: approveTxData?.txHash })}
            >
              <>
                <Trans>Review approve tx details</Trans>
                <SvgIcon sx={{ ml: '2px' }} fontSize="small">
                  <ExternalLinkIcon />
                </SvgIcon>
              </>
            </Typography>
          )}
          {supplyStep === SupplyState.success && actionTxData?.txHash && (
            <Button
              variant="text"
              href={networkConfig.explorerLinkBuilder({ tx: actionTxData?.txHash })}
              target="_blank"
            >
              <div>
                <Trans>Review supply tx details</Trans>
                <SvgIcon sx={{ ml: '2px' }} fontSize="small">
                  <ExternalLinkIcon />
                </SvgIcon>
              </div>
            </Button>
          )}
          {supplyStep === SupplyState.error && actionTxData?.txHash && (
            <Button
              variant="text"
              href={networkConfig.explorerLinkBuilder({ tx: actionTxData?.txHash })}
              target="_blank"
            >
              <div>
                <Trans>Review supply tx details</Trans>
                <SvgIcon sx={{ ml: '2px' }} fontSize="small">
                  <ExternalLinkIcon />
                </SvgIcon>
              </div>
            </Button>
          )}
          {supplyStep === SupplyState.error && approveTxData?.txHash && !actionTxData?.txHash && (
            <Typography
              component={Link}
              variant="helperText"
              href={networkConfig.explorerLinkBuilder({ tx: approveTxData?.txHash })}
            >
              <>
                <Trans>Review approve tx details</Trans>
                <SvgIcon sx={{ ml: '2px' }} fontSize="small">
                  <ExternalLinkIcon />
                </SvgIcon>
              </>
            </Typography>
          )}
        </Box>
      )}
      {depositWithPermitEnabled && supplyStep === SupplyState.error && (
        <Button variant="outlined" onClick={handleRetryWithApproval}>
          <Trans>RETRY WITH APPROVAL</Trans>
        </Button>
      )}
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
          {!actionTxData?.loading
            ? `SUPLY ${poolReserve.symbol}`
            : `SUPLY ${poolReserve.symbol} PROCESSING...`}
        </Button>
      )}
    </Box>
  );
};
