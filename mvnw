#!/bin/sh

set -euf

BASE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WRAPPER_PROPS="$BASE_DIR/.mvn/wrapper/maven-wrapper.properties"

if [ ! -f "$WRAPPER_PROPS" ]; then
  echo "Missing $WRAPPER_PROPS" >&2
  exit 1
fi

distributionUrl=$(grep '^distributionUrl=' "$WRAPPER_PROPS" | cut -d'=' -f2-)

if [ -z "${distributionUrl:-}" ]; then
  echo "distributionUrl is not configured" >&2
  exit 1
fi

MAVEN_USER_HOME="${MAVEN_USER_HOME:-$HOME/.m2}"
WRAPPER_DIR="$MAVEN_USER_HOME/wrapper/dists"
ARCHIVE_NAME=$(basename "$distributionUrl")
DIST_NAME=$(printf '%s' "$ARCHIVE_NAME" | sed 's/-bin\.zip$//')
INSTALL_DIR="$WRAPPER_DIR/$DIST_NAME"
ARCHIVE_PATH="$WRAPPER_DIR/$ARCHIVE_NAME"

mkdir -p "$WRAPPER_DIR"

download() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$distributionUrl" -o "$ARCHIVE_PATH"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$distributionUrl" -O "$ARCHIVE_PATH"
  else
    echo "curl or wget is required to download Maven" >&2
    exit 1
  fi
}

if [ ! -d "$INSTALL_DIR" ]; then
  if [ ! -f "$ARCHIVE_PATH" ]; then
    echo "Downloading Maven from $distributionUrl"
    download
  fi

  rm -rf "$INSTALL_DIR.tmp"
  mkdir -p "$INSTALL_DIR.tmp"

  if command -v unzip >/dev/null 2>&1; then
    unzip -q "$ARCHIVE_PATH" -d "$INSTALL_DIR.tmp"
  else
    echo "unzip is required to extract Maven" >&2
    exit 1
  fi

  EXTRACTED_DIR=$(find "$INSTALL_DIR.tmp" -mindepth 1 -maxdepth 1 -type d | head -n 1)
  if [ -z "${EXTRACTED_DIR:-}" ]; then
    echo "Failed to extract Maven archive" >&2
    exit 1
  fi

  mv "$EXTRACTED_DIR" "$INSTALL_DIR"
  rm -rf "$INSTALL_DIR.tmp"
fi

exec "$INSTALL_DIR/bin/mvn" "$@"
