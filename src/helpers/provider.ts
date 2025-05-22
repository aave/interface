import { JsonRpcProvider } from '@ethersproject/providers';

export const isSmartContractWallet = async (user: string, provider: JsonRpcProvider) => {
  const code = await provider.getCode(user);
  return code !== '0x';
};
