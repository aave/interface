import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

// * Ugly approach, but after hours of testing, the only approach I could find to keep the thumb inside the boundaries of the track/rail
// Works by scaling the track/rail up to the edges of the thumb width then manually offsetting the track/rail/thumb/labels to the edges of container
export const CustomSlider = styled(Slider)({
  color: '#46BC4B',
  height: '5px',
  '& .MuiSlider-track': {
    border: 'none',
    width: 'calc(100% + 10px)', // *
    transform: 'translateX(-7px)', // *
    top: 'initial',
  },
  '& .MuiSlider-rail': {
    border: 'none',
    color: '#EAEBEF',
    transform: 'scaleX(1.045)', // *
    marginLeft: '0.5px', // *
    top: 'initial',
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
    width: '0px',
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
    transform: 'translateX(-14%)', // *
  },
  '& .MuiSlider-markLabel[data-index="1"]': {
    transform: 'translateX(-92%)', // *
  },
});
