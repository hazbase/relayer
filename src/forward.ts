import { ethers, TypedDataField } from 'ethers';
import { FORWARDER_ABI } from './constants';
import { getForwarderAddress } from './utils';
import type { ForwardRequest, Domain } from './types';
import { createRequestTransaction, ensureClientKeyActive } from '@hazbase/auth';

/**
 * Build a ForwardRequest for ERC‑20 transfer.
 */
export async function buildForwardRequest(
  { signer, tokenAddress, chainId }: {
    signer: ethers.JsonRpcSigner;
    tokenAddress: string;
    chainId: number;
  }
): Promise<ForwardRequest> {
  await ensureClientKeyActive(71);

  const from      = await signer.getAddress();
  const forwarder = new ethers.Contract(getForwarderAddress(chainId), FORWARDER_ABI, signer);
  const nonce     = await forwarder.getNonce(from);
  
  createRequestTransaction({
    functionId: 71,
    status: 'succeeded',
    isCount: true,
  });

  return {
    from,
    to: tokenAddress,
    value: '0',
    gas: 500_000,
    nonce: Number(nonce),
    data: ''
  };
}

/**
 * Create EIP‑712 domain for the given chain.
 */
export function makeDomain(chainId: number): Domain {
  return {
    name: 'GSNv2 Forwarder',
    version: '0.0.1',
    chainId,
    verifyingContract: getForwarderAddress(chainId)
  };
}

/**
 * Sign EIP‑712 ForwardRequest.
 */
export async function signForwardRequest(
  { signer, domain, request }: {
    signer: ethers.JsonRpcSigner;
    domain: Domain;
    request: ForwardRequest;
  }
): Promise<string> {
    const types: Record<string, TypedDataField[]> = {
        ForwardRequest: [
            { name: 'from',  type: 'address' },
            { name: 'to',    type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'gas',   type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'data',  type: 'bytes'   }
        ]
    };

  return signer.signTypedData(domain, types, request);
}
