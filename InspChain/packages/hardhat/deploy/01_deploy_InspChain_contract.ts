import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployInspChain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Replace these values with actual addresses and a valid inspection type.
  const adminAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with actual admin address
  const inspectorAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Replace with actual creator address
  const inspectionType = "Type A"; // Replace with actual inspection type

  // Deploy the InspChain contract
  await deploy("InspChain", {
    from: deployer,
    args: [adminAddress, inspectorAddress, inspectionType], // Pass constructor arguments here
    log: true,
    autoMine: true, // Automatically mine the transaction on local networks
  });

  // Get the deployed contract to interact with it after deploying.
  const inspChain: Contract = await hre.ethers.getContract<Contract>("InspChain", deployer);
  console.log("✅ InspChain deployed at:", inspChain.address);
};

export default deployInspChain;

deployInspChain.tags = ["InspChain"];
