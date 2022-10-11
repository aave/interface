import { Box } from '@mui/material';

import type { GovernanceVoter } from './VotersList';

type VotersListItemProps = {
  voter: GovernanceVoter;
};

export const VotersListItem = (props: VotersListItemProps): JSX.Element => {
  const { voter } = props;

  return <Box>{voter.address}</Box>;
};

export default VotersListItem;
