import { Trans } from '@lingui/macro';
import { Warning } from '../primitives/Warning';
import { Typography } from '@mui/material';

export const AMPLWarning = () => {
  return (
    <Warning>
      <Typography color="black" variant="description">
        Ampleforth<Trans>is an asset affected by rebasing. Visit the </Trans>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://docs.aave.com/developers/guides/ampl-asset-listing"
        >
          <Trans>documentation</Trans>
        </a>
        <Trans>or</Trans>
        <a target="_blank" rel="noreferrer" href="https://faq.ampleforth.org/lending_and_borrowing">
          Ampleforth FAQ
        </a>
        <Trans>to learn more.</Trans>
      </Typography>
    </Warning>
  );
};
