import {
  bigDecimal,
  evmAddress,
  MigratePositionRequest,
  MigrationTypedData,
  Signature,
  useMigratePosition,
} from '@aave/react';
import { useCallback, useRef, useState } from 'react';
import type { TxStatus } from 'src/components/TransactionCard';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getBlock, waitForTransactionReceipt } from 'wagmi/actions';

export interface EarnMigrationRequest {
  user: string;
  market: { address: string; chainId: number };
  currency: string;
  spoke: string;
  /** In whole tokens. */
  amount: string;
  useAsCollateral: boolean;
}

/** What the chain says about the migration once it is mined. */
export interface EarnMigrationReceipt {
  blockNumber: bigint;
  /** Unix seconds. Missing when the block could not be read. */
  timestamp?: number;
  /** What the sender paid for gas, in wei. */
  feeWei: bigint;
}

/**
 * `idle` and `signing` are before anything is sent: the user is still on the form, answering the
 * wallet's prompts. From `pending` on, the transaction is out and `txHash` names it.
 */
export type EarnMigrationRun =
  | { status: 'idle'; error?: Error }
  | { status: 'signing' }
  | {
      status: Extract<TxStatus, 'pending' | 'success' | 'error'>;
      txHash: string;
      receipt?: EarnMigrationReceipt;
      error?: Error;
    };

type SignedPlan = NonNullable<MigratePositionRequest['signed']>;

// Signatures, the Safe signature, then the transaction: three answers. Anything past that means
// the API keeps asking for the same thing.
const MAX_STEPS = 5;

// How long the app takes to re-render on the new chain after the wallet switches.
const NETWORK_SWITCH_SETTLE_MS = 1000;

const USER_DENIED = /user (denied|rejected)|rejected the request|cancelled the transaction/i;

/** The document as `eth_signTypedData_v4` takes it: without GraphQL's extras or empty fields. */
const toSignable = ({ types, primaryType, domain, message }: MigrationTypedData) =>
  JSON.stringify({
    types,
    primaryType,
    domain: {
      // A Safe's domain carries neither name nor version.
      ...(domain.name === null ? {} : { name: domain.name }),
      ...(domain.version === null ? {} : { version: domain.version }),
      chainId: domain.chainId,
      verifyingContract: domain.verifyingContract,
    },
    message,
  });

/**
 * Runs an earn migration from start to finish: the API asks for signatures, then for the
 * signature of the Safe the migration runs in, then answers the transaction to send.
 */
export const useEarnMigration = () => {
  const web3 = useWeb3Context();
  // The wallet helpers are bound to the chain the wallet was on when they were created, so after
  // a network switch the run has to pick up the ones from the next render.
  const latestWeb3 = useRef(web3);
  latestWeb3.current = web3;
  const [migratePosition] = useMigratePosition();
  const [run, setRun] = useState<EarnMigrationRun>({ status: 'idle' });

  const migrate = useCallback(
    async (request: EarnMigrationRequest) => {
      setRun({ status: 'signing' });
      let sentHash: string | undefined;

      const sign = async (typedData: MigrationTypedData) =>
        (await latestWeb3.current.signTxData(toSignable(typedData))) as unknown as Signature;

      try {
        if (latestWeb3.current.chainId !== request.market.chainId) {
          await latestWeb3.current.switchNetwork(request.market.chainId);
          await new Promise((resolve) => setTimeout(resolve, NETWORK_SWITCH_SETTLE_MS));
          if (latestWeb3.current.chainId !== request.market.chainId) {
            throw new Error('Wallet is on the wrong network');
          }
        }

        let signed: SignedPlan | undefined;

        for (let step = 0; step < MAX_STEPS; step++) {
          const result = await migratePosition({
            user: evmAddress(request.user),
            market: {
              address: evmAddress(request.market.address),
              chainId: request.market.chainId as MigratePositionRequest['market']['chainId'],
            },
            spoke: evmAddress(request.spoke),
            position: {
              earn: {
                currency: evmAddress(request.currency),
                amount: bigDecimal(request.amount),
                useAsCollateral: request.useAsCollateral,
              },
            },
            signed,
          });
          if (result.isErr()) throw result.error;
          const plan = result.value;

          switch (plan.__typename) {
            case 'MigrationSignaturesRequired': {
              const signatures: Signature[] = [];
              // One wallet prompt at a time, in the order the API listed them.
              for (const { typedData } of plan.signatures) signatures.push(await sign(typedData));
              signed = { plan: plan.plan, signatures };
              break;
            }

            case 'MigrationSafeSignatureRequired': {
              if (!signed) throw new Error('Migration asked for the Safe signature first');
              signed = { ...signed, safeSignature: await sign(plan.typedData) };
              break;
            }

            case 'TransactionRequest': {
              const { hash } = await latestWeb3.current.sendTx({
                from: plan.from,
                to: plan.to,
                data: plan.data,
                value: String(plan.value),
              });
              sentHash = hash;
              setRun({ status: 'pending', txHash: hash });

              const receipt = await waitForTransactionReceipt(wagmiConfig, {
                hash: hash as `0x${string}`,
                chainId: request.market.chainId,
              });
              if (receipt.status !== 'success') throw new Error('Migration transaction reverted');

              // The date is a nicety: a failed block read must not turn a mined migration into
              // an error.
              const block = await getBlock(wagmiConfig, {
                blockNumber: receipt.blockNumber,
                chainId: request.market.chainId,
              }).catch(() => undefined);

              setRun({
                status: 'success',
                txHash: hash,
                receipt: {
                  blockNumber: receipt.blockNumber,
                  timestamp: block ? Number(block.timestamp) : undefined,
                  feeWei: receipt.gasUsed * receipt.effectiveGasPrice,
                },
              });
              return;
            }

            case 'MigrationFlashLoanUnavailable':
              throw new Error('Migration is not available right now');
          }
        }

        throw new Error('Migration did not reach a transaction');
      } catch (cause) {
        const error = cause instanceof Error ? cause : new Error(String(cause));
        console.error('Earn migration failed', error);
        if (sentHash) {
          setRun({ status: 'error', txHash: sentHash, error });
        } else {
          // Nothing was sent: back to the form, silently when the user turned a prompt down.
          setRun({ status: 'idle', error: USER_DENIED.test(error.message) ? undefined : error });
        }
      }
    },
    [migratePosition]
  );

  const reset = useCallback(() => setRun({ status: 'idle' }), []);

  return { run, migrate, reset };
};
