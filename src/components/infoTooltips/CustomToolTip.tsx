import { Box, Tooltip, TooltipProps } from '@mui/material';

export const CustomTooltip = ({
  title,
  children,
  wrap,
  ...props
}: TooltipProps & { wrap?: boolean }) => {
  return (
    <div>
      <Tooltip
        {...props}
        title={
          title && (
            <Box
              sx={{
                padding: '5px',
                whiteSpace: wrap ? 'normal' : 'nowrap',
              }}
            >
              {title}
            </Box>
          )
        }
      >
        {children}
      </Tooltip>
    </div>
  );
};
