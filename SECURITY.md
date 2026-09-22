# Zero-Trust Security Architecture for Leaderboard

## 1. Architecture Overview
- **Client**: Next.js App using Firebase Auth, Firestore, RTDB, and Storage.
- **Backend**: Next.js API Routes (Serverless) performing Zero-Trust verification.
- **Services**:
    - **Firebase Auth**: Identity & JWT management.
    - **Cloud SQL (PostgreSQL)**: Secure storage for PII (encrypted) and ACID transactions.
    - **Firestore**: User profiles and metadata.
    - **Realtime DB**: Presence and high-frequency state management.
    - **Cloud Storage**: Secure media storage.
- **Security Layers**: 
    - **App Check**: Prevents unauthorized API access.
    - **ALE (AES-256-GCM)**: Application-Level Encryption for all sensitive fields.
    - **IAM ADC**: Least Privilege service account access.

## 2. Hardened Security Rules
- **Firestore**: `allow read, write: if false;` default with specific owner-only gates.
- **RTDB**: UID-based path security with `.validate` type checks.
- **Storage**: Content-type and size validation with owner-only write access.

## 3. GitHub & Public Deployment Safety
- **.gitignore**: Strictly excludes all `.env` files.
- **Secret Manager**: Production secrets are injected via Google Secret Manager at runtime.
- **Environment Example**: `.env.example` contains only placeholders.
