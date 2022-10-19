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
  const { address, ensAvatar, ensName, twitterAvatar } = voter;
  const [useBlockie, setUseBlockie] = useState(false);

  // If voter has an ENS name, show it, otherwise, show address. Both will be abbreviated, except short ENS names.
  const displayName = ensName
    ? ensName.length > 18
      ? textCenterEllipsis(ensName, 12, 3)
      : ensName
    : textCenterEllipsis(address, 8, 3);

  // For avatars, the order of precedence is Twitter, then ENS, then default Blockie
  // If ENS avatar does not exist, then use Blockie
  const displayAvatar = useBlockie
    ? makeBlockie(address)
    : twitterAvatar ?? ensAvatar ?? makeBlockie(address);

  // Don't show any results that come back with zero or negative voting power
  if (voter.proposalVotingPower <= 0) return null;

  return (
    <Box sx={{ my: 6, '&:first-child': { mt: 0 }, '&:last-child': { mb: 0 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Avatar
            src={displayAvatar}
            sx={{ width: 24, height: 24, mr: 2 }}
            onError={() => setUseBlockie(true)}
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
          <Typography variant="subheader1" color="primary">
            <FormattedNumber
              value={voter.proposalVotingPower}
              visibleDecimals={
                voter.proposalVotingPower < 1 ? 4 : voter.proposalVotingPower < 1000 ? 2 : 0
              }
            />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VotersListItem;
