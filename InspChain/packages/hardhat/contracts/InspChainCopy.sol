// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";


contract InspChainCopy is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant INSPECTOR_ROLE = keccak256("INSPECTOR_ROLE");
    string public inspectTarget;

    enum JudgeState { Pending, Approved, Rejected }

    struct JudgeHistory {
        uint256 timestamp;
        string comment;
        JudgeState state;
    }

    struct InspectionHistory{
        address inspector;
        string inspectionType;
        string inspectionDetail;
        string inspectionStatusMessage;
        uint256 timestamp;
        JudgeHistory judgeHistory;
    }

    InspectionHistory[] public inspectionHistories;

    event InspectionSubmitted(
        address indexed submittedBy,
        string inspectionType,
        string inspectionDetail,
        string statusMessage,
        uint256 timestamp
    );

    event InspectionJudged(
        address indexed approvedBy,
        uint256 inspectionIndex,
        string comment,
        JudgeState state,
        uint256 timestamp
    );

    constructor(address _admin, address _inspector, string memory _inspectTarget) {
        require(_admin != address(0) && _inspector != address(0), "Invalid address");

        // Assign default admin role to the deployer
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);

        // Setup roles
        _setupRole(ADMIN_ROLE, _admin);
        _setupRole(INSPECTOR_ROLE, _inspector);

        // Set role admins
        _setRoleAdmin(INSPECTOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);

        inspectTarget = _inspectTarget;
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
        _;
    }

    modifier onlyInspector() {
        require(hasRole(INSPECTOR_ROLE, msg.sender), "Not inspector");
        _;
    }

    function submitInspection(
        string memory _inspectionType,
        string memory _detail,
        string memory _statusMessage
    ) external onlyInspector{
        InspectionHistory memory newInspectionHist;
        newInspectionHist.inspector = msg.sender;
        newInspectionHist.inspectionType = _inspectionType;
        newInspectionHist.inspectionDetail = _detail;
        newInspectionHist.inspectionStatusMessage = _statusMessage;
        newInspectionHist.timestamp = block.timestamp;  // Automatically set timestamp

        // Add the new inspection to the history
        inspectionHistories.push(newInspectionHist);

        emit InspectionSubmitted(
            msg.sender,
            _inspectionType,
            _detail,
            _statusMessage,
            block.timestamp
        );
    }

    function judgeInspection(
        uint256 _inspectionIndex,
        string memory _comment,
        JudgeState _state
    ) external onlyAdmin {
        require(_inspectionIndex < inspectionHistories.length, "Invalid inspection index");

        InspectionHistory storage inspection = inspectionHistories[_inspectionIndex];
        require(inspection.judgeHistory.state == JudgeState.Pending, "Inspection already approved");

        // Set the approval history
        inspection.judgeHistory.timestamp = block.timestamp;   // Automatically set timestamp
        inspection.judgeHistory.comment = _comment;
        inspection.judgeHistory.state = _state;

        emit InspectionJudged(
            msg.sender,
            _inspectionIndex,
            _comment,
            _state,
            block.timestamp
        );
    }

    // Function to get the number of inspections in the history
    function getInspectionCount() external view returns (uint256) {
        return inspectionHistories.length;
    }

    // Function to get details of a specific inspection by index
    function getInspection(uint256 _index) external view returns (
        address inspector,
        string memory inspectionType,
        string memory inspectionDetails,
        string memory inspectionStatusMessage,
        uint256 timestamp,
        uint256 judgeTimestamp,
        string memory judgeComment,
        JudgeState state
    ) {
        require(_index < inspectionHistories.length, "Invalid index");

        InspectionHistory memory inspection = inspectionHistories[_index];
        JudgeHistory memory approval = inspection.judgeHistory;

        return (
            inspection.inspector,
            inspection.inspectionType,
            inspection.inspectionDetail,
            inspection.inspectionStatusMessage,
            inspection.timestamp,
            approval.timestamp,
            approval.comment,
            approval.state
        );
    }

    // Functions to manage roles
    function addInspector(address account) external onlyAdmin {
        grantRole(INSPECTOR_ROLE, account);
    }

    function removeInspector(address account) external onlyAdmin {
        revokeRole(INSPECTOR_ROLE, account);
    }

    function addAdmin(address account) external onlyAdmin {
        grantRole(ADMIN_ROLE, account);
    }

    function removeAdmin(address account) external onlyAdmin {
        revokeRole(ADMIN_ROLE, account);
    }
}
