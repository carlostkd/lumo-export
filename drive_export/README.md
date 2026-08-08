HASH VERIFICATION V.7.6

New: Export memory

Hash: d85693a32a4952b70846418c29c7f3131bce773798db5cc07f75318284f3e538

Note: Hash verification is performed exclusively on the 
JavaScript file, as it represents the sole attack vector in this 
implementation.

```
sha256sum popup.js 
```



# Lumo Chat Export | Proton Drive Bridge

Exports your Lumo chat history and images directly to **Proton Drive** via the `proton-drive` CLI.

## Prerequisites

- **Python 3** – `python3 --version`
- **`proton-drive` CLI** – [Download Drive Cli](https://proton.me/drive/download), put it in your PATH
- **Firefox** with the **Lumo Chat Export** extension loaded via `about:debugging`

## Setup

### 1. Create the target folder on Proton Drive

```bash
proton-drive filesystem create-folder /my-files lumo-exports
```

Or create `lumo-exports` manually in the Proton Drive web app.

### 2. Register the bridge

```bash
cd drive_export
chmod +x install.sh
./install.sh
```

### 3. Reload the extension

In `about:debugging` → **This Firefox** → find Lumo Chat Export select any file and import.

## Usage

1. Open a chat at [chat.proton.me](https://chat.proton.me)
2. Select messages in the extension popup
3. Click **☁️ Export to Proton Drive**
4. Chat export and images appear under `/my-files/lumo-exports/`

Duplicate filenames get auto-renamed (e.g. `file (1).json`).

## Troubleshooting

| Issue | Fix |
|---|---|
| "Bridge not installed" | Re-run `./install.sh` and restart Firefox |
| Extension times out | Check `~/.lumo_drive_bridge.log` |
| `proton-drive` not found | Install the CLI, add to PATH, restart Firefox |
