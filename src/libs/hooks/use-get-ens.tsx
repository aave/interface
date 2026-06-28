import { blo } from 'blo';
import { useEffect, useState } from 'react';
import { lookupEnsName } from 'src/utils/ensClient';
import { keccak256, toBytes } from 'viem';
import { normalize } from 'viem/ens';

interface EnsResponse {
  name?: string;
  avatar?: string;
}

const useGetEns = (address: string): EnsResponse => {
  const [ensName, setEnsName] = useState<string | undefined>(undefined);
  const [ensAvatar, setEnsAvatar] = useState<string | undefined>(undefined);

  const getName = async (address: string) => {
    try {
      const name = await lookupEnsName(address);
      setEnsName(name ?? undefined);
    } catch (error) {
      console.error('ENS name lookup error', error);
    }
  };

  const getAvatar = async (name: string) => {
    try {
      const labelHash = keccak256(toBytes(normalize(name).replace('.eth', '')));
      const result: { background_image: string } = await (
        await fetch(
          `https://metadata.ens.domains/mainnet/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85/${labelHash}/`
        )
      ).json();
      setEnsAvatar(
        result?.background_image ? result.background_image : blo(address as `0x${string}`)
      );
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
