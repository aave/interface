import mixpanel, { Mixpanel } from 'mixpanel-browser';
import React, { FC, useEffect, useState } from 'react';

import MixpanelContext from './MixpanelContext';

interface MixpanelProviderProps {
  children: React.ReactNode;
  mixpanelToken?: string;
}

const MixpanelProvider: FC<MixpanelProviderProps> = ({ children, mixpanelToken }) => {
  const [mixpanelInstance, setMixpanelInstance] = useState<Mixpanel | null>(null);

  useEffect(() => {
    if (mixpanelToken) {
      mixpanel.init(mixpanelToken);
      setMixpanelInstance(mixpanel);
    } else {
      console.warn('Mixpanel token not provided. Mixpanel will not be initialized.');
    }
  }, [mixpanelToken]);

  return <MixpanelContext.Provider value={mixpanelInstance}>{children}</MixpanelContext.Provider>;
};

export default MixpanelProvider;
