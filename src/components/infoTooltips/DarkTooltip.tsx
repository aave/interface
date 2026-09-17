import { Box, Tooltip, TooltipProps } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';

export const DarkTooltip = ({
  title,
  children,
  wrap,
  enterTouchDelay,
  leaveTouchDelay,
}: TooltipProps & { wrap?: boolean; enterTouchDelay?: number; leaveTouchDelay?: number }) => {
  return (
    <div>
      <Tooltip
        placement="top"
        enterTouchDelay={enterTouchDelay}
        leaveTouchDelay={leaveTouchDelay}
        componentsProps={{
          tooltip: {
            sx: {
              color: 'fg-1',
              bgcolor: 'scrim',
              backdropFilter: 'blur(12px)',
              borderRadius: '0.5rem',
              boxShadow: `0 1px 12px 0 ${figVars['shadow-medium']}, inset 0 0 0 1px ${figVars['border-0']}`,
              '& .MuiTooltip-arrow': {
                color: 'scrim',
              },
            },
          },
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -8],
                },
              },
            ],
          },
        }}
        title={
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: wrap ? 'normal' : 'nowrap',
            }}
          >
            {title}
          </Box>
        }
      >
        {children}
      </Tooltip>
    </div>
  );
};
