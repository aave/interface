import { TxResultView, TxResultViewProps } from './TxResultView';

export type BaseSuccessTxViewProps = Omit<TxResultViewProps, 'status'>;

export const BaseSuccessView = (props: BaseSuccessTxViewProps) => (
  <TxResultView status="success" {...props} />
);
