# 🤝 FriendFix AI — Fix the Conversation • Keep the Friendship

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026_Weekend_Challenge-ff69b4.svg)](https://hacktoberfest.com/)
[![Challenge](https://img.shields.io/badge/Challenge-Build_for_a_Friend-8b5cf6.svg)](#)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25_Client--Side-4ade80.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **"Tone gets lost over text. Fix the conversation before you break the friendship."**  
> An open-source AI friendship assistant and conflict de-escalation companion designed to decode difficult messages, reveal unspoken emotional subtext, assess relationship temperature, and craft compassionate, low-ego responses.

---

## 🌟 Why FriendFix AI?

Modern friendships live on messaging apps like WhatsApp, Discord, iMessage, and Instagram. But texting lacks vocal tone, facial expressions, and body language:
* An accidental omission feels like deliberate exclusion.
* A message left on read for two days spirals into feeling unvalued.
* Quick, defensive replies turn minor miscommunications into friendship-ending arguments.

**FriendFix AI** acts as an objective, empathetic mediator in your pocket—helping you pause, understand what your friend is really trying to express, and craft a reply that brings you closer instead of driving you apart.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| 🧠 **Subtext & Unspoken Need Decoder** | Analyzes messages to identify hidden emotional drivers (e.g. fear of drifting, feeling excluded, financial awkwardness). |
| 🌡️ **Friendship Temperature Index** | Real-time gauge (0–100%) indicating how heated the situation is and whether urgent de-escalation is needed. |
| 🎭 **5 Conversational Personas** | Switch between **😊 Friendly & Warm**, **😂 Banter & Humor**, **🙏 Sincere Apology**, **🎯 Honest & Direct**, and **☕ Calm De-escalator**. |
| 📏 **Custom Response Lengths** | Choose between **⚡ Short Text** (1–2 punchy sentences), **💬 Balanced**, or **📜 Heart-to-Heart**. |
| 🍕 **Digital Friendship Truce Passes** | Generates redeemable vouchers (e.g., *1x Free Slice of Pizza & No-Drama Catchup*, *1x Zero-Phone Coffee Catchup*) copyable for Discord/WhatsApp. |
| 🚫 **"What to Avoid Saying" Warnings** | Real-time warnings against common conversational traps (defensiveness, gaslighting, dismissive excuses). |
| ⚡ **5 Instant Conflict Presets** | Preloaded realistic scenarios: *🍕 Uninvited to Hangout*, *👻 Left on Read*, *🚗 Flaked Plans*, *💸 Unpaid Bill*, *⚡ Passive-Aggressive Chat*. |
| 📜 **Local Conversation History** | Saves recent diagnoses privately in your browser's `localStorage` with zero remote tracking. |

---

## 🏗️ Architecture

```
friend-ai/
├── App.java          # Zero-dependency Java HTTP Server (com.sun.net.httpserver) + AI Proxy
├── index.html        # Semantic HTML5 layout, preset chips, glassmorphic UI
├── style.css         # Modern dark theme, ambient animated orbs, responsive grid
├── script.js         # Core sentiment heuristics, response synthesizer, Web Audio chimes
├── launch.bat        # 1-Click launcher for Windows
├── SUBMISSION.md     # Hacktoberfest 2026 Dev Challenge submission article
└── README.md         # Comprehensive project documentation
```

### 🤖 Open-Source AI Compatibility
FriendFix AI is built to prioritize open-source AI and user data privacy:
1. **Offline Heuristics Engine (Default):** Runs 100% locally in your browser with zero latency and zero data leakage.
2. **Ollama Local AI Node:** Compatible with `http://localhost:11434` for running local open-weights LLMs like **Llama 3.2**, **Qwen 2.5**, and **Mistral**.
3. **Java Server Backend (`App.java`):** Lightweight native Java microserver proxying AI requests and serving static assets with zero external dependencies.

---

## 🚀 Quick Start

### 1-Click Launch (Recommended)
Double-click [`launch.bat`](launch.bat) in this folder. It will instantly launch the app in your browser (or compile and start `App.java` if Java is installed).

---

## 🎯 Keyboard Shortcuts

* <kbd>Ctrl</kbd> + <kbd>Enter</kbd> inside the text input to instantly analyze conversation.
* Click **🔄 Rephrase** to cycle through alternative response wordings.
* Click **🎁 Copy Full Care Package** to copy the formatted response and peace voucher directly into your clipboard.

---

## 📄 License

Distributed under the MIT License. Built with ❤️ for **Hacktoberfest 2026: Build for a Friend**.
