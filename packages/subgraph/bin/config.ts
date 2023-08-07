export const config: Record<
  string,
  {
    orderFactory: {
      address: string;
      startBlock: number;
    };
  }
> = {
  xdai: {
    orderFactory: {
      address: "0x45B91Da2834010751b17F1eadE0a5a7B64233add",
      startBlock: 26488660,
    },
  },
  mainnet: {
    orderFactory: {
      address: "0x45B91Da2834010751b17F1eadE0a5a7B64233add", // TODO: update this
      startBlock: 16816896,
    },
  },
};
