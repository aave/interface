import { defineMessages } from 'react-intl';

export default defineMessages({
  errorTitle: 'You are connected to the wrong network',
  errorDescription: 'Please change your network to one of: {networks}',
  unsupportedNetwork: 'Unsupported network, use one of: {supportedNetworks}',
  ledgerDisconnected:
    'Ledger device is disconnected or locked. Try again to plug and unlock your Ledger device.',
});
