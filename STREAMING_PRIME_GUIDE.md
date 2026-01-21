# 🎬 Subbuteo Live Streaming - Guida Completa Amazon Prime Video Style

## 📋 Panoramica

Il sistema di streaming live è ora implementato con **UI/UX professionale stile Amazon Prime Video**, offrendo un'esperienza utente premium per broadcaster e spettatori.

---

## ✨ Caratteristiche Principali

### 🎥 Video Player Avanzato
- **Controlli personalizzati** con overlay elegante
- **Play/pause intelligente** (click su video)
- **Barra di progresso** con hover preview
- **Controllo volume** con slider
- **Fullscreen/Picture-in-Picture**
- **Scorciatoie tastiera** (space, f, m, frecce)
- **Loading states** professionali
- **Auto-hide controlli** dopo 3 secondi
- **Live badge** animato

### 📊 Broadcasting Dashboard
- **Preview live** con player integrato
- **Metriche in tempo reale**:
  - Viewer count (attuale, picco, media)
  - Bitrate e FPS
  - Latenza e jitter
  - Risoluzione stream
  - Pacchetti persi
- **Analytics dashboard** con grafici
- **Quick actions**:
  - Condividi link
  - Registra stream
  - Apri chat
  - Impostazioni
- **Stream info** dettagliate
- **Timer durata stream**
- **Health monitoring**

### 💬 Chat Live Integrata
- **Messaggi in tempo reale**
- **Avatar colorati** per utenti
- **Timestamp relativo** (2m fa, 5m fa)
- **Reazioni** (like/reactions)
- **Input elegante** con auto-focus
- **Toggle show/hide**
- **Scroll automatico** a nuovi messaggi

### 🎮 Viewer Experience
- **Layout responsive** (video + chat sidebar)
- **Metadata match** in tempo reale:
  - Score aggiornato
  - Periodo corrente
  - Tempo di gioco
  - Fase partita
- **Quick stats** (spettatori, qualità, fase)
- **Interazioni social**:
  - Like/Heart animato
  - Share link (copy to clipboard)
  - Viewer count live
- **Connection status** intelligente
- **Auto-reconnect** su perdita connessione
- **Error handling** con retry

### 🎨 Design System
- **Gradients eleganti** (blu → viola)
- **Backdrop blur** per header/overlays
- **Dark theme** premium
- **Animazioni fluide**
- **Hover states** dettagliati
- **Focus rings** accessibili
- **Badge/Pills** informativi
- **Icons da Lucide React**

---

## 📱 Componenti Implementati

### 1. VideoPlayer (`src/ui/components/VideoPlayer.tsx`)

```tsx
<VideoPlayer 
  stream={mediaStream} 
  isLive={true} 
  autoPlay={true}
/>
```

**Features:**
- Custom controls overlay (non-native)
- Play/pause on click
- Volume control con slider
- Fullscreen toggle
- Quality selector (Auto, 1080p, 720p, 480p)
- Keyboard shortcuts:
  - `Space/K`: Play/Pause
  - `F`: Fullscreen
  - `M`: Mute
  - `←`: -10s
  - `→`: +10s
  - `↑`: Volume +10%
  - `↓`: Volume -10%

### 2. StreamingDashboard (`src/features/streaming/StreamingDashboard.tsx`)

Dashboard professionale per il broadcaster:

```tsx
<StreamingDashboard 
  matchState={state}
  homeTeamName="Team A"
  awayTeamName="Team B"
  onClose={() => {}}
/>
```

**Layout:**
- Header sticky con info stream
- Video preview (grande)
- Metriche 4-grid (spettatori, bitrate, latenza, qualità)
- Quick actions bar
- Sidebar: Info stream, analytics, chat

**Metriche:**
- 👥 Viewer Count (real-time + peak)
- 📊 Bitrate (kbps) + FPS
- 📡 Latency (ms) + Jitter
- 🎬 Resolution + Packet Loss

### 3. WatchStream (`src/features/streaming/WatchStream.tsx`)

Pagina viewer completamente rinnovata:

```tsx
// Auto-routing via #/watch/:streamKey
<WatchStream />
```

