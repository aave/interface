import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { addressesByChainId } from 'src/utils/addresses';
import k613Artifact from 'src/abis/K613/K613.json';
import stakingArtifact from 'src/abis/Staking/Staking.json';

const STAKING_ABI = (stakingArtifact as unknown as { abi: unknown[] }).abi;
const K613_ABI = (k613Artifact as unknown as { abi: unknown[] }).abi;

export function useK613StakingAddress() {
  const { chainId } = useAccount();
  const addresses = chainId ? addressesByChainId(chainId) : null;
  return addresses?.staking || null;
}

export function useK613StakingData() {
  const { address: userAddress } = useAccount();
  const stakingAddress = useK613StakingAddress();

  const deposits = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'deposits',
    args: userAddress ? [userAddress] : undefined,
  });

  const lockDuration = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'lockDuration',
  });

  const instantExitPenaltyBps = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'instantExitPenaltyBps',
  });

  const k613Address = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'k613',
  });

  const xk613Address = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'xk613',
  });

  const paused = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'paused',
  });

  return {
    stakingAddress,
    userAddress,
    deposits,
    lockDuration,
    instantExitPenaltyBps,
    k613Address: k613Address.data as `0x${string}` | undefined,
    xk613Address: xk613Address.data as `0x${string}` | undefined,
    paused: paused.data,
    isLoading:
      deposits.isLoading ||
      lockDuration.isLoading ||
      k613Address.isLoading ||
      xk613Address.isLoading,
    refetch: () => {
      deposits.refetch();
      lockDuration.refetch();
      k613Address.refetch();
      xk613Address.refetch();
      paused.refetch();
    },
  };
}

export function useK613TokenBalance(tokenAddress: `0x${string}` | undefined) {
  const { address: userAddress } = useAccount();

  return useReadContract({
    address: tokenAddress,
    abi: K613_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
  });
}

export function useK613TokenAllowance(
  tokenAddress: `0x${string}` | undefined,
  spenderAddress: `0x${string}` | undefined
) {
  const { address: userAddress } = useAccount();

  return useReadContract({
    address: tokenAddress,
    abi: K613_ABI,
    functionName: 'allowance',
    args: userAddress && spenderAddress ? [userAddress, spenderAddress] : undefined,
  });
}

export function useK613StakingActions() {
  const stakingAddress = useK613StakingAddress();
  const { writeContractAsync, isPending } = useWriteContract();

  const stake = async (amount: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [amount],
    });
  };

  const initiateExit = async (amount: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'initiateExit',
      args: [amount],
    });
  };

  const exit = async (index: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'exit',
      args: [index],
    });
  };

  const instantExit = async (index: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'instantExit',
      args: [index],
    });
  };

  const cancelExit = async (index: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'cancelExit',
      args: [index],
    });
  };

  return {
    stake,
    initiateExit,
    exit,
    instantExit,
    cancelExit,
    isPending,
  };
}

export function useK613Approve() {
  const { writeContractAsync, isPending } = useWriteContract();

  const approve = async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    return writeContractAsync({
      address: tokenAddress,
      abi: K613_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return { approve, isPending };
}

export function formatLockDuration(seconds: bigint | undefined): string {
  if (!seconds) return '—';
  const days = Number(seconds) / 86400;
  if (days >= 1) return `${days} дн.`;
  const hours = Number(seconds) / 3600;
  if (hours >= 1) return `${hours} ч.`;
  return `${Number(seconds)} сек.`;
}
