import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("EduVerify", function () {
    let eduVerify: any;
    let owner: any;
    let student: any;

    beforeEach(async function () {
        [owner, student] = await ethers.getSigners();
        const EduVerify = await ethers.getContractFactory("EduVerify");
        eduVerify = await EduVerify.deploy();
    });

    it("Should register a student", async function () {
        const did = "did:edu:123";
        const commitment = ethers.keccak256(ethers.toUtf8Bytes("secret"));

        await eduVerify.registerDID(student.address, did, commitment);

        const [retDid, retCommitment, retActive] = await eduVerify.getStudent(student.address);
        expect(retDid).to.equal(did);
        expect(retCommitment).to.equal(commitment);
        expect(retActive).to.be.true;
    });

    it("Should revoke a credential", async function () {
        await eduVerify.registerDID(student.address, "did:edu:123", ethers.ZeroHash);
        await eduVerify.revokeCredential(student.address);

        const [, , retActive] = await eduVerify.getStudent(student.address);
        expect(retActive).to.be.false;
    });

    it("Should verify a valid credential", async function () {
        await eduVerify.registerDID(student.address, "did:edu:123", ethers.ZeroHash);
        expect(await eduVerify.verifyCredential.staticCall(student.address)).to.be.true;
    });
});
