import { Typography } from '@mui/material';
import React, { JSXElementConstructor, ReactElement, useState } from 'react';

import { ContentWithTooltip } from '../ContentWithTooltip';

interface HelpTourTooltipProps {
  tooltipContent: ReactElement<string | JSXElementConstructor<string>>;
  tour: ReactElement<string | JSXElementConstructor<string>>;
}

export const HelpTourTooltip = ({ tour, tooltipContent }: HelpTourTooltipProps) => {
  const [openTooltip, setOpenTooltip] = useState(false);

  return (
    <ContentWithTooltip
      tooltipContent={tooltipContent}
      placement={'left'}
      open={openTooltip}
      offset={[0, 10]}
    >
      <Typography onMouseOver={() => setOpenTooltip(true)} onMouseOut={() => setOpenTooltip(false)}>
        {tour}
      </Typography>
    </ContentWithTooltip>
  );
};
