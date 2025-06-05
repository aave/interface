import { Trans } from '@lingui/macro';

function secondsToDHMS(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return { d, h, m, s };
}

export function SecondsToString({ seconds }: { seconds: number }) {
  const { d, h, m, s } = secondsToDHMS(seconds);
  return (
    <>
      {d !== 0 && (
        <span>
          <Trans>{d}d</Trans>
        </span>
      )}
      {h !== 0 && (
        <span>
          <Trans>{h}h</Trans>
        </span>
      )}
      {m !== 0 && (
        <span>
          <Trans>{m}m</Trans>
        </span>
      )}
      {s !== 0 && (
        <span>
          <Trans>{s}s</Trans>
        </span>
      )}
    </>
  );
}
