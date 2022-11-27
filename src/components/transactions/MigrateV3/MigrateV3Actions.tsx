import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useRootStore } from 'src/store/root';

export const MigrateV3Actions = () => {
  const migrate = useRootStore((store) => store.migrate);
  const getApprovePermitsForSelectedAssets = useRootStore(
    (store) => store.getApprovePermitsForSelectedAssets
  );
  const { approval, action } = useTransactionHandler({
    handleGetTxns: async () => {
      return [];
    },
    handleGetPermitTxns: async (signatures, deadline) => migrate(signatures, deadline),
    tryPermit: true,
  });

  return (
    <div>
      <button onClick={() => approval(getApprovePermitsForSelectedAssets())}>
        Approve with permits
      </button>
      {/* <button onClick={() => }></button> */}
      <button onClick={action}>Migrate</button>
    </div>
  );
};
