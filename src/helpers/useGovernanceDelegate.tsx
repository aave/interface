import {
  EthereumTransactionTypeExtended,
  gasLimitRecommendations,
  ProtocolAction,
} from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { utils } from 'ethers';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { DelegationTokenType } from 'src/components/transactions/GovDelegation/DelegationTokenSelector';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { DelegationType } from './types';

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
  const [aaveNonce, setAaveNonce] = useState(0);
  const [stkAaveNonce, setStkAaveNonce] = useState(0);
  const [deadline, setDeadline] = useState(Math.floor(Date.now() / 1000 + 3600).toString());
  const prepareDelegateSignature = useRootStore((state) => state.prepareDelegateSignature);
  const prepateDelegateByTypeSignature = useRootStore(
    (state) => state.prepareDelegateByTypeSignature
  );

  const {
    approvalTxState,
    mainTxState,
    setMainTxState,
    setGasLimit,
    loadingTxns,
    setLoadingTxns,
    setTxError,
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
    if (delegationTokenType === DelegationTokenType.BOTH) {
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
              signature: {
                v: v1,
                r: r1,
                s: s1,
              },
            },
            {
              delegatee,
              nonce: stkAaveNonce,
              expiry: deadline,
              signature: {
                v: v2,
                r: r2,
                s: s2,
              },
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
              signature: {
                v: v1,
                r: r1,
                s: s1,
              },
            },
            {
              delegatee,
              nonce: stkAaveNonce,
              expiry: deadline,
              delegationType,
              signature: {
                v: v2,
                r: r2,
                s: s2,
              },
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
    }
  };

  const signMetaTxs = async () => {
    if (delegationTokenType === DelegationTokenType.BOTH) {
      const aaveNonce = await getTokenNonce(user, governanceConfig.aaveTokenAddress);
      const stkAaveNonce = await getTokenNonce(user, governanceConfig.stkAaveTokenAddress);
      const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
      setDeadline(deadline);
      setAaveNonce(aaveNonce);
      setStkAaveNonce(stkAaveNonce);
      const txs = [
        {
          delegatee,
          nonce: String(aaveNonce),
          governanceToken: governanceConfig.aaveTokenAddress,
          governanceTokenName: 'AAVE',
          expiry: deadline,
        },
        {
          delegatee,
          nonce: String(stkAaveNonce),
          governanceToken: governanceConfig.stkAaveTokenAddress,
          governanceTokenName: 'stkAAVE',
          expiry: deadline,
        },
      ];
      const unsignedPayloads: string[] = [];
      for (const tx of txs) {
        if (delegationType !== DelegationType.BOTH) {
          const payload = await prepateDelegateByTypeSignature({ ...tx, type: delegationType });
          unsignedPayloads.push(payload);
        } else {
          const payload = await prepareDelegateSignature(tx);
          unsignedPayloads.push(payload);
        }
      }
      const signedPayload: SignatureLike[] = [];
      for (const unsignedPayload of unsignedPayloads) {
        signedPayload.push(await signTxData(unsignedPayload));
      }
      setSignatures(signedPayload);
    }
  };

  useEffect(() => {
    if (skip) {
      return;
    }
    setLoadingTxns(true);
    const { cancel } = debounce(async () => {
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
              delegationTokenType === DelegationTokenType.AAVE
                ? governanceConfig.aaveTokenAddress
                : governanceConfig.stkAaveTokenAddress,
          });
        } else {
          txs = await delegateByType({
            delegatee,
            delegationType,
            governanceToken:
              delegationTokenType === DelegationTokenType.AAVE
                ? governanceConfig.aaveTokenAddress
                : governanceConfig.stkAaveTokenAddress,
          });
        }
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
    });
    return () => cancel();
  }, [delegationTokenType, delegationType, delegatee, skip]);

  return { approvalTxState, signMetaTxs, mainTxState, loadingTxns, action };
};
