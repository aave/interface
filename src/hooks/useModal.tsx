import { createContext, useContext, useState } from 'react';

export enum ModalType {
  Supply,
}

interface ModalContextType {
  openSupply: (underlyingAsset: string) => void;
  close: () => void;
  type?: ModalType;
  args?: { [key: string]: string };
}

export const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export const ModalContextProvider: React.FC = ({ children }) => {
  // contains the current modal open state if any
  const [type, setType] = useState<ModalType>();
  // contains arbitrary key-value pairs as a modal context
  const [args, setArgs] = useState<{ [key: string]: string }>({});
  return (
    <ModalContext.Provider
      value={{
        openSupply: (underlyingAsset) => {
          setType(ModalType.Supply);
          setArgs({ underlyingAsset });
        },
        close: () => {
          setType(undefined);
          setArgs({});
        },
        type,
        args,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const context = useContext(ModalContext);

  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }

  return context;
};
