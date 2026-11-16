import { Button, ButtonProps } from '@mui/material';
import { ReactNode } from 'react';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { Link } from 'src/components/primitives/Link';

interface ExternalLinkButtonProps {
  children: ReactNode;
  href: string;
  onClick?: () => void;
  variant?: ButtonProps['variant'];
}

const END_ICON = <ArrowUpRightIcon sx={{ color: 'fg-3' }} />;

export const ExternalLinkButton = ({
  children,
  href,
  onClick,
  variant = 'outlined',
}: ExternalLinkButtonProps) => {
  return (
    <Button
      variant={variant}
      size="small"
      component={Link}
      href={href}
      onClick={onClick}
      endIcon={END_ICON}
    >
      {children}
    </Button>
  );
};
