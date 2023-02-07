import { useRootStore } from 'src/store/root';

// TODO: remove this
// currently this reexport is a workaround so i don't have to alter and potentially create conflicts in 200 files
export const useWalletModalContext = () =>
  useRootStore((state) => ({
    isWalletModalOpen: state.isWalletModalOpen,
    setWalletModalOpen: state.setWalletModalOpen,
  }));
