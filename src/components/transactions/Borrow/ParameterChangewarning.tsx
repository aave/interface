import { Trans } from '@lingui/macro';
import { Warning } from 'src/components/primitives/Warning';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

export const ParameterChangewarning = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Warning severity="info" sx={{ my: 6 }}>
      <Trans>
        <b>Attention:</b> Parameter changes can alter your account health factor and risk of
        liquidation. Follow us{' '}
        <a
          onClick={() => {
            trackEvent(GENERAL.EXTERNAL_LINK, {
              asset: underlyingAsset,
              Link: 'Governance Link',
            });
          }}
          href="#"
        >
          In Discord
        </a>{' '}
        for updates.
      </Trans>
    </Warning>
  );
};
