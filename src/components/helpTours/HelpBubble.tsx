import { Button } from '@mui/material';
import { keyframes } from '@emotion/react';

const myEffect = keyframes`
    0% {
        box-shadow: 0 0 0 0px rgba(207,85,185, 0.5);
    }
    100% {
        box-shadow: 0 0 0 12.86px rgba(207,85,185, 0);
    }
`;
interface HelpBubbleProps {
  top: string;
  right: string;
}

export const HelpBubble = ({ top, right }: HelpBubbleProps) => {
  return (
    <Button
      aria-haspopup="true"
      sx={{
        bgcolor: '#F148D3',
        borderRadius: '50%',
        position: 'absolute',
        zIndex: 100,
        width: '23.14px',
        height: '23.14px',
        minWidth: '23.14px',
        right: right,
        top: top,
        animation: `${myEffect} 1.5s infinite`,
        '&:hover': { bgcolor: '#F148D3' },
      }}
    />
  );
};
