# 🎬 Come Accedere allo Streaming

## 📍 Dove trovare la funzionalità

Lo streaming è integrato nell'**Operator Console** e appare automaticamente quando:

1. ✅ **Hai un match attivo** (creato o in corso)
2. ✅ **Sidebar è aperta** (desktop/tablet)
3. ✅ **Scorri fino alla Card 5** nella sidebar

---

## 🚀 Accesso Rapido - 3 Modi

### Metodo 1: Durante un Match (Consigliato)

```bash
1. Avvia l'app: npm run dev
2. Vai su http://localhost:5173
3. Nella Dashboard principale:
   - Inserisci nomi squadre
   - Clicca "Inizia Partita"
4. L'Operator Console si apre
5. Guarda la SIDEBAR DESTRA
6. Scorri fino in fondo → trovi "Card 5: Streaming"
7. Clicca per aprire il pannello
```

### Metodo 2: Link Diretto al Viewer (Per testare)

```bash
# Crea uno stream e poi visita:
http://localhost:5173/#/watch/test-stream-key-123

# Questo apre direttamente la pagina viewer
# (anche senza broadcaster attivo, per testare UI)
```

### Metodo 3: Aggiungi Button nella Home (Nuovo)

Ti creo un button nella dashboard principale per accesso rapido allo streaming:

---

## 🎯 Struttura Attuale

```
App
├── Home Dashboard (/)
│   ├── Setup match (nomi squadre)
│   └── Storico partite
│
└── Operator Console (dopo "Inizia Partita")
    ├── Campo centrale (eventi in real-time)
    └── Sidebar DESTRA ← QUI C'È LO STREAMING
        ├── Card 1: Event Log
        ├── Card 2: Team Control
        ├── Card 3: Time Control
        ├── Card 4: Match Control
        └── Card 5: Streaming Control ← QUESTA!
```

---

## 💡 Soluzione: Aggiungo Button "Test Streaming" in Home

Per facilitare l'accesso, aggiungo un bottone nella home che:
- Apre direttamente la StreamingDashboard
- Non richiede match attivo
- Perfetto per testing

Vedi implementazione qui sotto ↓
