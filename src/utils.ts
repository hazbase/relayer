import { RELAYERS, CHAIN_ID_TO_NETWORK } from './constants';
import { getApiEndpoint } from '@hazbase/auth'

/* existing getForwarderAddress & bigintReplacer stay unchanged */

/** Resolve relayer endpoint for the given chain. */
export function getRelayerUrl(chainId: number): string {
  const net = CHAIN_ID_TO_NETWORK[chainId];
  if (!net) throw new Error(`Unsupported chainId: ${chainId}`);
  /*  relayer backend expects “network” query param equal to that name  */
  return `${getApiEndpoint()}/api/app/relayer/send-function?network=${net}`;
}

/**
 * Returns the forwarder address for a given chainId.
 * Throws if the chain is unsupported or not configured.
 */
export function getForwarderAddress(chainId: number): string {
  const net = CHAIN_ID_TO_NETWORK[chainId];
  if (!net) throw new Error(`Unsupported chainId: ${chainId}`);

  const entry = RELAYERS[net];
  if (!entry?.forwarderAddress)
    throw new Error(`No Forwarder configured for network: ${net}`);

  return entry.forwarderAddress;
}

/** Replace bigint with string when JSON‑serialising */
export function bigintReplacer(_k: string, v: any): any {
  return typeof v === 'bigint' ? v.toString() : v;
}
