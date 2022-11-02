import React from 'react';
import { useGovernanceDataSubscription } from 'src/store/root';

/**
 * Naive provider that subscribes to governance data.
 * Once next.js supports layouts this should go to the layouts section.
 * @param param0
 * @returns
 */
export const GovernanceDataProvider: React.FC = () => {
  useGovernanceDataSubscription();
  return null;
};
