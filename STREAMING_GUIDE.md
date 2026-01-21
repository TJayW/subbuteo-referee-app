# 📹 Streaming P2P Serverless - Guida Rapida

## ✨ Cosa hai ora

**Streaming completamente GRATUITO e SERVERLESS** per trasmettere le partite di Subbuteo!

### Tecnologia
- **WebRTC Peer-to-Peer**: connessione diretta browser-to-browser
- **PeerJS**: libreria che semplifica WebRTC (+ server signaling gratuito)
- **Zero costi server**: nessun backend, nessun hosting video
- **Latenza minima**: < 500ms (quasi tempo reale)

## 🚀 Come Usare

### 1. Avviare lo Streaming (Arbitro)

Nell'app, aggiungi il componente `StreamingPanel` dove preferisci (es. nel dashboard o sidebar):

```tsx
import { StreamingPanel } from '@/features/streaming';

function MatchDashboard() {
  return (
    <div>
      {/* Tuo contenuto esistente */}
      
      <StreamingPanel
        onStreamStart={(streamKey) => {
          console.log('Stream avviato:', streamKey);
          // Opzionale: salva streamKey nel state per inviare metadata
        }}
        onStreamStop={() => {
          console.log('Stream fermato');
        }}
      />
    </div>
  );
}
```

**Funzionalità StreamingPanel:**
- 📹 Pulsante Start/Stop streaming
- 🎥 Selezione fotocamera (se multiple)
- 👁️ Anteprima locale
- 👥 Contatore spettatori in tempo reale
- 🔗 Link condivisibile con copia rapida
- ⚠️ Gestione errori e stato connessione

### 2. Guardare lo Streaming (Spettatori)

Gli spettatori visitano l'URL: **`https://tuosito.com/#/watch/STREAM_KEY`**

Il routing è automatico (hash-based, nessun server config richiesto):
- `#/` → App principale
- `#/watch/:streamKey` → Pagina viewer

**Funzionalità WatchStream:**
- ▶️ Player video automatico
- 🔴 Indicatore LIVE
- 📡 Stato connessione in tempo reale
- 🔄 Riconnessione automatica se disconnesso
- 📊 Visualizzazione metadata partita (se inviato)

### 3. Inviare Metadata Partita (Opzionale)

Puoi inviare aggiornamenti di score/tempo a tutti gli spettatori:

```tsx
import { useStreaming } from '@/hooks';

function MatchControls() {
  const { isStreaming, broadcastData } = useStreaming();

  const handleScoreUpdate = (homeScore: number, awayScore: number) => {
    if (isStreaming) {
      broadcastData({
        score: { home: homeScore, away: awayScore },
        period: 'Primo Tempo',
        time: '12:34',
        homeTeam: 'AC Milan',
        awayTeam: 'Inter',
      });
    }
  };

  return (/* UI */);
}
```

## 📦 File Creati

```
src/
├── adapters/
│   └── media/
│       ├── webrtc-adapter.ts          # Core WebRTC P2P (broadcaster + viewer)
│       └── index.ts                   # Export barrel
├── features/
│   └── streaming/
│       ├── StreamingPanel.tsx         # UI per avviare stream (arbitro)
│       ├── WatchStream.tsx            # Pagina viewer (spettatori)
│       └── index.ts                   # Export barrel
├── hooks/
│   └── use-streaming.ts               # Hook React per gestire streaming
├── utils/
│   └── hash-router.ts                 # Router semplice hash-based
└── app/
    └── app.tsx                        # Aggiunto routing per /watch/:key
```

## 🎯 Architettura Serverless

```
┌─────────────┐
│  ARBITRO    │ (broadcaster)
│  (camera)   │
└──────┬──────┘
       │ WebRTC direct connection
       ├────────────┬────────────┬─────────────┐
       ↓            ↓            ↓             ↓
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ VIEWER 1 │  │ VIEWER 2 │  │ VIEWER 3 │  │ VIEWER N │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

           ↑ PeerJS Cloud (solo signaling) ↑
         (scambia solo metadata per connettere)
```

