import { parseAbi } from 'viem';

export const ARC_DOMAIN = 26;
export const BASE_DOMAIN = 6;

export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';

// CCTP V2 uses the same contract addresses on Arc and Base.
export const TOKEN_MESSENGER_ADDRESS =
  '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d';
export const MESSAGE_TRANSMITTER_ADDRESS =
  '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64';

export const IRIS_API_URL = 'https://iris-api.circle.com';

export const STANDARD_FINALITY_THRESHOLD = 2000;

export const tokenMessengerAbi = parseAbi([
  'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller, uint256 maxFee, uint32 minFinalityThreshold)',
]);

export const messageTransmitterAbi = parseAbi([
  'function receiveMessage(bytes message, bytes attestation) returns (bool)',
]);
