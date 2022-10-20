import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import { SyntheticEvent, useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import usePreviousState from 'src/hooks/usePreviousState';

import { textCenterEllipsis } from '../../../helpers/text-center-ellipsis';
import type { GovernanceVoter } from './VotersListContainer';

type VotersListItemProps = {
  compact: boolean;
  voter: GovernanceVoter;
};

export const VotersListItem = ({ compact, voter }: VotersListItemProps): JSX.Element | null => {
  const { address, ensAvatar, ensName, proposalVotingPower, twitterAvatar } = voter;
  const blockieAvatar = makeBlockie(address !== '' ? address : 'default');

  // For avatars, the order of precedence is Twitter, then ENS, then default Blockie
  // If ENS avatar does not exist, then use Blockie
  const [displayAvatar, setDisplayAvatar] = useState<string>(
    twitterAvatar ?? ensAvatar ?? blockieAvatar
  );
  const [avatarErrored, setAvatarErrored] = useState<boolean>(false);
  const prevAvatarErrored = usePreviousState<boolean>(avatarErrored);
  const handleAvatarError = (e: SyntheticEvent) => {
    e.preventDefault();
    setAvatarErrored(true);
  };
  useEffect(() => {
    if (!prevAvatarErrored && avatarErrored) setDisplayAvatar(blockieAvatar);
  }, [avatarErrored]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // This function helps determine how to display either the address or ENS name, in a way where the list looks good and names are about equal length. This takes into account if the list should be compact or not.
  const displayName = (name: string) => {
    if (compact) {
      // Addresses when compact
      if (name === address) {
        return textCenterEllipsis(name, 3, 3);
      }
      // ENS names when compact
      const compactName = name.length <= 10 ? name : textCenterEllipsis(name, 4, 3);
      return compactName;
    }
    // Addresses
    if (name === address) {
      return textCenterEllipsis(name, 9, 3);
    }
    // ENS names
    return name.length < 16 ? name : textCenterEllipsis(name, 12, 3);
  };

  // Voting power - convert the bignumber for displaying. Adjust decimals based off of large and small values.
  // Decimals increase in precision as values become lower:
  // Four for 0<n<1.
  // Three for 1<=n<10.
  // Two for 10<=n<1000.
  // Zero decimals for 1000<=n<Infinity.
  const displayVotingPower = proposalVotingPower / 10 ** 18;
  const displayVotingPowerDecimals =
    displayVotingPower < 1
      ? 4
      : displayVotingPower < 10
      ? 3
      : displayVotingPower < 1000 || displayVotingPower > 1000000
      ? 2
      : displayVotingPower > 100000
      ? 1
      : 0;

  // Don't show any results that come back with zero or negative voting power
  if (voter.proposalVotingPower <= 0) return null;

  return (
    <Box sx={{ my: 6, '&:first-of-type': { mt: 0 }, '&:last-of-type': { mb: 0 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Avatar
            src={displayAvatar}
            sx={{ width: 24, height: 24, mr: 2 }}
            onError={handleAvatarError}
          />
          <Link href={`https://etherscan.io/address/${address}`}>
            <Typography
              variant="subheader1"
              color="primary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {displayName(ensName ?? address)}
              <SvgIcon sx={{ width: 14, height: 14, ml: 0.5 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Typography>
          </Link>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: compact ? 82 : 96,
          }}
        >
          <Typography variant="subheader1" color={voter.vote ? 'success.main' : 'error.main'}>
            {voter.vote ? 'YAE' : 'NAY'}
          </Typography>
          <FormattedNumber
            variant="subheader1"
            color="primary"
            value={displayVotingPower}
            visibleDecimals={displayVotingPowerDecimals}
            roundDown
          />
        </Box>
      </Box>
    </Box>
  );
};

export default VotersListItem;
