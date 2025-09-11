import { getRelayerUrl, bigintReplacer } from './utils';
import type { ForwardRequest } from './types';
import { createRequestTransaction, ensureClientKeyActive } from '@hazbase/auth';

/**
 * Send a signed ForwardRequest to the HAZAMA BASE relayer.
 */
export async function sendRelayerTransaction(
  { chainId, code, request, signature }: {
    chainId: number;
    code: string;
    request: ForwardRequest;
    signature: string;
  }
): Promise<string> {
  await ensureClientKeyActive(73);

  const base = getRelayerUrl(chainId);
  const url  = `${base}&code=${code}&forSelf=false`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ request, signature, type: 'forward' }, bigintReplacer)
  });

  if (!res.ok) throw new Error('Relayer error');
  const { result } = await res.json();

  createRequestTransaction({
    functionId: 73,
    status: 'succeeded',
    isCount: true,
  });

  return JSON.parse(result);
}
