import { blo } from 'blo';
import { useEffect, useState } from 'react';
import { getEnsAvatar, getEnsName } from 'src/utils/ens';

interface EnsResponse {
  name?: string;
  avatar?: string;
}

const useGetEns = (address: string): EnsResponse => {
  const [ensName, setEnsName] = useState<string | undefined>(undefined);
  const [ensAvatar, setEnsAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const loadEns = async () => {
      if (!address) {
        setEnsName(undefined);
        setEnsAvatar(undefined);
        return;
      }

      const fallbackAvatar = blo(address as `0x${string}`);

      setEnsName(undefined);
      setEnsAvatar(fallbackAvatar);

      const name = await getEnsName(address);
      if (cancelled) return;

      setEnsName(name ?? undefined);

      if (!name) return;

      const avatar = await getEnsAvatar(name);
      if (cancelled) return;

      setEnsAvatar(avatar ?? fallbackAvatar);
    };

    loadEns();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return { name: ensName, avatar: ensAvatar };
};

export default useGetEns;
