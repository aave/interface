# Running with Quixote

This guide explains how to run the interface using [Quixote](https://quixote.bilinearlabs.io) for private reads.

## Prerequisites

- Docker (for the Postgres instance)
- `config_aave_governance.yaml` already present at the root of this repository
- `schema.graphql` already present at the root of this repository

## Steps

### 1. Install Quixote

```sh
curl -fsSL https://quixote.bilinearlabs.io/install | bash -s
```

### 2. Start Postgres

Replace `<user>` and `<password>` with your chosen credentials before running:

```sh
docker run -d \
  --name quixote-postgres \
  -e POSTGRES_USER=<user> \
  -e POSTGRES_PASSWORD=<password> \
  -e POSTGRES_DB=quixote \
  -p 5432:5432 \
  postgres:15
```

> **Important:** Update the `database_path` field in `config_aave_governance.yaml` with the same credentials:
> ```
> database_path: "postgres://<user>:<password>@localhost:5432/quixote"
> ```

### 3. Apply the database migration

Before starting Quixote, initialize the schema by running the [init migration](https://github.com/bilinearlabs/quixote/blob/main/migrations/20260116083154_init_db_schema.sql) from inside the Postgres container:

```sh
curl -fsSL https://raw.githubusercontent.com/bilinearlabs/quixote/main/migrations/20260116083154_init_db_schema.sql \
  | docker exec -i quixote-postgres psql -U <user> -d quixote
```

### 4. Start Quixote with Tor

Run Quixote from the repository root with the Tor flag:

```sh
quixote --tor --config config_aave_governance.yaml
```

After a few seconds, Quixote will log a line containing the `.onion` address for the local hidden service. You can also retrieve it at any time from:

```
http://localhost:9720/tor-info
```

### 5. Wait for indexing to complete

> **Caution:** `config_aave_governance.yaml` uses free public RPC endpoints (Tenderly, drpc, publicnode, etc.). Free RPCs have rate limits and may be unreliable under sustained load. For a faster and more stable setup, replace the `rpc_url` values with your own endpoints.

The config indexes governance and payload events across **21 chains**.

Initial sync takes some time — progress is printed continuously in the Quixote logs, and once each chain reaches the chain head a notification will appear in the logs. The interface will return data correctly once indexing has caught up.

### 6. Configure environment variables

In your `.env.local`, set the following before starting the interface:

```sh
NEXT_PUBLIC_USE_GOVERNANCE_CACHE=false
NEXT_PUBLIC_QUIXOTE_URL=<quixote-onion-address>        # .onion URL logged in step 4
NEXT_PUBLIC_QUIXOTE_CLEARNET_URL=http://localhost:9720  # default, change if needed
```

`NEXT_PUBLIC_USE_GOVERNANCE_CACHE` must be `false` so the interface queries Quixote directly instead of using cached governance data.

### 7. Start the interface

Once Quixote is running and the env vars are set:

```sh
yarn dev:tor
```

The interface will connect to Quixote's local GraphQL API and route requests through the Tor transport.

## Using the Tor/Clearnet toggle

The **Governance** page is where the transport toggle lives. Once the interface is running, open the Governance section and you will find a toggle that lets you switch between **Tor** and **Clearnet** mode at any time — no restart needed. Use this to compare privacy-preserving (Tor) and standard (clearnet) data fetching.
