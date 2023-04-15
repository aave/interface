import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Button, ButtonProps, SvgIcon } from '@mui/material';
import { forwardRef } from 'react';

import { Link } from './primitives/Link';

interface ExternalLinkButtonProps extends ButtonProps {
  href: string;
}

const ExternalLinkButton = forwardRef<HTMLAnchorElement, ExternalLinkButtonProps>((props, ref) => (
  <Link href={props.href} ref={ref}>
    <Button
      variant="outlined"
      endIcon={
        <SvgIcon sx={{ width: 14, height: 14 }}>
          <ExternalLinkIcon />
        </SvgIcon>
      }
      {...props}
    />
  </Link>
));

export default ExternalLinkButton;
