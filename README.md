# EduVerify: Decentralized Digital ID Verification

A production-ready Web3 application for College ID verification using **SSI** (Self-Sovereign Identity), **DID** (Decentralized Identifiers), and **ZKP** (Zero-Knowledge Proofs).

## Features
- **SSI**: Users own their identity. The college only issues a commitment on-chain.
- **DID**: Mapping of student wallets to decentralized IDs.
- **ZKP**: Students generate a proof of membership locally without revealing their secret.
- **Smart Contracts**: Full lifecycle management (Issue, Verify, Revoke) on Sepolia.

---

## Getting Started

### 1. Smart Contracts Setup
1. `cd smart-contracts`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in:
   - `SEPOLIA_RPC_URL`: Your RPC endpoint (Alchemy, Infura, etc.)
   - `PRIVATE_KEY`: Your wallet private key (Sepolia ETH required)
4. Deploy: `npx hardhat run scripts/deploy.ts --network sepolia`
5. Note the **Contract Address**.

### 2. Frontend Setup
1. `cd client`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in:
   - `VITE_CONTRACT_ADDRESS`: The address from step 1.
   - `VITE_RPC_URL`: Same as `SEPOLIA_RPC_URL`.
4. Run locally: `npm run dev`

---

## Tech Stack
- **Frontend**: Vite + React + TypeScript + Tailwind
- **Blockchain**: Solidity, Hardhat, Ethers.js (v6)
- **Network**: Sepolia Testnet
- **Styling**: Premium Glassmorphism & Framer Motion

---

## Demo Workflow
1. **Issuer (Admin)**: Connect your wallet. Enter student wallet address, a unique DID (e.g., `EDU2024001`), and a secret. Click **Issue**.
2. **Holder (Student)**: The student receives their DID and secret. On the **Holder Page**, they enter these and click **Generate ZK Proof**.
3. **Verifier (Public)**: Anyone can enter the student's wallet address on the **Verifier Page** to check if they have a valid, active credential on-chain.

---

## Deployment
### Frontend (Netlify/Vercel)
1. Push code to GitHub.
2. Link repository to Netlify/Vercel.
3. Add Environment Variables in the provider dashboard.
4. Deploy!

### Contract Verification
`npx hardhat verify --network sepolia <CONTRACT_ADDRESS>`

---

## Security & Privacy
- **Zero Privacy Leak**: No personal data (Name, DOB, etc.) is stored on-chain.
- **ZKP Model**: User proves knowledge of a secret corresponding to an on-chain commitment.
- **Immutable Audit**: All issuance and revocations are transparent on the ledger.