**Nota**: PeerJS Cloud è gratuito e gestisce SOLO lo scambio di metadata per stabilire la connessione. Il VIDEO viaggia direttamente tra i browser (P2P).

## 🔧 Integrazione Consigliata

### Opzione 1: Sidebar Streaming (più semplice)

Aggiungi il `StreamingPanel` nella sidebar dell'operatore:

```tsx
// src/features/operator-console/desktop/Sidebar.tsx
import { StreamingPanel } from '@/features/streaming';

export function Sidebar(props: SidebarProps) {
  return (
    <aside>
      {/* Contenuto esistente */}
      
      <div className="p-4 border-t">
        <StreamingPanel />
      </div>
    </aside>
  );
}
```

### Opzione 2: Tab Streaming nel Dashboard

Crea un nuovo tab nel dashboard:

```tsx
// src/features/dashboard/Dashboard.tsx
import { StreamingPanel } from '@/features/streaming';

const tabs = [
  { id: 'overview', name: 'Panoramica' },
  { id: 'events', name: 'Eventi' },
  { id: 'stats', name: 'Statistiche' },
  { id: 'streaming', name: '📹 Live' }, // NUOVO
];

// Nel render:
{activeTab === 'streaming' && <StreamingPanel />}
```

## 🌐 Deployment

**Nessuna configurazione server richiesta!** Il routing usa hash (#) quindi funziona anche su hosting statici.

### Hosting Consigliati (tutti supportano hash routing):
- **Vercel** ✅ (già configurato con `public/404.html`)
- **Netlify** ✅
- **GitHub Pages** ✅
- **Cloudflare Pages** ✅

## 🔒 Requisiti Browser

- **HTTPS obbligatorio** per `getUserMedia()` (fotocamera)
- Browser moderni: Chrome 87+, Firefox 82+, Safari 14+
- NO Internet Explorer

## 📊 Limiti P2P

| Aspetto | Limite | Soluzione se superi |
|---------|--------|---------------------|
| **Spettatori simultanei** | ~10-20 | Usa Mesh network o fallback HLS |
| **Bandwidth upload** | ~5-10 Mbps | Riduci qualità video |
| **Latenza** | 0.5-2s | Ottimo per live sports |
| **Firewall/NAT** | 90% funziona | PeerJS STUN servers gestiscono NAT |

## 🚦 Test Locale

```bash
# 1. Compila
npm run build

# 2. Testa in locale
npm run preview

# 3. Apri in 2 browser:
# Browser 1: http://localhost:4173 → Avvia streaming
# Browser 2: http://localhost:4173/#/watch/STREAM_KEY
#            (usa il link copiato dal Browser 1)
```

## 💡 Pro Tips

1. **Ottimizza Qualità**: Nel `StreamingPanel`, permetti selezione qualità video:
   ```ts
   { video: { width: 1280, height: 720, frameRate: 30 } }
   ```

2. **Notifiche**: Invia notifiche push quando stream inizia (usa Service Workers)

3. **QR Code**: Genera QR code del link per condivisione rapida:
   ```bash
   npm install qrcode
   ```

4. **Analytics**: Traccia viewer count in un database (Firebase Realtime DB gratuito)

## 🆘 Troubleshooting

### "Camera permission denied"
➜ Assicurati HTTPS (localhost va bene in dev)

### "Can't connect to stream"
➜ Verifica streamKey corretto e broadcaster online

### "Video nero ma connesso"
➜ Broadcaster ha bloccato la fotocamera - riavvia stream

### "Too many viewers lag"
➜ Normale oltre 10-15 viewer - considera HLS fallback

## 📚 Prossimi Passi

1. ✅ Testa in locale con 2 browser
2. ✅ Integra `StreamingPanel` nell'app
3. ✅ Deploy su HTTPS
4. 🔄 Opzionale: Aggiungi chat in tempo reale
5. 🔄 Opzionale: Recording locale (MediaRecorder API)

---

**Costo totale: €0/mese** 🎉
**Setup time: ~5 minuti** ⚡
**Scalabilità: ~10-20 spettatori** 👥
