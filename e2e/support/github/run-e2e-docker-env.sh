#!/usr/bin/env bash -eu

# get the dir containing the script
script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo "Starting KenyaEMR stack with prebuilt images..."
(
  cd "$script_dir"
  docker compose pull
  docker compose up -d
)

echo "KenyaEMR stack is starting in the background."
