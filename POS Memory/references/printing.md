# Printing and Hardware Context

## Read

- Printing sections in [[Architecture]], [[Rules]], and [[HandOff]]
- `../../frontend/electron/ipc/printing.ts` and its preload/channel callers
- Receipt preview and historical Order detail source

## Stable invariants

- Electron Main owns printer access through narrow preload IPC; the renderer does not access printer hardware directly.
- EPSON LX-310 is the current physical test device, not a required printer model.
- Physical output currently uses an approximately 32-column narrow profile and historical completed Order snapshots.
- Phase 10.21 tax receipt fields use persisted Order tax snapshots, including the discounted-order pending-rule fallback.
- PDFx is removed. Raw ESC/P, silent printing, saved printer choice, and further hardware-specific control remain deferred unless physical validation requires a new phase.
- Receipt preview and physical output lead with the sale O.R Number (`OR#YYYYMMDD######`) and retain the dash-free internal Order Number as secondary metadata.
