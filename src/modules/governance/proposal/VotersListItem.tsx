import { Avatar, Box, Typography } from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import { useState } from 'react';
import useGetEns from 'src/libs/hooks/use-get-ens';

import { textCenterEllipsis } from '../../../helpers/text-center-ellipsis';
import type { GovernanceVoter } from './VotersList';

type VotersListItemProps = {
  voter: GovernanceVoter;
};

export const VotersListItem = ({ voter }: VotersListItemProps): JSX.Element => {
  const { address, avatar } = voter;
  const { name: ensName, avatar: ensAvatar } = useGetEns(address);
  const [useBlockie, setUseBlockie] = useState(true);

  const ensNameAbbreviated = ensName
    ? ensName.length > 18
      ? textCenterEllipsis(ensName, 12, 3)
      : ensName
    : undefined;

  const displayName =
    ensNameAbbreviated ?? textCenterEllipsis(address, ensNameAbbreviated ? 12 : 7, 4);

  const blockie = makeBlockie(address !== '' ? address : 'default');
  const displayAvatar = avatar ?? useBlockie ? blockie : ensAvatar;

  return (
    <Box sx={{ my: 6, '&:first-child': { mt: 0 }, '&:last-child': { mb: 0 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Avatar
            src={displayAvatar}
            sx={{ width: 24, height: 24, mr: 2 }}
            onError={() => setUseBlockie(true)}
          />
          <Typography variant="subheader1" color="primary">
            {displayName}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subheader1" color={voter.vote ? 'success.main' : 'error.main'}>
            {voter.vote ? 'YAE' : 'NAY'}
          </Typography>
          <Typography variant="subheader1" color="primary">
            {voter.votingPower}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VotersListItem;
