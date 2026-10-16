import { alpha, IconButton, Modal, Paper, PaperProps } from '@mui/material';
import React, { createContext, forwardRef, useContext, useLayoutEffect, useState } from 'react';

import { CloseIcon } from '../icons/CloseIcon';

export interface BasicModalProps {
  open: boolean;
  children: React.ReactNode;
  setOpen: (value: boolean) => void;
  withCloseButton?: boolean;
  contentMaxWidth?: number;
  minContentHeight?: number;
  contentHeight?: number;
  closeCallback?: () => void;
  disableEnforceFocus?: boolean;
  BackdropProps?: object;
}

const HideCloseButtonContext = createContext<(hidden: boolean) => void>(() => undefined);

export const useHideModalCloseButton = () => {
  const setHidden = useContext(HideCloseButtonContext);
  useLayoutEffect(() => {
    setHidden(true);
    return () => setHidden(false);
  }, [setHidden]);
};

interface BasicModalSurfaceProps extends Omit<PaperProps, 'variant'> {
  withCloseButton?: boolean;
  contentMaxWidth?: number;
  contentHeight?: number;
  onClose?: () => void;
}

export const BasicModalSurface = forwardRef<HTMLDivElement, BasicModalSurfaceProps>(
  function BasicModalSurface(
    {
      withCloseButton = true,
      contentMaxWidth = 420,
      contentHeight,
      onClose,
      children,
      sx,
      ...rest
    },
    ref
  ) {
    const [closeButtonHidden, setCloseButtonHidden] = useState(false);

    return (
      <Paper
        ref={ref}
        variant="modal"
        sx={[
          {
            position: 'relative',
            margin: '10px',
            overflowY: 'auto',
            width: '100%',
            maxWidth: { xs: '359px', xsm: `${contentMaxWidth}px` },
            height: contentHeight ? `${contentHeight}px` : 'auto',
            maxHeight: contentHeight ? `${contentHeight}px` : 'calc(100dvh - 20px)',
            p: 6,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        <HideCloseButtonContext.Provider value={setCloseButtonHidden}>
          {children}
        </HideCloseButtonContext.Provider>

        {withCloseButton && !closeButtonHidden && (
          <IconButton
            sx={{
              position: 'absolute',
              top: '21px',
              right: '24px',
              zIndex: 5,
              borderRadius: '0.375rem',
              p: 0,
              '&:hover': {
                backgroundColor: (theme) =>
                  alpha(theme.palette.text.primary, theme.palette.action.hoverOpacity),
              },
            }}
            onClick={onClose}
            data-cy={'close-button'}
          >
            <CloseIcon data-cy={'CloseModalIcon'} sx={{ fontSize: '30px', color: 'fg-3' }} />
          </IconButton>
        )}
      </Paper>
    );
  }
);

export const BasicModal = ({
  open,
  setOpen,
  withCloseButton,
  contentMaxWidth,
  minContentHeight,
  contentHeight,
  children,
  closeCallback,
  disableEnforceFocus,
  BackdropProps,
  ...props
}: BasicModalProps) => {
  const handleClose = () => {
    if (closeCallback) closeCallback();
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      disableEnforceFocus={disableEnforceFocus} // Used for wallet modal connection
      BackdropProps={BackdropProps}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '.MuiPaper-root': {
          outline: 'none',
        },
        '.MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.32)',
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      {...props}
      data-cy={'Modal'}
    >
      <BasicModalSurface
        withCloseButton={withCloseButton}
        contentMaxWidth={contentMaxWidth}
        contentHeight={contentHeight}
        onClose={handleClose}
      >
        {children}
      </BasicModalSurface>
    </Modal>
  );
};
