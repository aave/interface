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
  BASE_SUCCESS_CASES,
  BLOCKING_ERROR_CASES,
  INLINE_ERROR_CASES,
  MOCK_TX_HASH,
  MockCase,
  SUCCESS_CASES,
  SWAP_CASES,
  SWAP_INLINE_ERROR_CASES,
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
      description="One example per layout, rendered with mock data; each label lists the flows that share it. The modal and wallet contexts are mocked, so Done and Add to wallet do nothing."
    >
      <CaseGroup
        title="Success — TxSuccessView"
        cases={SUCCESS_CASES}
        render={(props) => <TxSuccessView {...props} />}
      />
      <CaseGroup
        title="Success — BaseSuccessView"
        cases={BASE_SUCCESS_CASES}
        render={(props) => <BaseSuccessView {...props} />}
      />
      <CaseGroup
        title="Swap result — SwapTxSuccessView"
        cases={SWAP_CASES}
        render={(props) => <SwapTxSuccessView {...props} />}
      />
      <CaseGroup
        title="Failed — TxErrorView"
        cases={BLOCKING_ERROR_CASES}
        render={(txError) => <TxErrorView txError={txError} />}
      />
      <CaseGroup
        title="Failed, inline — GasEstimationError"
        cases={INLINE_ERROR_CASES}
        render={(txError) => <GasEstimationError txError={txError} />}
      />
      <CaseGroup
        title="Failed, inline (swap) — GasEstimationError with tip"
        cases={SWAP_INLINE_ERROR_CASES}
        render={(props) => <SwapGasEstimationError {...props} />}
      />
    </Section>
  </MockTxProvider>
);
