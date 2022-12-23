import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { JSXElementConstructor, ReactElement } from 'react';

import { ContentWithTooltip } from '../ContentWithTooltip';

interface HelpTourTooltip {
  tooltipContent: ReactElement<any, string | JSXElementConstructor<any>>;
  tour: ReactElement<any, string | JSXElementConstructor<any>>;
}

export const HelpTourTooltip = ({ tour, tooltipContent }: HelpTourTooltip) => {
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
