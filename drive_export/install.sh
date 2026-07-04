#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST_NAME="proton_drive_bridge"
MANIFEST_SRC="$SCRIPT_DIR/drive_bridge.json"
PYTHON_SCRIPT="$SCRIPT_DIR/drive_bridge.py"
TARGET_DIR="${HOME}/.mozilla/native-messaging-hosts"

chmod +x "$PYTHON_SCRIPT"

# Write the actual absolute path into the manifest
python3 -c "
import json
with open('$MANIFEST_SRC') as f:
    data = json.load(f)
data['path'] = '$PYTHON_SCRIPT'
with open('$MANIFEST_SRC', 'w') as f:
    json.dump(data, f, indent=2)
"

mkdir -p "$TARGET_DIR"
cp "$MANIFEST_SRC" "$TARGET_DIR/${HOST_NAME}.json"

echo "✅ Installed native messaging host to $TARGET_DIR/${HOST_NAME}.json"
echo "   Make sure 'proton-drive' CLI is installed and in your PATH."
echo ""
echo "   Test with: proton-drive filesystem list /"
echo ""
echo "   Windows users: see install.ps1 (run as Admin to register in registry)"
