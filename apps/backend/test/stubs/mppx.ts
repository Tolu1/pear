// Jest can't load the ESM-only mppx, so the Jest configs map it to this stub.
export const Challenge = {
  fromResponse: (): never => {
    throw new Error('mppx is stubbed in tests');
  },
};

export const Mppx = {
  create: (): never => {
    throw new Error('mppx is stubbed in tests');
  },
};

export const evm = (): unknown[] => [];

export const assets = { base: { USDC: {} } };
