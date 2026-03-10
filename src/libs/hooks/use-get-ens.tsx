import { blo } from 'blo';
import { useEffect, useState } from 'react';
import { getENSClient } from 'src/utils/marketsAndNetworksConfig';

const viemClient = getENSClient();

interface EnsResponse {
  name?: string;
  avatar?: string;
}

const useGetEns = (address: string): EnsResponse => {
  const [ensName, setEnsName] = useState<string | undefined>(undefined);
  const [ensAvatar, setEnsAvatar] = useState<string | undefined>(undefined);

  const getName = async (address: string) => {
    try {
      const name = await viemClient.getEnsName({ address: address as `0x${string}` });
      setEnsName(name ?? undefined);
    } catch (error) {
      console.error('ENS name lookup error', error);
    }
  };

  const getAvatar = async (name: string) => {
    try {
      const avatar = await viemClient.getEnsAvatar({ name });
      setEnsAvatar(avatar ?? blo(address as `0x${string}`));
    } catch (error) {
      console.error('ENS avatar lookup error', error);
    }
  };

  useEffect(() => {
    if (address) {
      setEnsAvatar(blo(address as `0x${string}`));
      getName(address);
    } else {
      setEnsName(undefined);
    }
  }, [address]);

  useEffect(() => {
    if (ensName) {
      getAvatar(ensName);
    }
  }, [ensName]);

  return { name: ensName, avatar: ensAvatar };
};

export default useGetEns;
