import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Alert, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import { useRootStore } from 'src/store/root';
import { NetworkConfig } from 'src/ui-config/networksConfig';
import { GENERAL } from 'src/utils/events';

import { Link } from '../../../../components/primitives/Link';

type WalletEmptyInfoProps = Pick<NetworkConfig, 'bridge' | 'name'> & {
  chainId: number;
  sx?: SxProps<Theme>;
};

export function WalletEmptyInfo({ bridge, name, chainId, sx }: WalletEmptyInfoProps) {
  const network = [ChainId.avalanche].includes(chainId) ? 'Ethereum & Bitcoin' : 'Ethereum';

  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Alert severity="info" sx={{ mb: 6, width: '100%', ...sx }}>
      {bridge ? (
        <Trans>
          Your {name} wallet is empty. Purchase or transfer assets or use{' '}
          {
            <Link
              onClick={() => {
                trackEvent(GENERAL.EXTERNAL_LINK, { bridge: bridge.name, Link: 'Bridge Link' });
              }}
              href={bridge.url}
            >
              {bridge.name}
            </Link>
          }{' '}
          to transfer your {network} assets.
        </Trans>
      ) : (
        <Trans>Your {name} wallet is empty. Purchase or transfer assets.</Trans>
      )}
    </Alert>
  );
}
