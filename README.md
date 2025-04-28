## How to use

Step 1: install the infinex SDK where `$PATH_TO_AAVE_FORK` is the location of this repo

```sh
cd PATH_TO_INFINEX_CONNECT_REPO
pnpm run pack-external-prod $PATH_TO_AAVE_FORK
```

Step 2: run the connect infra:

```sh
sudo caddy run
pnpm run dev:noapp
```

Step 3: copy the example env
```sh
cp .env.example .env.local
```

Step 4: add the quicknode RPC prefix and API key in the `.env.local`:

```sh
NEXT_PUBLIC_QUICKNODE_PREFIX=https://...
NEXT_PUBLIC_QUICKNODE_API_KEY=...
```

Step 5: run on port 3000
```sh
pnpm run dev
```
