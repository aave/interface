import { ReactNode } from 'react';
import { BasicModalSurface } from 'src/components/primitives/BasicModal';
import { BaseSuccessView } from 'src/components/transactions/FlowCommons/BaseSuccess';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';
import { GasEstimationError as SwapGasEstimationError } from 'src/components/transactions/Swap/errors/shared/GasEstimationError';
import { SwapTxSuccessView } from 'src/components/transactions/Swap/modals/result/SwapResultView';
import { ModalContext, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context, Web3Context } from 'src/libs/hooks/useWeb3Context';

import { Group } from '../Group';
import { Section } from '../Section';
import { Specimen } from '../Specimen';
import {
  AMOUNT_SUCCESS_CASES,
  BLOCKING_ERROR_CASES,
  CUSTOM_SUCCESS_CASES,
  INLINE_ERROR_CASES,
  MOCK_TX_HASH,
  MockCase,
  STATUS_SUCCESS_CASES,
  SWAP_FLOW_CASES,
  SWAP_INLINE_ERROR_CASES,
  SWAP_STATUS_CASES,
} from './utils/mocks';

const MockTxProvider = ({ children }: { children: ReactNode }) => {
  const modalContext = useModalContext();
  const web3ProviderData = useWeb3Context();

  return (
    <ModalContext.Provider
      value={{
        ...modalContext,
        mainTxState: { txHash: MOCK_TX_HASH, success: true },
        close: () => undefined,
      }}
    >
      <Web3Context.Provider
        value={{ web3ProviderData: { ...web3ProviderData, addERC20Token: async () => true } }}
      >
        {children}
      </Web3Context.Provider>
    </ModalContext.Provider>
  );
};

const FRAME_SX = { m: 0, width: { xs: '359px', xsm: '420px' }, maxWidth: '100%' };

interface CaseGroupProps<P> {
  title: string;
  cases: MockCase<P>[];
  render: (props: P) => ReactNode;
}

const CaseGroup = <P,>({ title, cases, render }: CaseGroupProps<P>) => (
  <Group title={title}>
    {cases.map(({ label, modalTitle, props }) => (
      <Specimen key={label} label={label} bare>
        <BasicModalSurface sx={FRAME_SX}>
          {modalTitle && <TxModalTitle title={modalTitle} />}
          {render(props)}
        </BasicModalSurface>
      </Specimen>
    ))}
  </Group>
);

export const TxFinalStatesSection = () => (
  <MockTxProvider>
    <Section
      title="Transaction final states"
      description="What each transaction modal shows once its transaction resolves, rendered with mock data. Props mirror each modal's call site; the modal and wallet contexts are mocked, so Close and Add to wallet do nothing."
    >
      <CaseGroup
        title="Success — TxSuccessView with amount"
        cases={AMOUNT_SUCCESS_CASES}
        render={(props) => <TxSuccessView {...props} />}
      />
      <CaseGroup
        title="Success — TxSuccessView without amount"
        cases={STATUS_SUCCESS_CASES}
        render={(props) => <TxSuccessView {...props} />}
      />
      <CaseGroup
        title="Success — BaseSuccessView with custom content"
        cases={CUSTOM_SUCCESS_CASES}
        render={(props) => <BaseSuccessView {...props} />}
      />
      <CaseGroup
        title="Swap — SwapTxSuccessView by order status"
        cases={SWAP_STATUS_CASES}
        render={(props) => <SwapTxSuccessView {...props} />}
      />
      <CaseGroup
        title="Swap — SwapTxSuccessView copy per flow"
        cases={SWAP_FLOW_CASES}
        render={(props) => <SwapTxSuccessView {...props} />}
      />
      <CaseGroup
        title="Failed — TxErrorView (blocking)"
        cases={BLOCKING_ERROR_CASES}
        render={(txError) => <TxErrorView txError={txError} />}
      />
      <CaseGroup
        title="Failed — GasEstimationError (inline)"
        cases={INLINE_ERROR_CASES}
        render={(txError) => <GasEstimationError txError={txError} />}
      />
      <CaseGroup
        title="Failed — swap GasEstimationError (inline)"
        cases={SWAP_INLINE_ERROR_CASES}
        render={(props) => <SwapGasEstimationError {...props} />}
      />
    </Section>
  </MockTxProvider>
);
