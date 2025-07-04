import { SwitchProvider } from './switch.types';

export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
}

export interface ValidationData {
  message: string;
  severity: ValidationSeverity;
}

export const validateSlippage = (
  slippage: string,
  chainId: number,
  isNativeToken = false,
  provider?: SwitchProvider
): ValidationData | undefined => {
  try {
    const numberSlippage = Number(slippage);
    if (numberSlippage > 100) {
      return {
        message: 'Slippage must be lower than 100%',
        severity: ValidationSeverity.ERROR,
      };
    }

    if (provider === 'cowprotocol') {
      if (isNativeToken) {
        if (chainId === 1) {
          if (numberSlippage < 2) {
            return {
              message: 'Slippage lower than 2% may result in failed transactions',
              severity: ValidationSeverity.ERROR,
            };
          }
        } else {
          if (numberSlippage < 0.5) {
            return {
              message: 'Slippage lower than 0.5% may result in failed transactions',
              severity: ValidationSeverity.ERROR,
            };
          }
        }
      }
    } else {
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
    }
  } catch {
    return { message: 'Invalid slippage', severity: ValidationSeverity.ERROR };
  }
};
