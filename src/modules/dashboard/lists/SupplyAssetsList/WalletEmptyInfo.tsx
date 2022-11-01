import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Warning } from 'src/components/primitives/Warning';
import { NetworkConfig } from 'src/ui-config/networksConfig';

import { Link } from '../../../../components/primitives/Link';

type WalletEmptyInfoProps = Pick<NetworkConfig, 'bridge' | 'name'> & {
  chainId: number;
  icon?: boolean;
};

export function WalletEmptyInfo({ bridge, name, chainId, icon }: WalletEmptyInfoProps) {
  const network = [ChainId.avalanche].includes(chainId) ? 'Ethereum & Bitcoin' : 'Ethereum';
  return (
    <Warning severity="info" icon={icon}>
      {bridge ? (
        <Trans>
          Your {name} wallet is empty. Purchase or transfer assets or use{' '}
          {<Link href={bridge.url}>{bridge.name}</Link>} to transfer your {network} assets.
        </Trans>
      ) : (
        <Trans>Your {name} wallet is empty. Purchase or transfer assets.</Trans>
      )}
    </Warning>
  );
}