**Layout Amazon Prime:**
- Header sticky (logo, home, stats, LIVE badge, social buttons)
- Grid 2-column: Video (main) + Chat (sidebar 380px)
- Video player full-featured
- Match info card sotto video (score grande, stats)
- Chat live con messaggi, reactions, input

**Features:**
- Auto-connect allo stream
- Loading states con spinner animato
- Error states con retry button
- Like/Heart toggle
- Share button (copy URL)
- Viewer count live
- Chat persistente

---

## 🚀 Utilizzo

### Per il Broadcaster (Arbitro)

1. **Apri l'app** e vai alla partita
2. **Clicca Card #5** nella Sidebar → "Streaming"
3. **Si apre la Dashboard** full-screen
4. **Clicca "Vai in Diretta"**:
   - Camera access richiesto
   - Stream key generato
   - URL condivisibile creato
5. **Monitora**:
   - Preview video in tempo reale
   - Viewer count
   - Metriche performance
   - Chat (se implementata sync)
6. **Quick Actions**:
   - Condividi link (copy to clipboard)
   - Registra stream locale
   - Impostazioni qualità
7. **Termina**: Clicca "Termina Diretta"

### Per lo Spettatore

1. **Ricevi link** dal broadcaster (es. `https://app.com/#/watch/abc123`)
2. **Apri link** nel browser
3. **Video parte automaticamente**:
   - Player con controlli
   - Metadata match live
   - Chat attiva
4. **Interagisci**:
   - Like/Heart la partita
   - Scrivi messaggi in chat
   - Condividi con altri
   - Fullscreen per immersione
5. **Viewer count** visibile in tempo reale

---

## 🎯 User Flow Completo

### Broadcaster Journey

```
1. Match in corso
   ↓
2. Click Card "Streaming" in Sidebar
   ↓
3. Dashboard si apre (full-screen overlay)
   ↓
4. Click "Vai in Diretta"
   ↓
5. Browser richiede permesso camera
   ↓
6. Stream inizia → Preview visibile
   ↓
7. URL generato e copiabile
   ↓
8. Share via WhatsApp/Telegram/Social
   ↓
9. Viewer si connettono → Count aumenta
   ↓
10. Match metadata si sincronizza automaticamente
   ↓
11. Monitora metriche (bitrate, latency, FPS)
   ↓
12. Fine match → Click "Termina Diretta"
   ↓
13. Analytics salvate (durata, peak viewers, total)
```

### Viewer Journey

```
1. Riceve link stream
   ↓
2. Click link → Apre #/watch/:key
   ↓
3. Loading screen (spinner animato)
   ↓
4. Connessione P2P stabilita
   ↓
5. Video player carica e avvia
   ↓
6. Vede metadata match (score, tempo, periodo)
   ↓
7. Chat live disponibile (legge/scrive messaggi)
   ↓
8. Può interagire:
   - Like/Heart
   - Share link
   - Chat reactions
   - Fullscreen
   ↓
9. Se disconnessione → Auto-reconnect
   ↓
10. Stream termina → Messaggio di chiusura
```

---

## 🎨 Design Patterns

### Color Palette
- **Background**: `from-gray-900 via-black to-gray-900`
- **Cards**: `bg-gray-900/50` con `border-gray-800`
- **Accents**: 
  - Blue: `from-blue-600 to-blue-500`
  - Purple: `from-purple-600 to-purple-500`
  - Red (Live): `bg-red-600`
  - Green (Success): `from-green-500 to-green-600`

### Typography
- **Headers**: `font-bold text-xl`
- **Body**: `text-gray-300 text-sm`
- **Accents**: `text-white font-semibold`
- **Timestamps**: `text-gray-500 text-xs`

### Spacing
- **Padding**: `p-6` (cards), `p-4` (compact)
- **Gaps**: `gap-6` (layouts), `gap-3` (grids)
- **Rounded**: `rounded-2xl` (cards), `rounded-lg` (buttons)

### Animations
- **Fade**: `transition-opacity duration-300`
- **Pulse**: `animate-pulse` (live badge)
- **Spin**: `animate-spin` (loading)
- **Hover**: `hover:scale-110` (buttons)

---

## 🔧 Personalizzazione

### Cambia Colori Chat Header

