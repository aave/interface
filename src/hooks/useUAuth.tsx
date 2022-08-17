import { useEffect, useState } from 'react';
import { UAuthConnector } from '@uauth/web3-react';
import { AbstractConnector } from '@web3-react/abstract-connector';

export const useUAuth = (connector: AbstractConnector | undefined) => {
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    if (connector && connector instanceof UAuthConnector) {
      const resolve = async () => {
        const { sub } = await (connector as UAuthConnector).uauth.user();
        setDomain(sub);
      };

      resolve();
    }
  }, [connector]);

  return {
    domain,
  };
};
