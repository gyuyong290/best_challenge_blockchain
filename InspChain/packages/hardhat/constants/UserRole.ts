export const User = {
  Manager: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  Manager1: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  Manager2: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  Inspector1: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  Inspector2: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
};

export const UserRole = {
  InspChain: {
    admin: User.Manager,
    inspector: User.Inspector1,
  },
  InspChainA1: {
    admin: User.Manager1,
    inspector: User.Inspector1,
  },
  InspChainA2: {
    admin: User.Manager2,
    inspector: User.Inspector1,
  },
  InspChainA3: {
    admin: User.Manager2,
    inspector: User.Inspector2,
  },
};
