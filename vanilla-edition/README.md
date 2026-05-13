# Lumo Chat Export  |  Vanilla Edition 🛠️

> **Developer Tool for Deep Diagnostics & Real-Time Logging**

The **Vanilla Edition** is a lightweight, manual-injection tool designed specifically for developers and power users who need to inspect the internal API traffic of the Lumo interface. Unlike the standard extension, this version provides a **live, interactive console overlay** directly on the webpage.

## ⚠️ Important Note
This edition is **NOT** intended for submission to the Firefox Add-ons Store (AMO). It requires manual script injection via the browser console. It is designed for **local development, debugging, and educational purposes**.

##  What It Does

When activated, this tool injects a **floating, draggable, and 8-way resizable overlay box** onto the Lumo chat page. This box:

1.  **Intercepts Console Output:** Hooks into `console.log`, `info`, `warn`, and `error` in real-time.
2.  **Filters API Traffic:** Automatically captures and displays lines containing `[LOG]`, `Native`, `waitForMapping`, or `lumo api`.
3.  **Visualizes Data:** Shows raw JSON payloads, conversation IDs, encryption statuses, and token counts as they happen.
4.  **Persistent UI:** The box stays on screen while you interact with the chat, allowing you to correlate user actions with backend events.

## 🎯 Use Cases

- **Debugging Integration Issues:** See exactly what data is being sent/received when the chat behaves unexpectedly.
- **Reverse Engineering:** Inspect the structure of API payloads (e.g., `NativeComposerBridge` state updates).
- **Performance Analysis:** Monitor token counts and latency indicators in real-time.
- **Security Auditing:** Verify that sensitive data (encryption keys, user flags) is handled correctly in the logs.

## 📋 How to Use

1.  **Navigate** to your Lumo chat page (`https://lumo.proton.me/...`).
2.  **Open the Extension Popup** (or use the bookmarklet if you have the base extension installed).
3.  **Click "Logs"** and then **"Copy Script to Clipboard"**.
4.  **Open the Browser Console** (`F12` or `Ctrl+Shift+K`).
5.  **Paste** the script (`Ctrl+V`) and press **Enter**.
6.  **The Overlay Appears:** A dark-themed box with a green border will appear in the top-right corner.
7.  **Interact:**
    - **Drag** the header to move the box.
    - **Grab** the purple handles on any side/corner to resize it.
    - **Send a message** in Lumo and watch the logs stream in real-time.
8.  **Close:** Click the **✕** button on the box header to remove it.

## 🎨 Features

- **8-Way Resizing:** Resize from Top, Bottom, Left, Right, and all 4 Corners with intuitive physics.
- **Draggable Header:** Move the box anywhere on the screen without obstructing your view.
- **Auto-Scroll:** The log view automatically scrolls to the newest entry.
- **Syntax Highlighting:** Raw JSON is displayed in a monospace font for readability.
- **Zero Dependencies:** Pure vanilla JavaScript. No external libraries.

## 🛡️ Privacy & Security

- **Local Only:** All processing happens in your browser's memory. No data is sent to external servers.
- **Session Based:** The overlay disappears when you refresh the page or close the tab.
- **No Tracking:** This tool does not collect analytics or user data.

## 📄 License

MIT License. Free for personal and commercial use.

---

*Developed for the Lumo Community by @Carlostkf.*