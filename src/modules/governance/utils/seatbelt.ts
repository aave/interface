import { ProposalPayload } from 'src/services/governance-cache-sdk';
import { getAddress } from 'viem';

const SEATBELT_REPORTS_BASE =
  'https://github.com/aave-dao/seatbelt-gov-v3/blob/main/reports/payloads';

/**
 * GitHub link to the Seatbelt simulation report for a payload.
 *
 * Path scheme: `reports/payloads/<chainId>/<checksummedController>/<payloadId>.md`.
 * The controller directory is EIP-55 checksummed and GitHub paths are
 * case-sensitive, so the cache's lowercase `payloadsController` must be
 * checksummed (via viem `getAddress`).
 *
 * Returns null if the controller isn't a valid address. Note: the report file
 * may not exist yet (e.g. very recent payloads), so the link can 404.
 */
export function getSeatbeltReportUrl(
  payload: Pick<ProposalPayload, 'chainId' | 'payloadsController' | 'payloadId'>
): string | null {
  try {
    const controller = getAddress(payload.payloadsController);
    return `${SEATBELT_REPORTS_BASE}/${payload.chainId}/${controller}/${payload.payloadId}.md`;
  } catch {
    return null;
  }
}
