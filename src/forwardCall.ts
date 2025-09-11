import { ethers } from 'ethers';
import { createRequestTransaction, ensureClientKeyActive } from '@hazbase/auth';
import { buildForwardRequest, makeDomain,
         signForwardRequest } from './forward';
import { generateRelayerAuthCode } from './codeGen';
import { sendRelayerTransaction } from './relayer';

export interface ForwardCallParams {
  signer:  ethers.JsonRpcSigner;
  chainId: number;
  accessToken: string;
  contractAddress: string;
  abi: ethers.InterfaceAbi;
  method: string;
  args: unknown[];
}

/** Generic meta‑tx call via forwarder (GSNv2). */
export async function forwardCall(p: ForwardCallParams): Promise<string> {
  await ensureClientKeyActive(72);

  const contract = new ethers.Contract(p.contractAddress, p.abi, p.signer);
  const data = contract.interface.encodeFunctionData(p.method, p.args);

  /* Build ForwardRequest manually (value=0) */
  const request = await buildForwardRequest({
    signer: p.signer,
    tokenAddress: p.contractAddress,
    chainId: p.chainId,
  });
  // override data
  request.data = data;

  const domain    = makeDomain(p.chainId);
  const signature = await signForwardRequest({ signer: p.signer, domain, request });

  const code = await generateRelayerAuthCode({
    accessToken: p.accessToken,
    chainId:     p.chainId,
    contractAddress: p.contractAddress
  });

  createRequestTransaction({
    functionId: 72,
    status: 'succeeded',
    isCount: true,
  });

  return sendRelayerTransaction({
    chainId: p.chainId,
    code,
    request,
    signature
  });
}
