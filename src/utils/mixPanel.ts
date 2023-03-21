import { useContext } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import MixpanelContext from 'src/libs/Mixpanel/MixpanelContext';

const useMixpanelTrack = () => {
  const { currentAccount: walletAddress } = useWeb3Context();
  const mixpanel = useContext(MixpanelContext);

  const trackEvent = (eventName: string, eventProperties: Record<string, unknown> = {}): void => {
    if (mixpanel) {
      const properties = {
        ...eventProperties,
        walletAddress: walletAddress,
      };
      mixpanel.track(eventName, properties);
    }
  };

  return trackEvent;
};

export default useMixpanelTrack;
