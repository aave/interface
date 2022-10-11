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
    <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
      <Avatar
        src={displayAvatar}
        sx={{ width: 22, height: 22 }}
        onError={() => setUseBlockie(true)}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4">{displayName}</Typography>
      </Box>
    </Box>
  );
};

export default VotersListItem;
