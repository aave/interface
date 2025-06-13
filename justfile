# Dev Tasks
# `env` var can be used to override deployment environment. E.g.:
# just env=test secrets-pull

env := "dev"

# Show list of just commands
list:
    just --list

# Install dependencies
install:
    pnpm install

# ** Auth

# Refresh private npm registry credentials
[group('auth')]
auth-npm:
    pnpm run auth:npm

# Refresh Google auth credentials
[group('auth')]
auth-google:
    gcloud auth login --update-adc

[group('auth')]
secrets-pull filter="*":
    pnpm --parallel --filter {{ quote(filter) }} secrets:pull --env {{ quote(env) }}
