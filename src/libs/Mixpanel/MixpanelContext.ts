import { Mixpanel } from 'mixpanel-browser';
import { createContext } from 'react';

const MixpanelContext = createContext<Mixpanel | null>(null);

export default MixpanelContext;
