// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract InspChainCopy {
    address public admin;
    address public inspector;
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


    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Not inspector");
        _;
    }

    constructor(address _admin, address _inspector, string memory _inspectTarget) {
        require(_admin != address(0) && _inspector != address(0), "Invalid address");
        admin = _admin;
        inspector = _inspector;
        inspectTarget = _inspectTarget; // Store the inspection target
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
}
