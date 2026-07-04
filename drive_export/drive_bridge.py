#!/usr/bin/env python3
import sys
import json
import struct
import tempfile
import os
import subprocess
import time
import base64
from pathlib import Path

LOG = os.path.expanduser("~/.lumo_drive_bridge.log")

def log(msg):
    with open(LOG, "a") as f:
        f.write(str(msg) + "\n")

log("=== BRIDGE STARTED ===")
log("CWD: " + os.getcwd())
log("PATH: " + os.environ.get("PATH", ""))

def find_cli():
    candidates = [
        "proton-drive",
        str(Path(__file__).parent / "proton-drive"),
        os.path.expanduser("~/proton-drive"),
    ]
    for c in candidates:
        if c == "proton-drive":
            import shutil
            if shutil.which(c):
                log("Found in PATH: " + c)
                return c
        elif os.path.isfile(c) and os.access(c, os.X_OK):
            log("Found at: " + c)
            return c
    log("proton-drive NOT FOUND in any location")
    return "proton-drive"

def read_message():
    raw = sys.stdin.buffer.read(4)
    if not raw or len(raw) < 4:
        return None
    length = struct.unpack('@I', raw)[0]
    data = sys.stdin.buffer.read(length).decode('utf-8')
    log("Received: " + data[:200])
    return json.loads(data)

def send_message(msg):
    data = json.dumps(msg).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('@I', len(data)))
    sys.stdout.buffer.write(data)
    sys.stdout.buffer.flush()
    log("Sent: " + json.dumps(msg)[:200])

def main():
    try:
        msg = read_message()
        if not msg:
            send_message({"success": False, "error": "Empty message"})
            return

        action = msg.get("action")
        if action == "upload":
            content = msg.get("content", "")
            filename = msg.get("filename", "export.txt")
            parent = msg.get("parentPath", "/lumo-exports")
            is_base64 = msg.get("isBase64", False)
            log("Upload target dir: " + parent + " is_base64=" + str(is_base64))

            tmp_dir = tempfile.mkdtemp(prefix="lumo_drive_")
            tmp_path = os.path.join(tmp_dir, filename)
            if is_base64:
                binary_data = base64.b64decode(content)
                with open(tmp_path, 'wb') as f:
                    f.write(binary_data)
            else:
                with open(tmp_path, 'w') as f:
                    f.write(content)
            log("Temp file: " + tmp_path + " (" + str(len(content)) + " chars)")

            cli = find_cli()

            if parent != "/my-files":
                parts = [p for p in parent.split("/") if p]
                for i in range(1, len(parts)):
                    sub_parent = "/" + "/".join(parts[:i])
                    sub_name = parts[i]
                    cmd_mkdir = [cli, "filesystem", "create-folder", sub_parent, sub_name]
                    log("Ensuring folder: " + " ".join(cmd_mkdir))
                    subprocess.run(cmd_mkdir, capture_output=True, text=True, timeout=30)

            cmd = [cli, "filesystem", "upload", "-f", "keep-both", tmp_path, parent]
            log("Running: " + " ".join(cmd))

            try:
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
                log("Return code: " + str(result.returncode))
                log("stdout: " + result.stdout[:500])
                log("stderr: " + result.stderr[:500])
                if result.returncode == 0:
                    send_message({"success": True, "path": parent + "/" + filename})
                else:
                    send_message({"success": False, "error": (result.stderr.strip() or result.stdout.strip())})
                time.sleep(0.5)
                sys.stdout.buffer.flush()
            except subprocess.TimeoutExpired:
                log("TIMEOUT after 120s")
                send_message({"success": False, "error": "Upload timed out after 120 seconds"})
            finally:
                try:
                    for f in os.listdir(tmp_dir):
                        os.unlink(os.path.join(tmp_dir, f))
                    os.rmdir(tmp_dir)
                except:
                    pass
        elif action == "ping":
            send_message({"success": True, "pong": True})
        else:
            send_message({"success": False, "error": "Unknown action: " + str(action)})
    except Exception as e:
        log("EXCEPTION: " + str(e))
        try:
            send_message({"success": False, "error": str(e)})
        except:
            log("Failed to send error response")

if __name__ == "__main__":
    main()
    log("=== BRIDGE EXITED ===")
