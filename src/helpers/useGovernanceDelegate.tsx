import {
  DelegateMetaSigParams,
  DelegationType,
  EthereumTransactionTypeExtended,
  gasLimitRecommendations,
  MetaDelegateParams,
  ProtocolAction,
} from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { utils } from 'ethers';
import { queryClient } from 'pages/_app.page';
import { useEffect, useState } from 'react';
import { DelegationToken } from 'src/components/transactions/GovDelegation/DelegationTokenSelector';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { MOCK_SIGNED_HASH } from './useTransactionHandler';

export const useGovernanceDelegate = (
  delegationTokens: DelegationToken[],
  delegationType: DelegationType,
  skip: boolean,
  delegatee: string
) => {
  const delegateByType = useRootStore((state) => state.delegateByType);
  const delegate = useRootStore((state) => state.delegate);

  const getTokenNonce = useRootStore((state) => state.getTokenNonce);
  // const delegateTokensBySig = useRootStore((state) => state.delegateTokensBySig);
  // const delegateTokensByTypeBySig = useRootStore((state) => state.delegateTokensByTypeBySig);
  const [user, estimateGasLimit] = useRootStore((state) => [state.account, state.estimateGasLimit]);
  const { signTxData, sendTx, chainId: connectedChainId, getTxError } = useWeb3Context();

  const [signatures, setSignatures] = useState<SignatureLike[]>([]);
  const [actionTx, setActionTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const [deadline, setDeadline] = useState(Math.floor(Date.now() / 1000 + 3600).toString());
  // const prepareDelegateSignature = useRootStore((state) => state.prepareDelegateSignature);
  // const prepareDelegateByTypeSignature = useRootStore(
  //   (state) => state.prepareDelegateByTypeSignature
  // );

  const isSignatureAction = delegationTokens.length > 1;

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

  const { delegationTokenService } = useSharedDependencies();

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

      const txs = signatures.map<MetaDelegateParams>((signature, index) => {
        const { v, r, s } = utils.splitSignature(signature);
        return {
          delegator: user,
          delegatee,
          underlyingAsset: delegationTokens[index].address,
          deadline,
          v,
          r,
          s,
          delegationType: delegationType,
        };
      });

      let txData = await delegationTokenService.batchMetaDelegate(user, txs);
      txData = await estimateGasLimit(txData);

      return processTx({
        tx: () => sendTx(txData),
        successCallback: (txnResponse: TransactionResponse) => {
          setMainTxState({
            txHash: txnResponse.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
          queryClient.invalidateQueries({
            queryKey: queryKeysFactory.powers(user, governanceV3Config.coreChainId),
          });
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
          queryClient.invalidateQueries({
            queryKey: queryKeysFactory.powers(user, governanceV3Config.coreChainId),
          });
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
    if (delegationTokens.length > 1) {
      setApprovalTxState({ ...approvalTxState, loading: true });
      const nonces = await Promise.all(
        delegationTokens.map((token) => getTokenNonce(user, token.address))
      );
      const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
      setDeadline(deadline);

      const delegationParameters = delegationTokens.map<DelegateMetaSigParams>((token, index) => {
        return {
          delegator: user,
          delegatee,
          underlyingAsset: token.address,
          deadline,
          nonce: String(nonces[index]),
          delegationType: delegationType,
          governanceTokenName: token.domainName,
          increaseNonce: false,
          connectedChainId,
        };
      });

      const unsignedPayloads: string[] = [];
      for (const tx of delegationParameters) {
        const payload = await delegationTokenService.prepareV3DelegateByTypeSignature(tx);
        unsignedPayloads.push(payload);
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
      if (delegationTokens.length > 1) {
        const gas = gasLimitRecommendations[ProtocolAction.default];
        setGasLimit(gas.limit);
        setMainTxState({
          txHash: undefined,
        });
        setTxError(undefined);
        setLoadingTxns(false);
      } else {
        let txs: EthereumTransactionTypeExtended[] = [];
        if (delegationType === DelegationType.ALL) {
          txs = await delegate({
            delegatee,
            governanceToken: delegationTokens[0].address,
          });
        } else {
          txs = await delegateByType({
            delegatee,
            delegationType: delegationType.toString(),
            governanceToken: delegationTokens[0].address,
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
  }, [delegationTokens.length, delegationType, delegatee, skip]);

  return { approvalTxState, signMetaTxs, mainTxState, loadingTxns, action, isSignatureAction };
};
