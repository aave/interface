import { ManekiModalChildProps } from 'src/maneki/components/ManekiModalWrapper';

import { TGEModalActions } from './TGEModalActions';

export const TGEModalContent = ({
  symbol,
  isWrongNetwork,
  action,
  amount,
}: ManekiModalChildProps & { amount: string }) => {
  return <>{action && <TGEModalActions {...{ action, symbol, amount, isWrongNetwork }} />}</>;
};
