import { Trans } from '@lingui/macro';

interface BorrowableOnlyInEModeWarningProps {
  eModeLabels: string[];
}
export const BorrowableOnlyInEModeWarning = ({
  eModeLabels,
}: BorrowableOnlyInEModeWarningProps) => {
  const categories = eModeLabels.join(', ');
  return (
    <Trans>
      Borrowable only in E-Mode: {categories}. Borrowing is disabled outside these E-Mode
      categories.
    </Trans>
  );
};
