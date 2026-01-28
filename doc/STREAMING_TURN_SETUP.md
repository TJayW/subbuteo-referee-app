# Guida completa: streaming WebRTC + TURN da zero

> Obiettivo: avere streaming P2P con fallback TURN su GitHub Pages, con configurazione sicura (serverless) oppure rapida (solo Pages).

## 0) Prerequisiti
- Repo già deployato su GitHub Pages.
- Workflows GitHub Actions attivi per build/deploy.
- Accesso al provider TURN scelto (consigliato: Cloudflare Calls TURN o Twilio).

---

## 1) Opzione A — setup rapido (solo Pages, meno sicuro)
> Usa variabili `VITE_` nel build. Queste finiscono nel bundle client.

### 1.1 Crea le variabili su GitHub
- Repo → Settings → Secrets and variables → Actions → Variables
- Aggiungi:
  - `VITE_TURN_URLS`
  - `VITE_TURN_USERNAME`
  - `VITE_TURN_CREDENTIAL`

### 1.2 Valori da inserire
- Inserisci i valori esatti forniti dal tuo provider TURN.
- Formato `VITE_TURN_URLS`:
  - JSON array **o** CSV:
    - `["turn:host:3478?transport=udp","turns:host:5349?transport=tcp"]`
    - `turn:host:3478?transport=udp,turns:host:5349?transport=tcp`

### 1.3 Deploy
- Push su `main` → GitHub Actions builda → Pages deploy.

---

## 2) Opzione B — setup sicuro (serverless + Pages)
> Le credenziali TURN vengono generate “a tempo” dal serverless (non visibili nel bundle).

### 2.1 Crea un endpoint serverless `/turn`
- Crea un Worker (Cloudflare Workers).
- Il Worker deve chiamare l'API di Cloudflare Calls TURN per generare credenziali temporanee (TTL) e ritornare `iceServers` al client. citeturn0search0
- L'endpoint e pubblico ma non espone il secret: il secret vive nei bindings del Worker. citeturn0search0

Esempio risposta JSON attesa dal client:
```json
{
  "iceServers": [
    {
      "urls": ["turn:host:3478?transport=udp", "turns:host:5349?transport=tcp"],
      "username": "<username-temporaneo>",
      "credential": "<credential-temporanea>"
    }
  ]
}
```

### 2.2 Configura il frontend
- Aggiungi una variabile:
  - `VITE_TURN_ENDPOINT=https://<tuo-endpoint>/turn`
- Il client effettua fetch e usa la risposta per `iceServers`.
- Mantieni STUN di default per P2P diretto.

### 2.3 Deploy
- Stessa pipeline GitHub Actions.

---

## 3) Checklist tecnica (client)
- STUN presente di default.
- TURN presente se:
  - Opzione A: variabili `VITE_TURN_*` valorizzate
  - Opzione B: `/turn` risponde e viene consumato
- Viewer usa call in “recv-only” (senza stream locale).
- Fallback su `peerConnection.ontrack` se `call.on('stream')` non arriva.
- Generazione link con `BASE_URL` per Pages.

---

## 4) Debug rapido
- Se il viewer riceve `Timeout! Stream non ricevuto in 15 secondi`:
  - Verifica che il broadcaster risponda con track live.
  - Verifica che il viewer riceva un `track` event.
  - Prova a forzare TURN (disattiva Wi-Fi per test NAT diversi).

---

## 5) Scelta consigliata
- Se vuoi partire subito: **Opzione A**.
- Se vuoi affidabilità + sicurezza: **Opzione B**.

---

## 6) Output atteso
- Link broadcast: `https://<user>.github.io/<repo>/#/watch/<streamKey>`
- Viewer riceve il video entro 5–10 secondi.

---

## Appendice A — Cloudflare TURN (passo-passo)
Questa sezione e specifica per Cloudflare Calls TURN.

### A1) Crea una TURN key su Cloudflare
1) Vai in Cloudflare Dashboard > Calls > TURN e crea una TURN key. citeturn0search0
2) La TURN key e un segreto di lungo periodo: non deve mai finire nel browser. citeturn0search0

### A2) Crea un API Token
1) Crea un token Cloudflare con permessi Calls (Read/Write). citeturn0search1turn0search4
2) Conserva il token solo lato serverless. citeturn0search0

### A3) Worker: variabili/secret da configurare
Configura questi bindings nel Worker (nomi consigliati):
- `CF_ACCOUNT_ID`
- `CF_TURN_KEY_ID`
- `CF_TURN_API_TOKEN`

### A4) Worker: chiamata API per generare `iceServers`
Il Worker deve chiamare l'endpoint Cloudflare per generare le credenziali TURN:
```
POST https://rtc.live.cloudflare.com/v1/turn/keys/<TURN_KEY_ID>/credentials/generate-ice-servers
Authorization: Bearer <TURN_KEY_API_TOKEN>
Content-Type: application/json
{"ttl": 86400}
```
La risposta contiene `iceServers` pronti per `RTCPeerConnection`. citeturn0search0

### A5) Nota importante su URL e porta 53
Cloudflare restituisce URL TURN anche con porta `53`. I browser possono bloccarla; con trickle ICE non e un problema, altrimenti puo causare timeout. citeturn0search0

### A6) Aggancia il Worker al frontend
- Imposta `VITE_TURN_ENDPOINT` con l'URL del Worker.
- Esegui deploy e verifica il fetch dal client.

### A7) Output atteso
- Il client riceve `iceServers` dal Worker.
- Le credenziali scadono secondo il TTL impostato. citeturn0search0
