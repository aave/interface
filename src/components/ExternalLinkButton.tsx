import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Button, ButtonProps, SvgIcon } from '@mui/material';
import { forwardRef } from 'react';

import { Link, LinkProps } from './primitives/Link';

type ExternalLinkButtonProps = ButtonProps & Omit<LinkProps, 'variant'>;

const ExternalLinkButton = forwardRef<HTMLAnchorElement, ExternalLinkButtonProps>((props, ref) => (
  <Button
    component={Link}
    variant={props.variant || 'outlined'}
    endIcon={
      <SvgIcon sx={{ width: 14, height: 14 }}>
        <ExternalLinkIcon />
      </SvgIcon>
    }
    {...props}
    ref={ref}
  />
));

export default ExternalLinkButton;
