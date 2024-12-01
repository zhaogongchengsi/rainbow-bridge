# Rainbow Client

WebRTC-based file synchronizer and chat room

## Features

- [ ] Sync files across devices
- [X] Text private chat
- [ ] text group chat

### Install

```bash
pnpm install
```

### Setting environment variables

.env file

```env
RENDERER_VITE_PEER_PORT=6789
RENDERER_VITE_PEER_PATH=/bridge
RENDERER_VITE_PEER_KEY=BnfPKyiLx3
RENDERER_VITE_PEER_URL=http://xxxx.com/bridge
RENDERER_VITE_SALT=rainbow
VITE_KEY_PROTOCOL_NAME=rainbow
VITE_KEY_HOST=app
```

### Development

```bash
pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
