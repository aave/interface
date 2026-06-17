import { DomainType, WalletDomain } from 'src/store/walletDomains';
import { lookupEnsName } from 'src/utils/ensClient';
import { tFetch } from 'src/utils/tFetch';

const getEnsAvatar = async (name: string): Promise<string | undefined> => {
  try {
    const image = `https://metadata.ens.domains/mainnet/avatar/${name}/`;
    await tFetch<never>(image, { method: 'HEAD' });
    return image;
  } catch (error) {
    console.error('ENS avatar lookup error', error);
  }
};

export const getEnsDomain = async (address: string): Promise<WalletDomain | null> => {
  const name = await lookupEnsName(address);
  if (!name) return null;
  const avatar = await getEnsAvatar(name);
  return { name, avatar, type: DomainType.ENS };
};
