import { DomainType, WalletDomain } from 'src/store/walletDomains';
import { getEnsAvatar, getEnsName } from 'src/utils/ens';

export const getEnsDomain = async (address: string): Promise<WalletDomain | null> => {
  const name = await getEnsName(address);
  if (!name) return null;
  const avatar = await getEnsAvatar(name);
  return { name, avatar, type: DomainType.ENS };
};
