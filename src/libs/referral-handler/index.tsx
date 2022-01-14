import React, { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/router'

export function storeReferralCode(referralCode: number, fromUrl: boolean = true): void {
  localStorage.setItem('referralCode', referralCode.toString());
  if (fromUrl) {
    localStorage.setItem('referralCodeFromUrl', referralCode.toString());
  }
}

export function getReferralCode(): string | undefined {
  return localStorage.getItem('referralCode') || undefined;
}

// referral code from Url has higher priority then code from wallet itseft, and to solve the mess with imToken we store it separately
// to know was imToken referral id from wallet itself or from url
export function getReferralCodeFromUrl(): string | null {
  return localStorage.getItem('referralCodeFromUrl');
}

export function removeReferralCode(): void {
  return localStorage.removeItem('referralCode');
}

export function ReferralHandler({ children }: PropsWithChildren<{}>) {
  const router = useRouter();
  useEffect(() => {
    const referralCode = Number(router.query.referral);
    const { mockWalletAddress } = router.query;
    if (mockWalletAddress) {
      localStorage.setItem('mockWalletAddress', mockWalletAddress.toString());
    }
    if (Number.isInteger(referralCode) && referralCode >= -1 && referralCode <= 65535) {
      storeReferralCode(referralCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}
