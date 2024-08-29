import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { UserRole } from "../constants/UserRole";

const contract = "InspChainA2";

const deployInspChain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Replace these values with actual addresses and a valid inspection type.
  const adminAddress = UserRole[contract].admin; // Replace with actual admin address
  const inspectorAddress = UserRole[contract].inspector; // Replace with actual creator address
  const inspectTarget = "Machine A"; // Replace with actual inspection target

  // Deploy the InspChain contract
  await deploy(contract, {
    from: deployer,
    args: [adminAddress, inspectorAddress, inspectTarget], // Pass constructor arguments here
    log: true,
    autoMine: true, // Automatically mine the transaction on local networks
  });

  // Get the deployed contract to interact with it after deploying.
  const inspChain: Contract = await hre.ethers.getContract<Contract>(contract, deployer);
  console.log("✅ InspChain deployed at:", inspChain.address);
};

export default deployInspChain;

deployInspChain.tags = [contract];
