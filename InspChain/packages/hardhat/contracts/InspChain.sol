// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";


contract InspChain is AccessControl {
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

    // Mapping from inspection ID to array of revisions
    mapping(uint256 => InspectionHistory[]) public inspectionHistories;
    uint256 public inspectionCounter;

    event InspectionSubmitted(
        address indexed submittedBy,
        uint256 inspectionId,
        uint256 revisionNumber,
        string inspectionType,
        string inspectionDetail,
        string statusMessage,
        uint256 timestamp
    );

    event InspectionJudged(
        address indexed judgedBy,
        uint256 inspectionId,
        uint256 revisionNumber,
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
        inspectionCounter = 0; // Initialize the inspection counter
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
        uint256 _inspectionId, // Use 0to create a new inspection, or provide an existing ID for a revision
        string memory _inspectionType,
        string memory _detail,
        string memory _statusMessage
    ) external onlyInspector {
        InspectionHistory memory newInspectionHist;
        newInspectionHist.inspector = msg.sender;
        newInspectionHist.inspectionType = _inspectionType;
        newInspectionHist.inspectionDetail = _detail;
        newInspectionHist.inspectionStatusMessage = _statusMessage;
        newInspectionHist.timestamp = block.timestamp;
        newInspectionHist.judgeHistory.state = JudgeState.Pending;

        uint256 revisionNumber;

        if (_inspectionId == 0) {
            // Create a new inspection history
            inspectionCounter++;
            _inspectionId = inspectionCounter;
            revisionNumber = 0;
        } else {
            // Check if the specified inspection ID exists
            require(_inspectionId <= inspectionCounter, "Inspection ID does not exist");

            // Add a revision to the existing inspection
            revisionNumber = inspectionHistories[_inspectionId].length;
        }

        // Push the new inspection history (or revision) to the mapping
        inspectionHistories[_inspectionId].push(newInspectionHist);

        emit InspectionSubmitted(
            msg.sender,
            _inspectionId,
            revisionNumber,
            _inspectionType,
            _detail,
            _statusMessage,
            block.timestamp
        );
    }

    function judgeInspection(
        uint256 _inspectionId,
        uint256 _revisionNumber,
        string memory _comment,
        JudgeState _state
    ) external onlyAdmin {
        require(_inspectionId <= inspectionCounter, "Invalid inspection ID");
        require(_revisionNumber < inspectionHistories[_inspectionId].length, "Invalid revision number");

        InspectionHistory storage inspection = inspectionHistories[_inspectionId][_revisionNumber];
        require(inspection.judgeHistory.state == JudgeState.Pending, "Inspection already judged");

        inspection.judgeHistory.timestamp = block.timestamp;
        inspection.judgeHistory.comment = _comment;
        inspection.judgeHistory.state = _state;

        emit InspectionJudged(
            msg.sender,
            _inspectionId,
            _revisionNumber,
            _comment,
            _state,
            block.timestamp
        );
    }

    // Function to get the number of inspections
    function getInspectionCount() external view returns (uint256) {
        return inspectionCounter;
    }

    // Function to get the number of revisions for a specific inspection
    function getRevisionCount(uint256 _inspectionId) external view returns (uint256) {
        require(_inspectionId <= inspectionCounter, "Invalid inspection ID");
        return inspectionHistories[_inspectionId].length;
    }

    // Function to get details of a specific inspection revision
    function getInspection(uint256 _inspectionId, uint256 _revisionNumber) external view returns (
        address inspector,
        string memory inspectionType,
        string memory inspectionDetails,
        string memory inspectionStatusMessage,
        uint256 timestamp,
        uint256 judgeTimestamp,
        string memory judgeComment,
        JudgeState state
    ) {
        require(_inspectionId <= inspectionCounter, "Invalid inspection ID");
        require(_revisionNumber < inspectionHistories[_inspectionId].length, "Invalid revision number");

        InspectionHistory memory inspection = inspectionHistories[_inspectionId][_revisionNumber];
        JudgeHistory memory judgeHistory = inspection.judgeHistory;

        return (
            inspection.inspector,
            inspection.inspectionType,
            inspection.inspectionDetail,
            inspection.inspectionStatusMessage,
            inspection.timestamp,
            judgeHistory.timestamp,
            judgeHistory.comment,
            judgeHistory.state
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
