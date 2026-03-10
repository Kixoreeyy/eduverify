export const EDU_VERIFY_ABI = [
    "function registerDID(address _student, string memory _did, bytes32 _commitment) external",
    "function revokeCredential(address _student) external",
    "function verifyCredential(address _student) external returns (bool)",
    "function getStudent(address _student) external view returns (string memory did, bytes32 commitment, bool isActive)",
    "event Registered(address indexed student, string did, bytes32 commitment, address issuer)",
    "event Revoked(address indexed student)",
    "event Verified(address indexed student, bool status)"
];

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111
