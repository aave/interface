import { Trans } from '@lingui/macro';
import { RiskAcknowledge } from 'src/components/RiskAcknowledge';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

interface BorrowAmountWarningProps {
  riskCheckboxAccepted: boolean;
  onRiskCheckboxChange: () => void;
}

export const BorrowAmountWarning = ({
  riskCheckboxAccepted,
  onRiskCheckboxChange,
}: BorrowAmountWarningProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <>
      <RiskAcknowledge
        checked={riskCheckboxAccepted}
        onChange={(value) => {
          trackEvent(GENERAL.ACCEPT_RISK, {
            modal: 'Borrow',
            riskCheckboxAccepted: value,
          });

          onRiskCheckboxChange();
        }}
        title={
          <Trans>
            Borrowing this amount will reduce your health factor and increase risk of liquidation.
          </Trans>
        }
      />
    </>
  );
};
