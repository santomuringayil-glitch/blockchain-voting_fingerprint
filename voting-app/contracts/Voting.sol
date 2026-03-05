// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    address public admin;
    bool public electionActive;

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public hasVoted;
    uint public candidateCount;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionIsActive() {
        require(electionActive, "Election is not active");
        _;
    }

    constructor() {
        admin = msg.sender;
        electionActive = false;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        require(!electionActive, "Cannot add candidates during active election");
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }

    function startElection() public onlyAdmin {
        require(candidateCount > 0, "Add candidates before starting");
        electionActive = true;
    }

    function vote(uint _candidateId) public electionIsActive {
        require(!hasVoted[msg.sender], "You have already voted");
        require(
            _candidateId > 0 && _candidateId <= candidateCount,
            "Invalid candidate"
        );

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
    }

    function endElection() public onlyAdmin {
        electionActive = false;
    }

    function getCandidate(
        uint _candidateId
    ) public view returns (uint, string memory, uint) {
        Candidate memory c = candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    function getCandidateCount() public view returns (uint) {
        return candidateCount;
    }

    function getElectionStatus() public view returns (bool) {
        return electionActive;
    }

    function checkHasVoted(address _voter) public view returns (bool) {
        return hasVoted[_voter];
    }
}
