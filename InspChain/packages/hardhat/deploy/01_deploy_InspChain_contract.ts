import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the "InspChain" contract using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployInspChain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy the InspChain contract
  await deploy("InspChain", {
    from: deployer,
    // No constructor arguments for InspChain contract
    args: [],
    log: true,
    autoMine: true, // Automatically mine the transaction on local networks
  });

  // Get the deployed contract to interact with it after deploying.
  const inspChain: Contract = await hre.ethers.getContract<Contract>("InspChain", deployer);
  console.log("✅ InspChain deployed at:", inspChain.address);
};

export default deployInspChain;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags InspChain
deployInspChain.tags = ["InspChain"];
