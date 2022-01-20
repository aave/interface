import { Dispatch, SetStateAction, useState } from 'react';

export const useAaveModal = (
  initialMode = false
): [boolean, Dispatch<SetStateAction<boolean>>, () => void] => {
  const [open, setOpen] = useState(initialMode);
  const toggle = () => setOpen(!open);
  return [open, setOpen, toggle];
};
