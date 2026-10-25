#!/usr/bin/env sh
set -eu
if [ -n "$(git status --porcelain)" ]; then
  echo 'Commit or stash changes before tagging a release.' >&2
  exit 1
fi
version=$(node -p "require('./package.json').version")
git tag -a "v$version" -m "Open Multiple URLs Tab $version"
echo "Created local tag v$version. Push it explicitly when ready."
