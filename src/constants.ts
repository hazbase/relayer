/** ---------------------------------------------------------
 *  Network name → Forwarder address
 * -------------------------------------------------------- */
export const RELAYERS: Record<string, { forwarderAddress: string }> = {
  hazama: { forwarderAddress: '' },

  /* ---------- Mainnet ---------- */
  ethereum:        { forwarderAddress: '0xc82BbE41f2cF04e3a8efA18F7032BDD7f6d98a81' },
  polygon:         { forwarderAddress: '0xc82BbE41f2cF04e3a8efA18F7032BDD7f6d98a81' },
  astar:           { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  'astar-zkevm':   { forwarderAddress: '0x1576910A5Ba1781b1d88278DaC3729B11f415388' },
  celo:            { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  binance:         { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  avalanche:       { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  'polygon-zkevm': { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  worldchain:      { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  soneium:         { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },

  /* ---------- Testnet ---------- */
  mumbai:                 { forwarderAddress: '0xc82BbE41f2cF04e3a8efA18F7032BDD7f6d98a81' },
  goerli:                 { forwarderAddress: '0x5001A14CA6163143316a7C614e30e6041033Ac20' },
  sepolia:                { forwarderAddress: '0x5Eec1A55ADf49Ef53E7AeB6749655E91cE8b9660' },
  'celo-alfajores-testnet':   { forwarderAddress: '0x39B6A5eCa1737c71aF9f909F25475976851F26D6' },
  'binance-testnet':      { forwarderAddress: '0x39B6A5eCa1737c71aF9f909F25475976851F26D6' },
  'avalanche-fuji':       { forwarderAddress: '0x39B6A5eCa1737c71aF9f909F25475976851F26D6' },
  'polygon-zkevm-testnet':{ forwarderAddress: '0x39B6A5eCa1737c71aF9f909F25475976851F26D6' },
  zkatana:                { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  'polygon-amoy-testnet': { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  'polygon-zkevm-cardona-testnet': { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  zkyoto:                 { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  'soneium-minato':       { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },
  'worldchain-sepolia':   { forwarderAddress: '0x2fA9F95Fe9dD8469D6Da3B65Aa2bFdD96eAC86F0' },

  /* ---------- Not set ---------- */
  rinkeby: { forwarderAddress: '' },
  shiden:  { forwarderAddress: '' }
};

/** ---------------------------------------------------------
 *  ChainId → Network name
 * -------------------------------------------------------- */
export const CHAIN_ID_TO_NETWORK: Record<number, string> = {
  1: 'ethereum',
	4: 'rinkeby',
	5: 'goerli',
	137: 'polygon',
	592: 'astar',
	80001: 'mumbai',
	336: 'shiden',
	42220: 'celo',
	44787: 'celo-alfajores-testnet',
	56: 'binance',
	97: 'binance-testnet',
	43114: 'avalanche',
	43113: 'avalanche-fuji',
	1101: 'polygon-zkevm',
	1442: 'polygon-zkevm-testnet',
	1261120: 'zkatana',
	3776: 'astar-zkevm',
	11155111: 'sepolia',
	80002: 'polygon-amoy-testnet',
	2442: 'polygon-zkevm-cardona-testnet',
	6038361: 'zkyoto',
	1946: 'soneium-minato',
	1868: 'soneium',
	480: 'worldchain',
	4801: 'worldchain-sepolia'
};

/** ---------------------------------------------------------
 *  ERC‑20 minimal ABI (transfer, decimals, nonces)
 * -------------------------------------------------------- */
export const TOKEN_ABI = [
  'function decimals() view returns(uint8)',
  'function transfer(address,uint256) external returns(bool)',
  'function nonces(address) view returns(uint256)'
] as const;

/** ---------------------------------------------------------
 *  EIP‑712 Forwarder ABI (subset)
 * -------------------------------------------------------- */
export const FORWARDER_ABI = [
  'function getNonce(address) view returns (uint256)',
  'function execute((address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data),bytes) payable returns (bytes)'
] as const;
