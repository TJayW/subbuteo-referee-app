# Contesto streaming + TURN (salvato)

## Stato attuale (repo)
- Repo: `/Users/tjw/Desktop/subbuteo-referee-app`.
- Il sistema streaming e P2P WebRTC con PeerJS; viewer e broadcaster si connettono con una `streamKey`.
- GitHub Pages e usata per il deploy (GitHub Actions).

## Fix e modifiche implementate
### 1) ICE servers (STUN + TURN opzionale)
File: `src/adapters/media/webrtc-adapter.ts`
- Introdotte funzioni:
  - `buildIceServers()`
  - `parseTurnUrls()`
- Supporto STUN di default + TURN opzionale da variabili d'ambiente.
- Variabili supportate:
  - `VITE_TURN_URLS`
  - `VITE_TURN_USERNAME`
  - `VITE_TURN_CREDENTIAL`

Formato di `VITE_TURN_URLS`:
- JSON array: `["turn:host:3478?transport=udp","turns:host:5349?transport=tcp"]`
- Oppure CSV: `turn:host:3478?transport=udp,turns:host:5349?transport=tcp`

### 2) Viewer: fallback ricezione stream
File: `src/adapters/media/webrtc-adapter.ts`
- La call del viewer usa una `MediaStream` vuota per ricevere solo:
  - `this.peer.call(streamKey, undefined as unknown as MediaStream)`
- Aggiunto fallback per `peerConnection.ontrack`:
  - Se l'evento `stream` non arriva, si costruisce un `MediaStream` dai track.

### 3) Base URL per link streaming
File: `src/adapters/media/webrtc-adapter.ts`
- `generateStreamURL()` usa `import.meta.env.BASE_URL` per costruire correttamente URL su GitHub Pages.

### 4) .env.example aggiornato
File: `.env.example`
- Aggiunte le variabili TURN (vedi sopra).

## Perche serve TURN
- P2P funziona solo se i peer riescono a fare NAT traversal.
- Se non ci riescono, serve un relay (TURN) per garantire il flusso.
- TURN e “relay” (il traffico passa dal server). Con STUN si tenta P2P diretto.

## Note importanti
- `VITE_` rende le variabili visibili nel bundle client. Non sono segreti veri.
- Se si vuole sicurezza reale per TURN, serve un endpoint serverless per generare credenziali temporanee (time-limited) e passarle al client.

## Configurazione TURN (due opzioni)
### Opzione A — semplice (solo Pages)
- Mettere `VITE_TURN_URLS`, `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL` come Repository Variables (non Secrets) su GitHub.
- Rischio: le credenziali restano visibili nel bundle.

### Opzione B — best practice (serverless)
- Usare un Worker (es. Cloudflare) per generare credenziali temporanee.
- Il frontend chiama l’endpoint `/turn` e riceve `iceServers`.
- I “secrets” restano solo nel serverless.

## Commit principale
- Ultimo commit relativo al TURN: `5a5c5cc` (messaggio: `commit`).

## Cosa manca / prossimi passi
1) Scegliere provider TURN (Twilio, Cloudflare, OpenRelay, ecc.).
2) Decidere se usare:
   - Opzione A (rapida) oppure
   - Opzione B (sicura)
3) Se Opzione B: implementare endpoint `/turn` e modificare il client per consumarlo.

