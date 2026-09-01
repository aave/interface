import { ArrowLeftIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Button, Container, SvgIcon } from '@mui/material';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { AIP } from 'src/utils/events';

export const ProposalTopPanel = () => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Container sx={{ flex: 'none', alignItems: 'flex-start', py: 6 }}>
      <Button
        component={Link}
        href={ROUTES.governance}
        variant="tertiary"
        size="medium"
        onClick={() => trackEvent(AIP.GO_BACK)}
        color="primary"
        startIcon={
          <SvgIcon fontSize="small">
            <ArrowLeftIcon />
          </SvgIcon>
        }
      >
        <Trans>Go Back</Trans>
      </Button>
    </Container>
  );
};
