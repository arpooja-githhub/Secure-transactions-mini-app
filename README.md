# Secure Transaction App (Technical Challenge)

A production-ready implementation of **Envelope Encryption** built with a Turborepo monorepo structure. This project demonstrates secure data handling, cryptographic integrity, and a decoupled full-stack architecture.

## 🚀 Quick Links
- **Live Demo:** [Insert your Vercel URL here]
- **API Documentation:** [Insert your Vercel API URL here]/tx/demo
- **Video Walkthrough:** [Insert your Loom Link here]

## 🛠 Tech Stack
- **Monorepo Management:** Turborepo / pnpm
- **Frontend:** Next.js 14 (App Router), Tailwind CSS
- **Backend:** Fastify (TypeScript)
- **Cryptography:** Node.js `crypto` module (AES-256-GCM)

## 🔐 Security Features: Envelope Encryption
This project implements **Envelope Encryption** to ensure maximum data security:
1. **DEK Generation:** For every transaction, a unique **Data Encryption Key (DEK)** is generated.
2. **Payload Encryption:** The payload is encrypted with the DEK using **AES-256-GCM**, providing both confidentiality and authenticity.
3. **Key Wrapping:** The DEK is then "wrapped" (encrypted) using a **Master Key** stored securely in environment variables.
4. **Integrity Checks:** All decryption processes verify the GCM Authentication Tag. If a single bit of the ciphertext is tampered with, the system will reject the request.

## 🏗 Project Structure
```text
.
├── apps
│   ├── api          # Fastify server with cryptographic routes
│   └── web          # Next.js frontend UI
├── packages
│   └── crypto       # Shared library for encryption/decryption logic
└── package.json