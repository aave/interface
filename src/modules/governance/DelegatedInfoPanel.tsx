import { Trans } from '@lingui/macro';
import { Button, Divider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { AvatarSize } from 'src/components/Avatar';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ExternalUserDisplay } from 'src/components/UserDisplay';
import { useAaveTokensProviderContext } from 'src/hooks/governance-data-provider/AaveTokensDataProvider';
import { useVotingPower } from 'src/hooks/governance-data-provider/useVotingPower';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

type DelegatedPowerProps = {
  user: string;
  aavePower: string;
  stkAavePower: string;
  aaveDelegatee: string;
  stkAaveDelegatee: string;
};

const DelegatedPower: React.FC<DelegatedPowerProps> = ({
  user,
  aavePower,
  stkAavePower,
  aaveDelegatee,
  stkAaveDelegatee,
}) => {
  const isAaveSelfDelegated = !aaveDelegatee || user === aaveDelegatee;
  const isStkAaveSelfDelegated = !stkAaveDelegatee || user === stkAaveDelegatee;
  if (aaveDelegatee === stkAaveDelegatee || (isAaveSelfDelegated && isStkAaveSelfDelegated)) {
    return (
      <Row
        caption={
          isAaveSelfDelegated ? (
            <Typography variant="subheader1">
              <Trans>Self delegation</Trans>
            </Typography>
          ) : (
            <ExternalUserDisplay
              avatarProps={{ size: AvatarSize.XS }}
              titleProps={{ variant: 'subheader1' }}
              address={aaveDelegatee}
            />
          )
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <FormattedNumber value={Number(aavePower) + Number(stkAavePower)} color="text.primary" />
          <Typography variant="helperText" color="text.secondary">
            AAVE + stkAAVE
          </Typography>
        </Box>
      </Row>
    );
  } else {
    return (
      <Box sx={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
        {aavePower != '0' && (
          <Row
            caption={
              isAaveSelfDelegated ? (
                <Typography variant="subheader1">
                  <Trans>Self delegation</Trans>
                </Typography>
              ) : (
                <ExternalUserDisplay
                  avatarProps={{ size: AvatarSize.XS }}
                  titleProps={{ variant: 'subheader1' }}
                  address={aaveDelegatee}
                />
              )
            }
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TokenIcon symbol="AAVE" sx={{ width: 16, height: 16 }} />
              <FormattedNumber value={aavePower} />
            </Box>
          </Row>
        )}
        {stkAavePower != '0' && (
          <Row
            caption={
              isStkAaveSelfDelegated ? (
                <Typography variant="subheader1">
                  <Trans>Self delegation</Trans>
                </Typography>
              ) : (
                <ExternalUserDisplay
                  avatarProps={{ size: AvatarSize.XS }}
                  titleProps={{ variant: 'subheader1' }}
                  address={stkAaveDelegatee}
                />
              )
            }
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TokenIcon symbol="stkAAVE" sx={{ width: 16, height: 16 }} />
              <FormattedNumber value={stkAavePower} />
            </Box>
          </Row>
        )}
      </Box>
    );
  }
};

export const DelegatedInfoPanel = () => {
  const powers = useVotingPower();
  const {
    daveTokens: { aave, stkAave },
  } = useAaveTokensProviderContext();
  const address = useRootStore((store) => store.account);
  const { openGovDelegation } = useModalContext();

  if (!powers || !address) return null;

  return (
    <Box sx={{ px: 6, py: 6, mt: 2 }}>
      <Typography typography="h3">
        <Trans>Delegating to</Trans>
      </Typography>
      <Typography typography="description" sx={{ mb: 6, mt: 1 }} color="text.secondary">
        <Trans>
          Delegate your voting/proposition power using your AAVE and stkAAVE balance. You won&apos;t
          send any tokens, only voting/proposition rights, and you can re-delegate it at any time.
          Learn more
        </Trans>
      </Typography>
      <Typography typography="caption" sx={{ mb: 5 }} color="text.secondary">
        <Trans>Voting power</Trans>
      </Typography>
      <DelegatedPower
        aavePower={aave}
        stkAavePower={stkAave}
        aaveDelegatee={powers.aaveVotingDelegatee}
        stkAaveDelegatee={powers.stkAaveVotingDelegatee}
        user={address}
      />
      <Typography typography="caption" sx={{ mb: 5, mt: 8 }} color="text.secondary">
        <Trans>Proposition power</Trans>
      </Typography>
      <DelegatedPower
        aavePower={aave}
        stkAavePower={stkAave}
        aaveDelegatee={powers.aavePropositionDelegatee}
        stkAaveDelegatee={powers.stkAavePropositionDelegatee}
        user={address}
      />
      <Divider sx={{ mt: 6 }} />
      <Box sx={{ pt: 6 }}>
        <Button
          sx={{ width: '100%' }}
          variant="contained"
          disabled={
            powers?.votingPower === '0' &&
            powers?.propositionPower === '0' &&
            powers?.aaveVotingDelegatee === '' &&
            powers?.aavePropositionDelegatee === '' &&
            powers?.stkAavePropositionDelegatee === '' &&
            powers?.stkAaveVotingDelegatee === ''
          }
          onClick={() => openGovDelegation()}
        >
          <Trans>Set up delegation</Trans>
        </Button>
      </Box>
    </Box>
  );
};
