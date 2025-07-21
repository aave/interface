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

const SAFE_BYTECODE_PREFIX = '0x608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e';

export const isCodeSafeWallet = (code: string) => {
  return code.startsWith(SAFE_BYTECODE_PREFIX);
};

// Detect if a smart contract wallet is a Safe wallet
export const isSafeWallet = async (user: string, provider: JsonRpcProvider): Promise<boolean> => {
  try {
    const code = await provider.getCode(user);

    return isCodeSafeWallet(code);
  } catch (error) {
    console.error('Error detecting Safe wallet:', error);
    return false;
  }
};
