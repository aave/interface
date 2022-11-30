import { EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { DependencyList, useEffect, useRef, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

export const MOCK_SIGNED_HASH = 'Signed correctly';

interface UseTransactionHandlerProps {
  handleGetTxns: () => Promise<EthereumTransactionTypeExtended[]>;
  handleGetPermitTxns?: (
    signatures: SignatureLike[],
    deadline: string
  ) => Promise<EthereumTransactionTypeExtended[]>;
  tryPermit?: boolean;
  skip?: boolean;
  deps?: DependencyList;
}

export type Approval = {
  amount: string;
  underlyingAsset: string;
  permitType?: 'POOL' | 'MIGRATOR';
};

export const useTransactionHandler = ({
  handleGetTxns,
  handleGetPermitTxns,
  tryPermit = false,
  skip,
  deps = [],
}: UseTransactionHandlerProps) => {
  const {
    approvalTxState,
    setApprovalTxState,
    mainTxState,
    setMainTxState,
    setGasLimit,
    loadingTxns,
    setLoadingTxns,
    setTxError,
    setRetryWithApproval,
  } = useModalContext();
  const { signTxData, sendTx, getTxError } = useWeb3Context();
  const { refetchWalletBalances, refetchPoolData, refetchIncentiveData } =
    useBackgroundDataProvider();
  const [usePermit, setUsePermit] = useState<boolean>(tryPermit);
  const [signatures, setSignatures] = useState<SignatureLike[]>([]);
  const [signatureDeadline, setSignatureDeadline] = useState<string>();
  const signPoolERC20Approval = useRootStore((state) => state.signERC20Approval);
  const generatePermitPayloadForMigrationAsset = useRootStore(
    (state) => state.generatePermitPayloadForMigrationAsset
  );

  const [approvalTxes, setApprovalTxes] = useState<EthereumTransactionTypeExtended[] | undefined>();
  const [actionTx, setActionTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true; // Will set it to true on mount ...
    return () => {
      mounted.current = false;
    }; // ... and to false on unmount
  }, []);
  /**
   * Executes the transactions and handles loading & error states.
   * @param fn
   * @returns
   */
  // eslint-disable-next-line
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
        mounted.current && successCallback && successCallback(txnResult);

        refetchWalletBalances();
        refetchPoolData && refetchPoolData();
        refetchIncentiveData && refetchIncentiveData();
      } catch (e) {
        // TODO: what to do with this error?
        try {
          // TODO: what to do with this error?
          const error = await getTxError(txnResult.hash);
          mounted.current && errorCallback && errorCallback(new Error(error), txnResult.hash);
          return;
        } catch (e) {
          mounted.current && errorCallback && errorCallback(e, txnResult.hash);
          return;
        }
      }

      return;
    } catch (e) {
      errorCallback && errorCallback(e);
    }
  };

  const approval = async (approvals?: Approval[]) => {
    console.log(approvalTxes, 'approvalTxes');
    if (approvalTxes) {
      console.log(approvalTxes, 'approvalTxes');
      if (usePermit && approvals && approvals?.length > 0) {
        setApprovalTxState({ ...approvalTxState, loading: true });
        console.log('loading true', usePermit, approvals, approvalTxes);
        try {
          // deadline is an hour after signature
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const unsignedPayloads: string[] = [];
          for (const approval of approvals) {
            if (!approval.permitType || approval.permitType == 'POOL') {
              unsignedPayloads.push(
                await signPoolERC20Approval({
                  reserve: approval.underlyingAsset,
                  amount: approval.amount,
                  deadline,
                })
              );
            } else {
              unsignedPayloads.push(
                await generatePermitPayloadForMigrationAsset({ ...approval, deadline })
              );
            }
          }
          try {
            const signatures: SignatureLike[] = [];
            for (const unsignedPayload of unsignedPayloads) {
              signatures.push(await signTxData(unsignedPayload));
            }
            if (!mounted.current) return;
            setSignatures(signatures);
            setSignatureDeadline(deadline);
            setApprovalTxState({
              txHash: MOCK_SIGNED_HASH,
              loading: false,
              success: true,
            });
            setTxError(undefined);
          } catch (error) {
            if (!mounted.current) return;
            const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
            setTxError(parsedError);

            setApprovalTxState({
              txHash: undefined,
              loading: false,
            });

            // set use permit to false to retry with normal approval
            setUsePermit(false);
            setRetryWithApproval(true);
          }
        } catch (error) {
          if (!mounted.current) return;

          // set use permit to false to retry with normal approval
          setUsePermit(false);
          setRetryWithApproval(true);

          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          setTxError(parsedError);
          setApprovalTxState({
            txHash: undefined,
            loading: false,
          });
        }
      } else {
        try {
          setApprovalTxState({ ...approvalTxState, loading: true });
          console.log('no permit should call approval', approvalTxes);
          const params = await Promise.all(approvalTxes.map((approvalTx) => approvalTx.tx()));
          console.log(params, 'params');
          const approvalResponses = await Promise.all(
            params.map(
              (param) =>
                new Promise<TransactionResponse>(async (resolve, reject) => {
                  delete param.gasPrice;
                  console.log(params, 'params');
                  processTx({
                    tx: () => sendTx(param),
                    successCallback: (txnResponse: TransactionResponse) => {
                      resolve(txnResponse);
                    },
                    errorCallback: (error, hash) => {
                      const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
                      setTxError(parsedError);
                      setApprovalTxState({
                        txHash: hash,
                        loading: false,
                      });
                      reject();
                    },
                    // TODO: add error callback
                    action: TxAction.APPROVAL,
                  });
                })
            )
          );

          setApprovalTxState({
            txHash: approvalResponses[0].hash,
            loading: false,
            success: true,
          });
        } catch (error) {
          if (!mounted.current) return;
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          setTxError(parsedError);
          setApprovalTxState({
            txHash: undefined,
            loading: false,
          });
        }
      }
    }
  };

  const action = async () => {
    if (approvalTxes && usePermit && handleGetPermitTxns) {
      if (!signatures.length || !signatureDeadline) throw new Error('signature needed');
      try {
        console.log(signatures, 'signatures');
        setMainTxState({ ...mainTxState, loading: true });
        const txns = await handleGetPermitTxns(signatures, signatureDeadline);
        const params = await txns[0].tx();
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
      } catch (error) {
        console.log(error, 'error');
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    }
    if ((!usePermit || !approvalTxes) && actionTx) {
      try {
        setMainTxState({ ...mainTxState, loading: true });
        console.log(actionTx, 'actionTx');
        const params = await actionTx.tx();
        console.log(params, 'actionTx');
        // delete params.gasPrice;
        console.log(params);
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
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        console.log(error, parsedError);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    }
  };

  // populate txns
  useEffect(() => {
    // good enough for now, but might need debounce or similar for swaps
    if (!skip) {
      setLoadingTxns(true);
      const timeout = setTimeout(() => {
        setLoadingTxns(true);
        return handleGetTxns()
          .then(async (data) => {
            if (!mounted.current) return;
            // setApprovalTxes(data.filte((tx) => tx.txType === 'ERC20_APPROVAL'));
            const approvals = data.filter((tx) => tx.txType == 'ERC20_APPROVAL');
            if (approvals.length > 0) {
              setApprovalTxes(approvals);
            }
            setActionTx(
              data.find((tx) =>
                [
                  'DLP_ACTION',
                  'REWARD_ACTION',
                  'FAUCET_MINT',
                  'STAKE_ACTION',
                  'GOV_DELEGATION_ACTION',
                  'GOVERNANCE_ACTION',
                  'V3_MIGRATION_ACTION',
                ].includes(tx.txType)
              )
            );
            setMainTxState({
              txHash: undefined,
            });
            setTxError(undefined);
            let gas: GasType | null = null;
            try {
              gas = await data[data.length - 1].gas();
            } catch (error) {
              const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
              setTxError(parsedError);
            }
            setGasLimit(gas?.gasLimit || '');
            setLoadingTxns(false);
          })
          .catch((error) => {
            if (!mounted.current) return;
            setMainTxState({
              txHash: undefined,
            });
            const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
            setTxError(parsedError);
            setLoadingTxns(false);
          });
      }, 1000);
      return () => clearTimeout(timeout);
    } else {
      setApprovalTxes(undefined);
      setActionTx(undefined);
    }
  }, [skip, ...deps]);

  return {
    approval,
    action,
    loadingTxns,
    setUsePermit,
    requiresApproval: !!approvalTxes,
    approvalTxState,
    mainTxState,
    usePermit,
    actionTx,
    // approvalTx,
  };
};
