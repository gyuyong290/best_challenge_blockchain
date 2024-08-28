// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InspChain {
    address public admin;
    address public inspector;
    string public inspectionType;
    string public inspectionDetails;
    uint256 public inspectionTimestamp; // New state variable for timestamp
    string public inspectionStatusMessage; // New state variable for status message
    bool public approved;

    event InspectionSubmitted(
        address indexed submittedBy,
        string statusMessage,
        string details
    );
    event InspectionApproved(address indexed approvedBy);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Not inspector");
        _;
    }

    constructor(address _admin, address _inspector, string memory _inspectionType) {
        require(_admin != address(0) && _inspector != address(0), "Invalid address");
        admin = _admin;
        inspector = _inspector;
        inspectionType = _inspectionType;
        approved = false;
    }

    function submitInspection(
        string memory statusMessage,
        string memory details
    ) external onlyInspector {
        inspectionStatusMessage = statusMessage;
        inspectionDetails = details;
        emit InspectionSubmitted(msg.sender, statusMessage, details);
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

    function getInspectionStatusMessage() external view returns (string memory) {
        return inspectionStatusMessage;
    }
}