```tsx
// StreamingDashboard.tsx o WatchStream.tsx
<div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
  {/* Cambia da blue-purple a tuo gradient */}
</div>
```

### Aggiungi Qualità Custom

```tsx
// VideoPlayer.tsx
{['Auto', '1080p', '720p', '480p', '360p'].map((q) => (
  // Aggiungi '360p' per low-bandwidth
))}
```

### Modifica Metriche Dashboard

```tsx
// StreamingDashboard.tsx
<MetricCard
  icon={<YourIcon />}
  label="Nuova Metrica"
  value="123"
  subtext="Descrizione"
  color="orange"
/>
```

### Cambia Layout Chat

```tsx
// WatchStream.tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
  {/* Cambia 380px per sidebar più larga/stretta */}
</div>
```

---

## 🐛 Troubleshooting

### Video non si vede
- ✅ Controlla permesso camera (browser settings)
- ✅ Usa HTTPS (WebRTC richiede secure context)
- ✅ Verifica stream key valido
- ✅ Check console per errori PeerJS

### Controlli non appaiono
- ✅ Muovi mouse su video → controlli appaiono
- ✅ Verifica `showControls` state
- ✅ Check z-index overlay

### Chat non funziona
- ✅ Implementa broadcast via data channel
- ✅ Aggiungi WebSocket per persistence
- ✅ Verifica sincronizzazione messaggi

### Qualità bassa
- ✅ Cambia preset da "medium" a "high"
- ✅ Aumenta bitrate in constraints
- ✅ Verifica bandwidth viewer

### Auto-hide non funziona
- ✅ Controlla `isPlaying` state
- ✅ Verifica timeout cleanup
- ✅ Per live stream: `isLive={true}` disabilita auto-hide

---

## 📊 Metriche & Analytics

### Salvate Automaticamente

```typescript
// streamingAnalytics tracks:
{
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number; // secondi
  peakViewers: number;
  totalViewers: number;
  averageViewers: number;
  quality: 'low' | 'medium' | 'high';
  events: [
    { type: 'viewer_join', viewerId, timestamp },
    { type: 'viewer_leave', viewerId, timestamp },
    { type: 'error', message, timestamp }
  ]
}
```

### Visualizzazione

Dashboard mostra:
- **Attuali**: viewer connessi ora
- **Picco**: max viewer simultanei
- **Media**: average durante stream
- **Grafico**: barra progresso (current/capacity)

---

## 🚀 Prossimi Miglioramenti

### Fase 2 (Future)
- [ ] **HLS fallback** per >20 viewer
- [ ] **Chat persistence** con WebSocket
- [ ] **Reactions animate** (cuori, applausi)
- [ ] **Screen sharing** oltre camera
- [ ] **Multi-camera** switching
- [ ] **Recording automatico** su cloud
- [ ] **Highlights clips** auto-generate
- [ ] **Analytics dashboard** completa
- [ ] **Access control** (JWT, passwords)
- [ ] **Monetization** (pay-per-view)

### Ottimizzazioni
- [ ] Code-splitting per player
- [ ] Lazy load chat
- [ ] Service Worker per offline
- [ ] WebAssembly per encoding
- [ ] Adaptive bitrate switching

---

## 💡 Best Practices

### Performance
- ✅ Usa `memo` per componenti pesanti
- ✅ Debounce hover events
- ✅ Throttle analytics tracking
- ✅ Lazy load emoji/reactions

### UX
- ✅ Loading states ovunque
- ✅ Error boundaries per fallback
- ✅ Keyboard shortcuts documentati
- ✅ Tooltips su hover
- ✅ Feedback visivo immediato

### Accessibilità
- ✅ Focus rings visibili
- ✅ ARIA labels su pulsanti
- ✅ Keyboard navigation completa
- ✅ Screen reader friendly
- ✅ Contrasto colori WCAG AA

---

## 📞 Supporto

Per problemi o domande:
- 📖 Leggi `docs/STREAMING_ARCHITECTURE.md`
- 🚀 Vedi `docs/STREAMING_DEPLOYMENT.md`
- 🐛 Apri issue su GitHub
- 💬 Contatta team sviluppo

---

**Implementato con ❤️ in stile Amazon Prime Video**
