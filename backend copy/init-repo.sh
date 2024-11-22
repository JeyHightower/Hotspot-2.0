#!/bin/bash
set -euo pipefail

set -x

npm i
dotenv prisma generate
tsc
dotenv prisma db push --accept-data-loss
