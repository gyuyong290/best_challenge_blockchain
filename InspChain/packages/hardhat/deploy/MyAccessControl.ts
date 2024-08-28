import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployInspChain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Replace these values with actual addresses and a valid inspection type.
  const adminAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Replace with actual admin address
  const inspectorAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Replace with actual creator address
  const inspectTarget = "Machine A"; // Replace with actual inspection target

  // Deploy the InspChain contract
  await deploy("InspChainWithControl", {
    from: deployer,
    args: [adminAddress, inspectorAddress, inspectTarget], // Pass constructor arguments here
    log: true,
    autoMine: true, // Automatically mine the transaction on local networks
  });

  // Get the deployed contract to interact with it after deploying.
  const inspChain: Contract = await hre.ethers.getContract<Contract>("InspChainWithControl", deployer);
  console.log("✅ InspChain deployed at:", inspChain.address);
};

export default deployInspChain;

deployInspChain.tags = ["InspChainWithControl"];
