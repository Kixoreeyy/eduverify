import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const CONTRACT_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    const EDU_VERIFY_ABI = [
        "function owner() view returns (address)",
        "function getStudent(address) view returns (string, bytes32, bool)"
    ];

    try {
        const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/3Q8bTYBJpPSnb7wWVP7pa");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, EDU_VERIFY_ABI, provider);

        console.log("Checking contract:", CONTRACT_ADDRESS);
        const owner = await contract.owner();
        console.log("Contract Owner:", owner);

        const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
        try {
            const student = await contract.getStudent(testAddress);
            console.log("Student exists for", testAddress);
        } catch (e) {
            console.log("Student DOES NOT exist for", testAddress);
        }
    } catch (err: any) {
        console.error("Error connecting to contract:", err.message);
    }
}

main();
