import { Box, Tooltip, TooltipProps } from '@mui/material';

export const DarkTooltip = ({ title, children, wrap }: TooltipProps & { wrap?: boolean }) => {
  return (
    <div>
      <Tooltip
        placement="top"
        componentsProps={{
          tooltip: {
            sx: (theme) => ({
              backgroundColor: theme.palette.background.secondary,
              '& .MuiTooltip-arrow': {
                color: theme.palette.background.secondary,
              },
            }),
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
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: wrap ? 'normal' : 'nowrap',
              color: theme.palette.text.secondary,
            })}
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
