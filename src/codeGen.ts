import { ensureClientKeyActive, createRequestTransaction, getApiEndpoint } from '@hazbase/auth'
/**
 * Obtain a one‑time “code” from HAZAMA BASE for relayer auth.
 */
export async function generateRelayerAuthCode(
  { accessToken, chainId, contractAddress, type = 'relayer_auth' }: {
    accessToken: string;
    chainId: number;
    contractAddress: string;
    type?: string;
  }
): Promise<string> {
  const clientKey = await ensureClientKeyActive(70);
  const res = await fetch(`${getApiEndpoint()}/api/app/code/generate-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      type,
      chainId,
      contractAddress,
      forSelf: false,
      clientKey
    })
  });
  if (!res.ok) throw new Error('GenCode error');
  const { data } = await res.json();

  createRequestTransaction({
    functionId: 70,
    status: 'succeeded',
    isCount: true,
  });

  return data.code as string;
}
