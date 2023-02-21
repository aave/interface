import { Trans } from '@lingui/macro';
import { Button, Divider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
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
  console.log(aaveDelegatee);
  console.log(stkAaveDelegatee);
  if (aaveDelegatee === stkAaveDelegatee || (isAaveSelfDelegated && isStkAaveSelfDelegated)) {
    return (
      <Row
        caption={
          isAaveSelfDelegated ? (
            <Typography variant="subheader1">
              <Trans>Self delegation</Trans>
            </Typography>
          ) : (
            <ExternalUserDisplay address={aaveDelegatee} />
          )
        }
      >
        <FormattedNumber value={aavePower + stkAavePower} />
      </Row>
    );
  } else {
    return (
      <Box>
        <Row
          caption={
            isAaveSelfDelegated ? (
              <Typography variant="subheader1">
                <Trans>Self delegation</Trans>
              </Typography>
            ) : (
              <ExternalUserDisplay address={aaveDelegatee} />
            )
          }
        >
          <FormattedNumber value={aavePower} />
        </Row>
        <Row
          caption={
            isStkAaveSelfDelegated ? (
              <Typography variant="subheader1">
                <Trans>Self delegation</Trans>
              </Typography>
            ) : (
              <ExternalUserDisplay address={stkAaveDelegatee} />
            )
          }
        >
          <FormattedNumber value={stkAavePower} />
        </Row>
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
    <Box>
      <Typography typography="h3">
        <Trans>Delegating to</Trans>
      </Typography>
      <Typography typography="description">
        <Trans>
          Delegate your voting/proposition power using your AAVE and stkAAVE balance. You won&apos;t
          send any tokens, only voting/proposition rights, and you can re-delegate it at any time.
          Learn more
        </Trans>
      </Typography>
      <Typography typography="description">
        <Trans>Voting power</Trans>
      </Typography>
      <DelegatedPower
        aavePower={aave}
        stkAavePower={stkAave}
        aaveDelegatee={powers.aaveVotingDelegatee}
        stkAaveDelegatee={powers.stkAaveVotingDelegatee}
        user={address}
      />
      <Typography typography="description">
        <Trans>Proposition power</Trans>
      </Typography>
      <DelegatedPower
        aavePower={aave}
        stkAavePower={stkAave}
        aaveDelegatee={powers.aavePropositionDelegatee}
        stkAaveDelegatee={powers.stkAavePropositionDelegatee}
        user={address}
      />
      <Divider />
      <Box sx={{ padding: 6 }}>
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
