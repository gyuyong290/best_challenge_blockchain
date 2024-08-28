import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployInspChainAndCopy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Replace these values with actual addresses and a valid inspection type.
  const adminAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Replace with actual admin address
  const inspectorAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Replace with actual inspector address
  const inspectTarget = "Machine A"; // Replace with actual inspection target

  // Deploy the InspChain contract
  const inspChainDeployment = await deploy("InspChain", {
    from: deployer,
    args: [adminAddress, inspectorAddress, inspectTarget],
    log: true,
    autoMine: true, // Automatically mine the transaction on local networks
  });

  console.log("✅ InspChain deployed at:", inspChainDeployment.address);

  // Deploy the InspChainCopy contract
  const inspChainCopyDeployment = await deploy("InspChainCopy", {
    from: deployer,
    args: [adminAddress, inspectorAddress, inspectTarget],
    log: true,
    autoMine: true, // Automatically mine the transaction on local networks
  });

  console.log("✅ InspChainCopy deployed at:", inspChainCopyDeployment.address);
};

export default deployInspChainAndCopy;

deployInspChainAndCopy.tags = ["InspChain", "InspChainCopy"];
