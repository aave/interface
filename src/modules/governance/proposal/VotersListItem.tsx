import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import makeBlockie from 'ethereum-blockies-base64';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import useGetEns from 'src/libs/hooks/use-get-ens';

import { textCenterEllipsis } from '../../../helpers/text-center-ellipsis';
import type { GovernanceVoter } from './VotersListContainer';

type VotersListItemProps = {
  voter: GovernanceVoter;
};

export const VotersListItem = ({ voter }: VotersListItemProps): JSX.Element | null => {
  const { address, avatar } = voter;
  // TODO: ENS name should come back from the API after a backend change is merged
  const { name: ensName, avatar: ensAvatar } = useGetEns(address);
  // TODO: Blockie fallback should happen at the container level
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

  // Don't show any results that come back with zero or negative voting power
  if (voter.votingPower <= 0) return null;

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
              value={voter.votingPower}
              visibleDecimals={voter.votingPower < 1 ? 4 : voter.votingPower < 1000 ? 2 : 0}
            />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VotersListItem;
