import { JsonRpcProvider } from '@ethersproject/providers';

export const isSmartContractWallet = async (user: string, provider: JsonRpcProvider) => {
  const code = await provider.getCode(user);

  if (isEip7702EOA(code, user)) {
    return false;
  }

  return code !== '0x';
};

// https://eips.ethereum.org/EIPS/eip-7702#abstract
function isEip7702EOA(code: string, account: string): boolean {
  return code.startsWith('0xef0100') || code.toLowerCase() === account.toLowerCase();
}

const SAFE_BYTECODE =
  '0x608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea264697066735822122003d1488ee65e08fa41e58e888a9865554c535f2c77126a82cb4c0f917f31441364736f6c63430007060033';

// Detect if a smart contract wallet is a Safe wallet
export const isSafeWallet = async (user: string, provider: JsonRpcProvider): Promise<boolean> => {
  try {
    const code = await provider.getCode(user);

    return code === SAFE_BYTECODE;
  } catch (error) {
    console.error('Error detecting Safe wallet:', error);
    return false;
  }
};
