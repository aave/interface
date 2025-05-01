export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
}

export interface ValidationData {
  message: string;
  severity: ValidationSeverity;
}

export const validateSlippage = (slippage: string): ValidationData | undefined => {
  try {
    const numberSlippage = Number(slippage);
    if (Number.isNaN(numberSlippage))
      return {
        message: 'Invalid slippage',
        severity: ValidationSeverity.ERROR,
      };
    if (numberSlippage > 30)
      return {
        message: 'Slippage must be lower 30%',
        severity: ValidationSeverity.ERROR,
      };
    if (numberSlippage < 0)
      return {
        message: 'Slippage must be positive',
        severity: ValidationSeverity.ERROR,
      };
    if (numberSlippage > 10)
      return {
        message: 'High slippage',
        severity: ValidationSeverity.WARNING,
      };
    if (numberSlippage < 0.1)
      return {
        message: 'Slippage lower than 0.1% may result in failed transactions',
        severity: ValidationSeverity.WARNING,
      };
    return undefined;
  } catch {
    return { message: 'Invalid slippage', severity: ValidationSeverity.ERROR };
  }
};
