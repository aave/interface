import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

export const CustomSlider = styled(Slider)({
  color: '#46BC4B',
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-rail': {
    border: 'none',
    color: '#EAEBEF',
  },
  '& .MuiSlider-thumb': {
    height: 15,
    width: 15,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-mark': {
    color: '#fff',
  },
  '& .MuiSlider-markLabel': {
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '26px',
    letterSpacing: '0.1px',
    color: '#A5A8B6',
  },
  '& .MuiSlider-markLabel[data-index="0"]': {
    transform: 'translateX(0%)',
  },
  '& .MuiSlider-markLabel[data-index="1"]': {
    transform: 'translateX(-100%)',
  },
});
