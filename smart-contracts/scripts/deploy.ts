import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const EduVerify = await ethers.getContractFactory("EduVerify");
    console.log("Deploying EduVerify...");
    const eduVerify = await EduVerify.deploy();

    await eduVerify.waitForDeployment();

    console.log("EduVerify deployed to:", await eduVerify.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
