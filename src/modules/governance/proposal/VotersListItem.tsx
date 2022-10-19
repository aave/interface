import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';

import { textCenterEllipsis } from '../../../helpers/text-center-ellipsis';
import type { GovernanceVoter } from './VotersListContainer';

type VotersListItemProps = {
  voter: GovernanceVoter;
};

export const VotersListItem = ({ voter }: VotersListItemProps): JSX.Element | null => {
  const { address, ensAvatar, ensName, proposalVotingPower, twitterAvatar } = voter;

  // For avatars, the order of precedence is Twitter, then ENS, then default Blockie
  // If ENS avatar does not exist, then use Blockie
  const [displayAvatar, setDisplayAvatar] = useState<string>(
    twitterAvatar ?? ensAvatar ?? makeBlockie(address)
  );

  // If voter has an ENS name, show it, otherwise, show address. Both will be abbreviated, except short ENS names.
  const displayName = ensName
    ? ensName.length > 18
      ? textCenterEllipsis(ensName, 12, 3)
      : ensName
    : textCenterEllipsis(address, 8, 3);

  // Voting power - convert the bignumber for displaying. Adjust decimals based off of large and small values.
  // Zero decimals for 1000<n. Two for 1<n<1000. Four for 0<n<1.
  const displayVotingPower = proposalVotingPower / 10 ** 18;
  const displayVotingPowerDecimals = displayVotingPower < 1 ? 4 : displayVotingPower < 1000 ? 2 : 0;

  // Don't show any results that come back with zero or negative voting power
  if (voter.proposalVotingPower <= 0) return null;

  return (
    <Box sx={{ my: 6, '&:first-of-type': { mt: 0 }, '&:last-of-type': { mb: 0 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Avatar
            src={displayAvatar}
            sx={{ width: 24, height: 24, mr: 2 }}
            onError={() => setDisplayAvatar(makeBlockie(address))}
          />
          <Link href={`https://etherscan.io/address/${address}`}>
            <Typography
              variant="subheader1"
              color="primary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {displayName}
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
            maxWidth: 90,
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
          />
        </Box>
      </Box>
    </Box>
  );
};

export default VotersListItem;
