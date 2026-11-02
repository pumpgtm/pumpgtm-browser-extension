# PumpGTM: Add to sequence

A small browser extension for [PumpGTM](https://pumpgtm.com). Open a LinkedIn profile (linkedin.com/in/...), click the PumpGTM icon, pick one of your sequences and add that person as a lead.

## Setup

1. In PumpGTM, copy your workspace key (it starts with `eve_mcp_`).
2. Click the extension icon and paste the key once.

## How it works

The popup reads the URL and title of the tab you are on, lists your sequences with `GET /api/v1/sequences` and adds the person with `POST /api/v1/sequences/{id}/leads` on the [PumpGTM REST API](https://pumpgtm.com/docs/api). Nothing is sent to the person by this call; PumpGTM queues them and contacts them later under your sequence's pacing.

Manifest V3, permissions `activeTab` and `storage`, host access only to `app.pumpgtm.com`. No content scripts, no remote code, no build step.

## Install from source

Open `edge://extensions` or `chrome://extensions`, turn on Developer mode, click "Load unpacked" and pick this folder.

## Privacy

See [PRIVACY.md](PRIVACY.md) and https://pumpgtm.com/privacy-policy.

## License

MIT
