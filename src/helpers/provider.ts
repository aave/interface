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
