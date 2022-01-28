import { ChevronDownIcon } from '@heroicons/react/outline';
import { Button, SvgIcon } from '@mui/material';

interface ListItemAPYButtonProps {
  stableBorrowRateEnabled: boolean;
  borrowRateMode: string;
  disabled: boolean;
  onClick: () => void;
}

export const ListItemAPYButton = ({
  stableBorrowRateEnabled,
  borrowRateMode,
  disabled,
  onClick,
}: ListItemAPYButtonProps) => {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      size="small"
      endIcon={
        stableBorrowRateEnabled && (
          <SvgIcon sx={{ fontSize: '14px !important' }}>
            <ChevronDownIcon />
          </SvgIcon>
        )
      }
      disabled={disabled}
    >
      {borrowRateMode}
    </Button>
  );
};
