// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InspChain {
    address public admin;
    address public creator;
    string public inspectionType;
    string public inspectionDetails;
    bool public approved;

    event InspectionSubmitted(address indexed submittedBy, string details);
    event InspectionApproved(address indexed approvedBy);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == creator, "Not inspector");
        _;
    }

    constructor(address _admin, address _creator, string memory _inspectionType) {
        require(_admin != address(0) && _creator != address(0), "Invalid address");
        admin = _admin;
        creator = _creator;
        inspectionType = _inspectionType;
        approved = false;
    }

    function submitInspection(string memory details) external onlyInspector {
        inspectionDetails = details;
        emit InspectionSubmitted(msg.sender, details);
    }

    function approveInspection() external onlyAdmin {
        require(!approved, "Inspection already approved");
        approved = true;
        emit InspectionApproved(msg.sender);
    }

    function getInspectionStatus() external view returns (bool) {
        return approved;
    }

    function getInspectionDetails() external view returns (string memory) {
        return inspectionDetails;
    }

    function getInspectionType() external view returns (string memory) {
        return inspectionType;
    }
}
