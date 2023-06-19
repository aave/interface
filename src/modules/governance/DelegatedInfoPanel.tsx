import { Trans } from '@lingui/macro';
import { Button, Divider, Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { AvatarSize } from 'src/components/Avatar';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ExternalUserDisplay } from 'src/components/UserDisplay';
import { useGovernanceTokens } from 'src/hooks/governance/useGovernanceTokens';
import { usePowers } from 'src/hooks/governance/usePowers';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { GOVERNANCE_PAGE } from 'src/utils/mixPanelEvents';

type DelegatedPowerProps = {
  user: string;
  aavePower: string;
  stkAavePower: string;
  aaveDelegatee: string;
  stkAaveDelegatee: string;
  title: string;
};

const DelegatedPower: React.FC<DelegatedPowerProps> = ({
  user,
  aavePower,
  stkAavePower,
  aaveDelegatee,
  stkAaveDelegatee,
  title,
}) => {
  const isAaveSelfDelegated = !aaveDelegatee || user === aaveDelegatee;
  const isStkAaveSelfDelegated = !stkAaveDelegatee || user === stkAaveDelegatee;

  if (isAaveSelfDelegated && isStkAaveSelfDelegated) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 6, mb: 2 }}>
      <Typography typography="caption" sx={{ mb: 5 }} color="text.secondary">
        <Trans>{title}</Trans>
      </Typography>
      <Box sx={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
        {aaveDelegatee === stkAaveDelegatee ? (
          <Row
            align="flex-start"
            caption={
              <ExternalUserDisplay
                avatarProps={{ size: AvatarSize.XS }}
                titleProps={{ variant: 'subheader1' }}
                address={aaveDelegatee}
              />
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <FormattedNumber
                value={Number(aavePower) + Number(stkAavePower)}
                variant="subheader1"
              />
              <Typography variant="helperText" color="text.secondary">
                AAVE + stkAAVE
              </Typography>
            </Box>
          </Row>
        ) : (
          <>
            {!isAaveSelfDelegated && aavePower !== '0' && (
              <Row
                align="flex-start"
                caption={
                  <ExternalUserDisplay
                    avatarProps={{ size: AvatarSize.XS }}
                    titleProps={{ variant: 'subheader1' }}
                    address={aaveDelegatee}
                  />
                }
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TokenIcon symbol="AAVE" sx={{ width: 16, height: 16 }} />
                  <FormattedNumber value={aavePower} variant="subheader1" />
                </Box>
              </Row>
            )}
            {!isStkAaveSelfDelegated && stkAavePower !== '0' && (
              <Row
                align="flex-start"
                caption={
                  <ExternalUserDisplay
                    avatarProps={{ size: AvatarSize.XS }}
                    titleProps={{ variant: 'subheader1' }}
                    address={stkAaveDelegatee}
                  />
                }
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TokenIcon symbol="stkAAVE" sx={{ width: 16, height: 16 }} />
                  <FormattedNumber value={stkAavePower} variant="subheader1" />
                </Box>
              </Row>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export const DelegatedInfoPanel = () => {
  const address = useRootStore((store) => store.account);
  const {
    data: { aave, stkAave },
  } = useGovernanceTokens();
  const { data: powers } = usePowers();
  const { openGovDelegation, openRevokeGovDelegation } = useModalContext();
  const trackEvent = useRootStore((store) => store.trackEvent);

  if (!powers || !address) return null;
  const disableButton = Number(aave) <= 0 && Number(stkAave) <= 0;
  //   powers.aavePropositionDelegatee === '' &&
  //   powers.aaveVotingDelegatee === '';
  // powers.stkAavePropositionDelegatee === '' && powers.stkAaveVotingDelegatee === '';

  const showRevokeButton =
    powers.aavePropositionDelegatee !== '' ||
    powers.aaveVotingDelegatee !== '' ||
    powers.stkAavePropositionDelegatee !== '' ||
    powers.stkAaveVotingDelegatee !== '';

  return (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ px: 6, pb: 6, pt: 4 }}>
        <Typography typography="h3">
          <Trans>Delegated power</Trans>
        </Typography>
        <Typography typography="description" sx={{ mt: 1 }} color="text.secondary">
          <Trans>
            Use your AAVE and stkAAVE balance to delegate your voting and proposition powers. You
            will not be sending any tokens, only the rights to vote and propose changes to the
            protocol. You can re-delegate or revoke power to self at any time.
          </Trans>
          <Link
            href="https://docs.aave.com/developers/v/2.0/protocol-governance/governance"
            target="_blank"
            variant="description"
            color="text.secondary"
            sx={{ textDecoration: 'underline', ml: 1 }}
            onClick={() => trackEvent(GOVERNANCE_PAGE.LEARN_MORE_DELEGATION)}
          >
            <Trans>Learn more.</Trans>
          </Link>
        </Typography>
        {disableButton ? (
          <Typography variant="description" color="text.muted" mt={6}>
            <Trans>You have no AAVE/stkAAVE balance to delegate.</Trans>
          </Typography>
        ) : (
          <>
            <DelegatedPower
              aavePower={aave}
              stkAavePower={stkAave}
              aaveDelegatee={powers.aaveVotingDelegatee}
              stkAaveDelegatee={powers.stkAaveVotingDelegatee}
              user={address}
              title="Voting power"
            />
            <DelegatedPower
              aavePower={aave}
              stkAavePower={stkAave}
              aaveDelegatee={powers.aavePropositionDelegatee}
              stkAaveDelegatee={powers.stkAavePropositionDelegatee}
              user={address}
              title="Proposition power"
            />
          </>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          size="large"
          sx={{ width: '100%' }}
          variant="contained"
          disabled={disableButton}
          onClick={() => openGovDelegation()}
        >
          <Trans>Set up delegation</Trans>
        </Button>
        {showRevokeButton && (
          <Button
            size="large"
            sx={{ width: '100%' }}
            variant="outlined"
            disabled={disableButton}
            onClick={() => openRevokeGovDelegation()}
          >
            <Trans>Revoke power</Trans>
          </Button>
        )}
      </Box>
    </Paper>
  );
};
