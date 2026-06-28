# CLAUDE.md

## Rules

### No Secrets in Code

Never commit API keys, private keys, secrets, or credentials directly in source code. This includes:
- Alchemy, Infura, or any RPC provider API keys
- Wallet private keys or mnemonics
- Auth tokens or session secrets
- Any third-party service credentials

Use environment variables (e.g. `NEXT_PUBLIC_*` for client-side, server-only env vars for backend) instead. If you see a hardcoded secret in a diff, flag it immediately.
