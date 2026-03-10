// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EduVerify is Ownable {
    struct Student {
        string did;
        bytes32 commitment;
        address issuer;
        bool isActive;
        bool exists;
    }

    mapping(address => Student) public students;

    event Registered(address indexed student, string did, bytes32 commitment, address issuer);
    event Revoked(address indexed student);
    event Verified(address indexed student, bool status);

    constructor() Ownable(msg.sender) {}

    function registerDID(address _student, string memory _did, bytes32 _commitment) external onlyOwner {
        require(!students[_student].exists, "Wallet address is already registered");
        students[_student] = Student({
            did: _did,
            commitment: _commitment,
            issuer: msg.sender,
            isActive: true,
            exists: true
        });
        emit Registered(_student, _did, _commitment, msg.sender);
    }

    function revokeCredential(address _student) external onlyOwner {
        require(students[_student].exists, "Student does not exist");
        students[_student].isActive = false;
        emit Revoked(_student);
    }

    function verifyCredential(address _student) external returns (bool) {
        bool status = students[_student].exists && students[_student].isActive;
        emit Verified(_student, status);
        return status;
    }

    function getStudent(address _student) external view returns (string memory did, bytes32 commitment, bool isActive) {
        require(students[_student].exists, "Student does not exist");
        Student memory s = students[_student];
        return (s.did, s.commitment, s.isActive);
    }
}
