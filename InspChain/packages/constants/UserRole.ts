export const User = {
  JiSun: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  HyunJi: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  GyuYong: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  DaYoung: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  Jay: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
  
};

export const UserRole = {
  InspChain: {
    admin: User.JiSun,
    inspector: User.DaYoung,
  },
  InspChainA1: {
    admin: User.HyunJi,
    inspector: User.DaYoung,
  },
  InspChainA2: {
    admin: User.GyuYong,
    inspector: User.DaYoung,
  },
  InspChainA3: {
    admin: User.GyuYong,
    inspector: User.Jay,
  },
};