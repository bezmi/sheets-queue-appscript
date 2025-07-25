#!/bin/bash

# A shell script to prepare HTML files for local testing or deployment.
# It replaces a placeholder URL with the actual Google Apps Script Web App URL
# and provides a clickable link to the local build for testing.

# --- CONFIGURATION ---
SOURCE_FILES=("index.html" "session.html" "join.html")
BUILD_DIR="build"
URL_PLACEHOLDER="__WEB_APP_URL_PLACEHOLDER__"
# -------------------

# Set script to exit immediately if any command fails
set -e

# 1. Get the Web App URL from the first command-line argument
WEB_APP_URL=$1

if [ -z "$WEB_APP_URL" ]; then
    echo -e "\n\033[0;31mError: Missing Web App URL.\033[0m"
    echo -e "Usage: ./build.sh <YOUR_WEB_APP_URL>\n"
    exit 1
fi

echo "Starting build process..."

# 2. Create the build directory, removing the old one if it exists
rm -rf "$BUILD_DIR"
mkdir "$BUILD_DIR"
echo "Created clean directory: ./${BUILD_DIR}"

# 3. Process each source file
for file in "${SOURCE_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Use sed to find and replace the placeholder.
        # Using '|' as a delimiter for sed is safer because URLs can contain '/'
        sed "s|$URL_PLACEHOLDER|$WEB_APP_URL|g" "$file" > "$BUILD_DIR/$file"
        echo "- Processed and copied: $file"
    else
        echo -e "\033[0;33m- Warning: Source file not found, skipping: $file\033[0m"
    fi
done

# 4. Get the absolute path to the build directory's index.html for the local file URL
# 'pwd' gets the current working directory.
BUILD_PATH="$(pwd)/$BUILD_DIR/index.html"

echo -e "\n\033[0;32m✅ Build complete!\033[0m"
echo "Your deployable files are in the ./${BUILD_DIR} directory."
echo -e "\nTo test locally, open this link in your browser:"
echo -e "\033[0;34mfile://${BUILD_PATH}\033[0m\n"
