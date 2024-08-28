//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

contract InspChain {
    struct InspectionContract {
        address user;
        string inspectionDetails;
        uint256 depositAmount;
        bool isApproved;
    }

    mapping(uint256 => InspectionContract) public contracts;
    uint256 public contractCount;
    address public owner;

    event ContractRequested(uint256 indexed contractId, address indexed user, string inspectionDetails);
    event ContractApproved(uint256 indexed contractId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function requestContract(string memory _inspectionDetails, uint256 _depositAmount) public {
        contractCount++;
        contracts[contractCount] = InspectionContract(msg.sender, _inspectionDetails, _depositAmount, false);
        emit ContractRequested(contractCount, msg.sender, _inspectionDetails);
    }

    function approveContract(uint256 _contractId) public onlyOwner {
        InspectionContract storage inspectionContract = contracts[_contractId];
        require(inspectionContract.user != address(0), "Contract does not exist");
        inspectionContract.isApproved = true;
        emit ContractApproved(_contractId);
    }
}