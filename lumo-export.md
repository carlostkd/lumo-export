# 🚀 Lumo Chat Export

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Firefox](https://img.shields.io/badge/Firefox-140+-orange.svg)
![Status](https://img.shields.io/badge/status-submission_pending-yellow.svg)

**Export your Lumo chat history to JSON, TXT, or HTML with a single click.**

[📥 Download on AMO](https://addons.mozilla.org/en-US/firefox/addon/lumo-chat-export/) · [🌐 Landing Page](https://carlostkd.ch/lumo/export) · [🐛 Report Bug](https://github.com/carlostkd/lumo-export/issues)

</div>

---

## 🎯 About

**Lumo Chat Export** is a Firefox extension that fills a critical gap in Proton's Lumo interface  the ability to export conversation history. Since Proton doesn't offer a native export feature yet, this extension provides a secure, privacy-focused solution that lets you save your entire chat history in multiple formats.

Then you can Import the chats into Projects.

Or Download in html format for embeded into webpages.

All processing happens **locally in your browser**. Your data never leaves your device.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ One-Click Export | No complex setups. Click, choose format, download. |
| 🔒 100% Private | All processing happens locally. Zero data collection. |
| 📄 Multiple Formats | JSON, Plain Text, or HTML — pick what fits your needs. |
| 🧹 Clean Output | Automatically strips UI elements, thinking paths, and buttons. |
| 🎨 Modern Design | Sleek dark-mode interface matching the Proton ecosystem. |
| 🛠️ Developer Friendly | Structured JSON ready for imports, databases, or analysis. |

---

## 📥 Installation

### Option 1 — From AMO (Recommended)

1. Open Firefox 140 or later
2. Visit the [AMO Store Page](https://addons.mozilla.org/en-US/firefox/addon/lumo-chat-export//)
3. Click **Add to Firefox**
4. Confirm the installation

### Option 2 — Manual (Development)

1. Clone this repository:

        git clone https://github.com/carlostkd/lumo-export.git
        cd lumo-export
				
2. Open Firefox and navigate to `about:debugging`
3. Click **This Firefox** → **Load Temporary Add-on**
4. Select `manifest.json` from the extension folder
5. The extension icon will appear in your toolbar

> **Note:** For permanent local installation, set `xpinstall.signatures.required` to `false` in `about:config`. See the [Privacy FAQ](#-privacy-faq) below.

---

## 📖 Usage

1. **Open** any Lumo chat page in Firefox
2. **Click** the Lumo Export icon in your toolbar
3. **Select** your preferred format
4. **Click** Export Chat
5. **Done**  your file downloads automatically
6. **Import** Now you can import your chats into Projects 

---

## 📁 Export Formats

### JSON — Structured Data

Best for developers, automation, database imports, and API integrations.

Output structure:

    {
      "exportedAt": "2026-05-10T14:31:01.634Z",
      "totalMessages": 104,
      "messages": [
        {
          "role": "user",
          "content": "Hello Lumo!"
        },
        {
          "role": "assistant",
          "content": "How can I help you today?"
        }
      ]
    }

### Plain Text — Readable Logs

Best for reading, printing, archiving, and quick reference.

Output structure:

    [USER]:
    Hello Lumo!

    ---

    [ASSISTANT]:
    How can I help you today?

    ---

### HTML — Visual Archive

Best for visual archives, sharing with non-technical users, and long-term storage. Opens in any browser with styled conversation bubbles and clean formatting.

---

## 🔒 Privacy

**We take privacy seriously.** This extension:

- ✅ Does **NOT** collect any user data
- ✅ Does **NOT** transmit data to any external server
- ✅ Does **NOT** use analytics or tracking
- ✅ Does **NOT** store data remotely
- ✅ Processes everything **locally in your browser**

The only permissions required:

| Permission | Purpose |
|------------|---------|
| `activeTab` | Read the current Lumo chat page to extract message text |
| `downloads` | Trigger the browser's native file download dialog |

No background scripts. No data collection. No third-party APIs.

---

## ❓ Privacy FAQ

**Is it safe to set `xpinstall.signatures.required` to `false`?**

For personal development use, yes  as long as you only install extensions you trust. This setting bypasses Mozilla's signature verification, so avoid installing random `.xpi` files from untrusted sources. For maximum safety, use a separate Firefox profile for development.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. 



---

## 📢 Disclaimer

**Lumo Chat Export is not affiliated with Proton AG.** This is a community-built tool created to enhance the user experience. All trademarks belong to their respective owners.

---

<div align="center">

**Made with ❤️ by Carlostkd**

[⭐ Star this repo](https://github.com/carlostkd/lumo-export)

</div>