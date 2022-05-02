import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

export const CustomSlider = styled(Slider)({
  color: '#46BC4B',
  height: '5px',
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
    border: '1px solid rgba(70,188,75,0.5)',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
      border: '1px solid rgba(70,188,75,1)',
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
    top: '20px',
  },
  '& .MuiSlider-markLabel[data-index="0"]': {
    transform: 'translateX(0%)',
  },
  '& .MuiSlider-markLabel[data-index="1"]': {
    transform: 'translateX(-100%)',
  },
});
