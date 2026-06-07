export const swcJestConfig = {
  jsc: {
    parser: { syntax: 'typescript' as const, decorators: true },
    transform: { legacyDecorator: true, decoratorMetadata: true },
    target: 'es2022' as const,
  },
};
