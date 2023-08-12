import {
  EthereumTransactionTypeExtended,
  gasLimitRecommendations,
  ProtocolAction,
} from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';
import { DelegationTokenType } from 'src/components/transactions/GovDelegation/DelegationTokenSelector';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { DelegationType } from './types';
import { MOCK_SIGNED_HASH } from './useTransactionHandler';

export const useGovernanceDelegate = (
  delegationTokenType: DelegationTokenType,
  delegationType: DelegationType,
  skip: boolean,
  delegatee: string
) => {
  const delegateByType = useRootStore((state) => state.delegateByType);
  const delegate = useRootStore((state) => state.delegate);
  const getTokenNonce = useRootStore((state) => state.getTokenNonce);
  const delegateTokensBySig = useRootStore((state) => state.delegateTokensBySig);
  const delegateTokensByTypeBySig = useRootStore((state) => state.delegateTokensByTypeBySig);
  const user = useRootStore((state) => state.account);
  const { signTxData, sendTx, getTxError } = useWeb3Context();
  const [signatures, setSignatures] = useState<SignatureLike[]>([]);
  const [actionTx, setActionTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const [aaveNonce, setAaveNonce] = useState(0);
  const [stkAaveNonce, setStkAaveNonce] = useState(0);
  const [deadline, setDeadline] = useState(Math.floor(Date.now() / 1000 + 3600).toString());
  const prepareDelegateSignature = useRootStore((state) => state.prepareDelegateSignature);
  const prepareDelegateByTypeSignature = useRootStore(
    (state) => state.prepareDelegateByTypeSignature
  );

  const isSignatureAction = delegationTokenType === DelegationTokenType.BOTH;

  const {
    approvalTxState,
    mainTxState,
    setMainTxState,
    setGasLimit,
    loadingTxns,
    setLoadingTxns,
    setTxError,
    setApprovalTxState,
  } = useModalContext();

  const processTx = async ({
    tx,
    errorCallback,
    successCallback,
  }: {
    tx: () => Promise<TransactionResponse>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorCallback?: (error: any, hash?: string) => void;
    successCallback?: (param: TransactionResponse) => void;
    action: TxAction;
  }) => {
    try {
      const txnResult = await tx();
      try {
        await txnResult.wait(1);
        successCallback && successCallback(txnResult);
      } catch (e) {
        try {
          const error = await getTxError(txnResult.hash);
          errorCallback && errorCallback(new Error(error), txnResult.hash);
          return;
        } catch (e) {
          errorCallback && errorCallback(e, txnResult.hash);
          return;
        }
      }

      return;
    } catch (e) {
      errorCallback && errorCallback(e);
    }
  };

  const action = async () => {
    if (isSignatureAction) {
      setMainTxState({ ...mainTxState, loading: true });
      const { v: v1, r: r1, s: s1 } = utils.splitSignature(signatures[0]);
      const { v: v2, r: r2, s: s2 } = utils.splitSignature(signatures[1]);
      let txs: EthereumTransactionTypeExtended[] = [];
      if (delegationType === DelegationType.BOTH) {
        txs = await delegateTokensBySig({
          user,
          tokens: [governanceConfig.aaveTokenAddress, governanceConfig.stkAaveTokenAddress],
          data: [
            {
              delegatee,
              nonce: aaveNonce,
              expiry: deadline,
              v: v1,
              r: r1,
              s: s1,
            },
            {
              delegatee,
              nonce: stkAaveNonce,
              expiry: deadline,
              v: v2,
              r: r2,
              s: s2,
            },
          ],
        });
      } else {
        txs = await delegateTokensByTypeBySig({
          user,
          tokens: [governanceConfig.aaveTokenAddress, governanceConfig.stkAaveTokenAddress],
          data: [
            {
              delegatee,
              nonce: aaveNonce,
              expiry: deadline,
              delegationType,
              v: v1,
              r: r1,
              s: s1,
            },
            {
              delegatee,
              nonce: stkAaveNonce,
              expiry: deadline,
              delegationType,
              v: v2,
              r: r2,
              s: s2,
            },
          ],
        });
      }
      const params = await txs[0].tx();
      delete params.gasPrice;
      return processTx({
        tx: () => sendTx(params),
        successCallback: (txnResponse: TransactionResponse) => {
          setMainTxState({
            txHash: txnResponse.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
        },
        errorCallback: (error, hash) => {
          const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION);
          setTxError(parsedError);
          setMainTxState({
            txHash: hash,
            loading: false,
          });
        },
        action: TxAction.MAIN_ACTION,
      });
    } else if (actionTx) {
      setMainTxState({ ...mainTxState, loading: true });
      const params = await actionTx.tx();
      delete params.gasPrice;
      return processTx({
        tx: () => sendTx(params),
        successCallback: (txnResponse: TransactionResponse) => {
          setMainTxState({
            txHash: txnResponse.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
        },
        errorCallback: (error, hash) => {
          const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION);
          setTxError(parsedError);
          setMainTxState({
            txHash: hash,
            loading: false,
          });
        },
        action: TxAction.MAIN_ACTION,
      });
    }
  };

  const signMetaTxs = async () => {
    if (delegationTokenType === DelegationTokenType.BOTH) {
      setApprovalTxState({ ...approvalTxState, loading: true });
      const [aaveNonce, stkAaveNonce] = await Promise.all([
        getTokenNonce(user, governanceConfig.aaveTokenAddress),
        getTokenNonce(user, governanceConfig.stkAaveTokenAddress),
      ]);
      const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
      setDeadline(deadline);
      setAaveNonce(aaveNonce);
      setStkAaveNonce(stkAaveNonce);
      const txs = [
        {
          delegatee,
          nonce: String(aaveNonce),
          governanceToken: governanceConfig.aaveTokenAddress,
          governanceTokenName: 'Mooncake Finance Token',
          expiry: deadline,
        },
        {
          delegatee,
          nonce: String(stkAaveNonce),
          governanceToken: governanceConfig.stkAaveTokenAddress,
          governanceTokenName: 'Staked Mooncake Finance',
          expiry: deadline,
        },
      ];
      const unsignedPayloads: string[] = [];
      for (const tx of txs) {
        if (delegationType !== DelegationType.BOTH) {
          const payload = await prepareDelegateByTypeSignature({ ...tx, type: delegationType });
          unsignedPayloads.push(payload);
        } else {
          const payload = await prepareDelegateSignature(tx);
          unsignedPayloads.push(payload);
        }
      }
      try {
        const signedPayload: SignatureLike[] = [];
        for (const unsignedPayload of unsignedPayloads) {
          signedPayload.push(await signTxData(unsignedPayload));
        }
        setApprovalTxState({
          txHash: MOCK_SIGNED_HASH,
          loading: false,
          success: true,
        });
        setTxError(undefined);
        setSignatures(signedPayload);
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
    }
  };

  useEffect(() => {
    if (skip) {
      setLoadingTxns(false);
      setSignatures([]);
      setActionTx(undefined);
      return;
    }
    setLoadingTxns(true);
    const timeout = setTimeout(async () => {
      if (delegationTokenType === DelegationTokenType.BOTH) {
        const gas = gasLimitRecommendations[ProtocolAction.default];
        setGasLimit(gas.limit);
        setMainTxState({
          txHash: undefined,
        });
        setTxError(undefined);
        setLoadingTxns(false);
      } else {
        let txs: EthereumTransactionTypeExtended[] = [];
        if (delegationType === DelegationType.BOTH) {
          txs = await delegate({
            delegatee,
            governanceToken:
              delegationTokenType === DelegationTokenType.MCAKE
                ? governanceConfig.aaveTokenAddress
                : governanceConfig.stkAaveTokenAddress,
          });
        } else {
          txs = await delegateByType({
            delegatee,
            delegationType,
            governanceToken:
              delegationTokenType === DelegationTokenType.MCAKE
                ? governanceConfig.aaveTokenAddress
                : governanceConfig.stkAaveTokenAddress,
          });
        }
        setActionTx(txs[0]);
        setMainTxState({ txHash: undefined });
        setTxError(undefined);
        let gasLimit = 0;
        try {
          for (const tx of txs) {
            const txGas = await tx.gas();
            if (txGas && txGas.gasLimit) {
              gasLimit = gasLimit + Number(txGas.gasLimit);
            }
          }
        } catch (error) {
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          setTxError(parsedError);
        }
        setGasLimit(gasLimit.toString() || '');
        setLoadingTxns(false);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [delegationTokenType, delegationType, delegatee, skip]);

  return { approvalTxState, signMetaTxs, mainTxState, loadingTxns, action, isSignatureAction };
};
