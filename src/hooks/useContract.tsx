import { Address, Contract, OpenedContract } from '@ton/core';
import { useAsyncInitialize } from 'src/hooks/useAsyncInitialize';
import { useTonClient } from 'src/hooks/useTonClient';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';

export function useContract<T extends Contract>(
  contractAddress: string,
  ContractClass: new (address: Address) => T
): OpenedContract<T> | undefined {
  const client = useTonClient();
  const { walletAddressTonWallet } = useTonConnectContext();

  return useAsyncInitialize(async () => {
    if (!client || !walletAddressTonWallet) return;
    const contract = new ContractClass(Address.parse(contractAddress));
    return client.open(contract) as OpenedContract<T>;
  }, [client, walletAddressTonWallet]);
}
