import { Paper as PaperBase, styled } from '@mui/material';

export const Paper = styled(PaperBase, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen?: boolean }>(({ isOpen }) => ({
  flex: 1,
  border: '1px solid #FFFFFF4D',
  borderRadius: 4,
  padding: 24,
  maxBlockSize: 'fit-content',
  blockSize: isOpen ? 1000 : 88,
  overflow: 'hidden',
  transition: 'block-size .25s ease',
}));
