import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import type { ContractAbi } from 'web3-types';
import stakingArtifact from 'src/abis/Staking/Staking.json';
import { addressesByChainId } from 'src/utils/addresses';
import { Web3 } from 'web3';

const ABIs = {
  staking: (stakingArtifact as unknown as { abi: ContractAbi }).abi,
};

type ContractKey = keyof typeof ABIs;

export const useContracts = (contract: ContractKey) => {
  const { chainId } = useWeb3React();

  return useMemo(() => {
    if (!chainId || !Web3.givenProvider) return null;

    const web3 = new Web3(Web3.givenProvider);
    const addresses = addressesByChainId(chainId);

    const address = addresses?.[contract];
    if (!address) return null;

    return new web3.eth.Contract(ABIs[contract], address);
  }, [chainId, contract]);
};
