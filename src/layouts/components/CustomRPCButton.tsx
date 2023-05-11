import { CogIcon } from '@heroicons/react/solid';
import { Box, Button, ListItem, MenuItem, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';

interface CustomRPCButtonProps {
  component?: typeof MenuItem | typeof ListItem;
  handleCLose: () => void;
}

export const CustomRPCButton: React.FC<CustomRPCButtonProps> = ({
  component = ListItem,
  handleCLose,
}) => {
  const { openCustomRPC } = useModalContext();
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.up('md'));

  const handleClick = () => {
    openCustomRPC();
    handleCLose();
  };

  return (
    <Box
      component={component}
      sx={{
        color: { xs: '#F1F1F3', md: 'text.primary' },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <Button
        variant={md ? 'outlined' : 'surface'}
        endIcon={
          <SvgIcon>
            <CogIcon />
          </SvgIcon>
        }
        fullWidth
        onClick={handleClick}
      >
        Set up Custom RPC
      </Button>
    </Box>
  );
};
