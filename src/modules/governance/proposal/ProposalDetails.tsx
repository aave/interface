import { Trans } from '@lingui/macro';
import { Paper, Typography } from '@mui/material';

// const formatTime = (timestamp: number): string =>
//   dayjs.unix(timestamp).format('D MMM YYYY, HH:mm UTC Z');

export const ProposalDetails = () => {
  // const proposalHasExpired: boolean = false;
  /*
   proposal
    ? dayjs() > dayjs.unix(proposal.expirationTimestamp)
    : false;
  */
  // const trackEvent = useRootStore((store) => store.trackEvent);
  return (
    <Paper sx={{ px: 6, py: 4 }}>
      <Typography variant="h3" sx={{ mb: '22px' }}>
        <Trans>Proposal details</Trans>
      </Typography>
      {/* {proposal ? (
        <>
          <Row
            caption={
              <>
                <Trans>Created</Trans>
                <Typography variant="caption" color="text.muted">
                  Block
                </Typography>
              </>
            }
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography>{formatTime(proposal.proposalData.proposalData.creationTime)}</Typography>
              <Typography variant="caption" color="text.muted">
                {proposal.proposalCreated}
              </Typography>
            </Box>
          </Row>
          <Row
            caption={
              <>
                <Trans>Started</Trans>
                <Typography variant="caption" color="text.muted">
                  Block
                </Typography>
              </>
            }
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography>{formatTime(proposal.startTimestamp)}</Typography>
              <Typography variant="caption" color="text.muted">
                {proposal.startBlock}
              </Typography>
            </Box>
          </Row>
          {proposalHasExpired ? (
            <Row
              caption={
                <>
                  <Trans>Ended</Trans>
                  <Typography variant="caption" color="text.muted">
                    Block
                  </Typography>
                </>
              }
              sx={{ height: 48 }}
              captionVariant="description"
            >
              <Box sx={{ textAlign: 'right' }}>
                <Typography>{formatTime(proposal.expirationTimestamp)}</Typography>
                <Typography variant="caption" color="text.muted">
                  {proposal.endBlock}
                </Typography>
              </Box>
            </Row>
          ) : (
            <Row
              caption={
                <>
                  <Trans>Ends</Trans>
                  <Typography variant="caption" color="text.muted">
                    Block
                  </Typography>
                </>
              }
              sx={{ height: 48 }}
              captionVariant="description"
            >
              <Box sx={{ textAlign: 'right' }}>
                <Typography>{formatTime(proposal.expirationTimestamp)}</Typography>
                <Typography variant="caption" color="text.muted">
                  {proposal.endBlock}
                </Typography>
              </Box>
            </Row>
          )}
          {proposal.executed && (
            <Row caption={<Trans>Executed</Trans>} sx={{ height: 48 }} captionVariant="description">
              <Typography>{formatTime(proposal.executionTime)}</Typography>
            </Row>
          )}
          {ipfs?.author && (
            <Row caption={<Trans>Author</Trans>} sx={{ height: 48 }} captionVariant="description">
              <Typography
                sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                {ipfs.author}
              </Typography>
            </Row>
          )}
          <Box sx={{ mt: 10, mb: 2, display: 'flex', gap: 2 }}>
            {ipfs?.discussions && (
              <Button
                component={Link}
                target="_blank"
                rel="noopener"
                onClick={() =>
                  trackEvent(GENERAL.EXTERNAL_LINK, {
                    AIP: proposal.id,
                    Link: 'Forum Discussion',
                  })
                }
                href={ipfs.discussions}
                variant="outlined"
                endIcon={
                  <SvgIcon>
                    <ExternalLinkIcon />
                  </SvgIcon>
                }
              >
                <Trans>Forum discussion</Trans>
              </Button>
            )}
            {prerendered && ( // only render the button for prerendered proposals as fro them we can be sure ci already ran
              <Button
                component={Link}
                target="_blank"
                rel="noopener"
                onClick={() =>
                  trackEvent(GENERAL.EXTERNAL_LINK, {
                    AIP: proposal.id,
                    Link: 'Seatbelt Report',
                  })
                }
                href={`https://github.com/bgd-labs/seatbelt-for-ghosts/tree/master/reports/Aave/0xEC568fffba86c094cf06b22134B23074DFE2252c/${String(
                  proposal.id
                ).padStart(3, '0')}.md`}
                variant="outlined"
                endIcon={
                  <SvgIcon>
                    <ExternalLinkIcon />
                  </SvgIcon>
                }
              >
                <Trans>Seatbelt report</Trans>
              </Button>
            )}
          </Box>
        </>
      ) : (
        <>
          <Skeleton variant="rectangular" height={600} />
        </>
      )} */}
    </Paper>
  );
};
