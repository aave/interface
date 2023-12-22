import {
  EthereumTransactionTypeExtended,
  gasLimitRecommendations,
  ProtocolAction,
  tEthereumAddress,
} from '@aave/contract-helpers';
import { ethers } from 'ethers';
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
import META_DELEGATE_HELPER_ABI from 'src/meta-batch-helper.json';

import { DelegationType } from './types';
import { MOCK_SIGNED_HASH } from './useTransactionHandler';

export enum GovernancePowerTypeApp {
  VOTING,
  PROPOSITION,
  All,
}

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
  const { signTxData, sendTx, provider, chainId: connectedChainId, getTxError } = useWeb3Context();

  const [signatures, setSignatures] = useState<SignatureLike[]>([]);
  const [actionTx, setActionTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const [aaveNonce, setAaveNonce] = useState(0);
  const [stkAaveNonce, setStkAaveNonce] = useState(0);
  const [aAaveNonce, setAAaveNonce] = useState(0);
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

      console.log('SIGNATURE', signatures);

      const { v: v1, r: r1, s: s1 } = utils.splitSignature(signatures[0]);
      const { v: v2, r: r2, s: s2 } = utils.splitSignature(signatures[1]);
      const { v: v3, r: r3, s: s3 } = utils.splitSignature(signatures[2]);

      let txs: EthereumTransactionTypeExtended[] = [];

      console.log('DELEGATION TYPE', delegationType, DelegationType.BOTH);
      if (delegationType === DelegationType.BOTH) {
        console.log(' LETS GO IN EHRE');

        // ALL --> Means both powers
        // do delegation with meta
        // continue in here
        const delegateParams = [
          {
            delegator: user,
            delegatee,
            underlyingAsset: governanceConfig.aaveTokenAddress,
            deadline,
            v: utils.splitSignature(signatures[0]).v,
            r: utils.splitSignature(signatures[0]).r,
            s: utils.splitSignature(signatures[0]).s,
            delegationType: DelegationType.BOTH,
          },
          {
            delegator: user,
            delegatee,
            underlyingAsset: governanceConfig.stkAaveTokenAddress,
            deadline,
            v: utils.splitSignature(signatures[1]).v,
            r: utils.splitSignature(signatures[1]).r,
            s: utils.splitSignature(signatures[1]).s,
            delegationType: DelegationType.BOTH,
          },
          {
            delegator: user,
            delegatee,
            underlyingAsset: governanceConfig.aAaveTokenAddress,
            deadline,
            v: utils.splitSignature(signatures[2]).v,
            r: utils.splitSignature(signatures[2]).r,
            s: utils.splitSignature(signatures[2]).s,
            delegationType: DelegationType.BOTH,
          },
        ];

        const metaDelegateHelperContract = new ethers.Contract(
          '0x8afd68632a4b4d9fb3f2956ca921eb2d69146491',
          META_DELEGATE_HELPER_ABI,
          provider
        );

        console.log('delegateParams --->', delegateParams);

        const txData = await metaDelegateHelperContract.populateTransaction.batchMetaDelegate(
          delegateParams
        );

        console.log('txData --->', txData);

        // txs = await delegateTokensBySig({
        //   user,
        //   tokens: [
        //     governanceConfig.aaveTokenAddress,
        //     governanceConfig.stkAaveTokenAddress,
        //     governanceConfig.aAaveTokenAddress,
        //   ],
        //   data: [
        //     {
        //       delegatee,
        //       nonce: aaveNonce,
        //       expiry: deadline,
        //       v: v1,
        //       r: r1,
        //       s: s1,
        //     },
        //     {
        //       delegatee,
        //       nonce: stkAaveNonce,
        //       expiry: deadline,
        //       v: v2,
        //       r: r2,
        //       s: s2,
        //     },
        //     {
        //       delegatee,
        //       nonce: aAaveNonce,
        //       expiry: deadline,
        //       v: v3,
        //       r: r3,
        //       s: s3,
        //     },
        //   ],
        // });

        return processTx({
          tx: () => sendTx(txData),
          successCallback: (txnResponse: TransactionResponse) => {
            setMainTxState({
              txHash: txnResponse.hash,
              loading: false,
              success: true,
            });
            setTxError(undefined);
          },
          errorCallback: (error, hash) => {
            console.log('whats the erorrrrrrrr', error);
            const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION);
            setTxError(parsedError);
            setMainTxState({
              txHash: hash,
              loading: false,
            });
          },
          action: TxAction.MAIN_ACTION,
        });
      } else {
        // only let one either proposition or voting
        txs = await delegateTokensByTypeBySig({
          user,
          tokens: [
            governanceConfig.aaveTokenAddress,
            governanceConfig.stkAaveTokenAddress,
            governanceConfig.aAaveTokenAddress,
          ],
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
            {
              delegatee,
              nonce: aAaveNonce,
              expiry: deadline,
              delegationType,
              v: v3,
              r: r3,
              s: s3,
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

  interface BatchMetaDelegateParams {
    underlyingAsset: tEthereumAddress;
    delegator: tEthereumAddress;
    delegatee: tEthereumAddress;
    deadline: bigint;
    v: number;
    r: tEthereumAddress;
    s: tEthereumAddress;
    delegationType: GovernancePowerTypeApp;
  }

  interface DelegateMetaSigParams {
    underlyingAsset: tEthereumAddress;
    delegatee: tEthereumAddress;
    delegateByType: GovernancePowerTypeApp;
    delegator: tEthereumAddress;
    increaseNonce: boolean;
    governanceTokenName: string;
    nonce: string;
    connectedChainId: number;
    deadline: number;
  }
  const delegateMetaSig = ({
    underlyingAsset,
    delegatee,
    delegateByType,
    delegator,
    increaseNonce,
    governanceTokenName,
    nonce,
    // connectedChainId,
    deadline,
  }: DelegateMetaSigParams) => {
    const isAllDelegate = delegateByType === GovernancePowerTypeApp.All;

    const sigBaseType = [
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];
    const sigParametersType = [
      { name: 'delegator', type: 'address' },
      { name: 'delegatee', type: 'address' },
    ];
    const sigDelegationTypeType = [{ name: 'delegationType', type: 'uint8' }];

    const typesData = {
      delegator: delegator,
      delegatee: delegatee,
      nonce: BigInt(increaseNonce ? Number(nonce) + 1 : nonce).toString(),
      deadline,
    };

    const typeData = {
      domain: {
        name: governanceTokenName,
        version: '2',
        chainId: connectedChainId,
        verifyingContract: underlyingAsset,
      },
      types: isAllDelegate
        ? { Delegate: [...sigParametersType, ...sigBaseType] }
        : {
            DelegateByType: [...sigParametersType, ...sigDelegationTypeType, ...sigBaseType],
          },
      primaryType: isAllDelegate ? 'Delegate' : 'DelegateByType',
      message: isAllDelegate ? { ...typesData } : { ...typesData, delegationType },
    };

    return JSON.stringify(typeData);
  };

  const signMetaTxs = async () => {
    if (delegationTokenType === DelegationTokenType.BOTH) {
      setApprovalTxState({ ...approvalTxState, loading: true });
      const [aaveNonce, stkAaveNonce] = await Promise.all([
        getTokenNonce(user, governanceConfig.aaveTokenAddress),
        getTokenNonce(user, governanceConfig.stkAaveTokenAddress),
        getTokenNonce(user, governanceConfig.aAaveTokenAddress),
      ]);
      const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
      setDeadline(deadline);
      setAaveNonce(aaveNonce);
      setStkAaveNonce(stkAaveNonce);
      setAAaveNonce(aAaveNonce);

      // const txs = [
      //   {
      //     delegatee,
      //     nonce: String(aaveNonce),
      //     governanceToken: governanceConfig.aaveTokenAddress,
      //     governanceTokenName: 'Aave Token',
      //     expiry: deadline,
      //   },
      //   {
      //     delegatee,
      //     nonce: String(stkAaveNonce),
      //     governanceToken: governanceConfig.stkAaveTokenAddress,
      //     governanceTokenName: 'Staked Aave',
      //     expiry: deadline,
      //   },
      //   {
      //     delegatee,
      //     nonce: String(aAaveNonce),
      //     governanceToken: governanceConfig.aAaveTokenAddress,
      //     governanceTokenName: 'aAave',
      //     expiry: deadline,
      //   },
      // ];

      //   const isVotingToAddressSame =
      //   delegateData.votingToAddress === votingToAddress;
      // const isPropositionToAddressSame =
      //   delegateData.propositionToAddress === propositionToAddress;

      const delegationParameters = [
        {
          delegator: user,
          delegatee: delegatee,
          underlyingAsset: governanceConfig.aaveTokenAddress,
          deadline,
          nonce: aaveNonce,
          delegationType: DelegationType.BOTH,
          governanceTokenName: 'Aave Token',
          increaseNonce: false,
        },
        {
          delegator: user,
          delegatee: delegatee,
          underlyingAsset: governanceConfig.stkAaveTokenAddress,
          deadline,
          nonce: stkAaveNonce,
          delegationType: DelegationType.BOTH,
          governanceTokenName: 'Staked Token',
          increaseNonce: false,
        },
        {
          delegator: user,
          delegatee: delegatee,
          underlyingAsset: governanceConfig.aAaveTokenAddress,
          governanceTokenName: 'aAave',
          deadline,
          nonce: aAaveNonce,
          delegationType: DelegationType.BOTH,
          increaseNonce: false,
        },
      ];

      const unsignedPayloads: string[] = [];
      for (const tx of delegationParameters) {
        if (delegationType !== DelegationType.BOTH) {
          const p = delegateMetaSig(tx);

          // console.log('P =======>', p);

          // const payload = await prepareDelegateByTypeSignature({ ...tx, type: delegationType });
          unsignedPayloads.push(p);
        } else {
          const p = await delegateMetaSig(tx);

          // const payload = await prepareDelegateSignature(tx);
          unsignedPayloads.push(p);
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

        console.log('SIGNED PAYLOAD', signedPayload);

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
              delegationTokenType === DelegationTokenType.AAVE
                ? governanceConfig.aaveTokenAddress
                : delegationTokenType === DelegationTokenType.STKAAVE
                ? governanceConfig.stkAaveTokenAddress
                : governanceConfig.aAaveTokenAddress,
            // delegationTokenType === DelegationTokenType.AAVE
            //   ? governanceConfig.aaveTokenAddress
            //   : governanceConfig.stkAaveTokenAddress,
          });
        } else {
          txs = await delegateByType({
            delegatee,
            delegationType,
            governanceToken:
              delegationTokenType === DelegationTokenType.AAVE
                ? governanceConfig.aaveTokenAddress
                : delegationTokenType === DelegationTokenType.STKAAVE
                ? governanceConfig.stkAaveTokenAddress
                : governanceConfig.aAaveTokenAddress,
            // delegationTokenType === DelegationTokenType.AAVE
            //   ? governanceConfig.aaveTokenAddress
            //   : governanceConfig.stkAaveTokenAddress,
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
