# companion-module-muxshed

A [Bitfocus Companion](https://bitfocus.io/companion) module for controlling a
self-hosted [Muxshed](https://muxshed.com) live production studio from a Stream Deck
or any Companion surface.

## Setup

1. In the Muxshed studio, go to **Settings → API Keys** and create a key.
2. In Companion, add a connection of type **Muxshed** and enter:
   - **Host / IP** — your Muxshed instance (e.g. `127.0.0.1`)
   - **Port** — default `8080`
   - **API key** — the key from step 1

The module connects over the Muxshed WebSocket for live state and calls the REST API
for actions, so buttons reflect on-air / recording status in real time.

## Actions

- Go Live · End Stream
- Activate Scene · Cut to Source
- Start / Stop / Toggle Recording
- Show / Hide Overlay
- Refresh scenes / sources / overlays

## Feedbacks

- **On Air** — lights when the stream is live
- **Recording** — lights when recording
- **Pipeline is in state** — match any pipeline state

## Variables

`$(muxshed:pipeline_state)`, `$(muxshed:on_air)`, `$(muxshed:recording)`,
`$(muxshed:stream_uptime)`, `$(muxshed:active_scene)`

## Presets

Ready-made buttons for Go Live, End Stream, Record, and a live uptime display.

## License

MIT — see [LICENSE](LICENSE). Muxshed itself is AGPL-3.0; this module is an independent
API client and is intentionally permissively licensed.
