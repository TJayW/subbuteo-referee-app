/**
 * HTML Generator - Pure Domain Logic
 * Genera HTML string senza side effects
 * NO DOM manipulation - solo generazione dati
 */

import type { DomainMatchState, SettingsState } from '@/domain/match/types';
import { selectAppliedEvents, selectTeamStats } from '@/domain/match/selectors';
import { getEventMetadata } from '@/utils/event-helpers';

/**
 * Genera HTML report come string
 * PURE FUNCTION - no side effects, no DOM access
 */
export function generateHTMLReport(
  state: DomainMatchState,
  homeTeamName: string = 'Casa',
  awayTeamName: string = 'Ospite',
  settings?: SettingsState
): string {
  const appliedEvents = selectAppliedEvents(state);
  const stats = selectTeamStats(state);
  const homeDisplay = settings?.homeTeamConfig?.displayName || homeTeamName;
  const awayDisplay = settings?.awayTeamConfig?.displayName || awayTeamName;

  const homeColor = settings?.homeTeamConfig?.color.primary || '#dc2626';
  const awayColor = settings?.awayTeamConfig?.color.primary || '#3b82f6';

  const homeBg = homeColor;
  const awayBg = awayColor;

  // Build player rows
  const homePlayersHTML = settings?.homeTeamConfig?.formation.players
    .map((p) => `<div class="player-item"><span class="player-num">${p.number}</span><span>${p.name}</span></div>`)
    .join('') || '';

  const awayPlayersHTML = settings?.awayTeamConfig?.formation.players
    .map((p) => `<div class="player-item"><span class="player-num">${p.number}</span><span>${p.name}</span></div>`)
    .join('') || '';

  // Build event rows
  const eventsHTML = appliedEvents
    .map((e) => {
      const meta = getEventMetadata(e.type);
      const minutes = Math.floor(e.secondsInPeriod / 60);
      const teamDisplay = e.team === 'home' ? homeDisplay : e.team === 'away' ? awayDisplay : 'Sistema';

      return `
        <div class="event-row">
          <span class="event-time">${minutes}'</span>
          <span class="event-period">${e.period}</span>
          <span class="event-team">${teamDisplay}</span>
          <span class="event-type">${meta.label}</span>
          <span class="event-player">${e.note || '-'}</span>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Match Report - ${homeDisplay} vs ${awayDisplay}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #0f1923 100%);
      color: #f0f0f0;
      padding: 30px 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(180deg, #162a4a 0%, #0f1923 100%);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      padding: 50px 40px;
      border: 2px solid rgba(255, 184, 28, 0.2);
    }

    .title {
      text-align: center;
      font-size: 18px;
      text-transform: uppercase;
      letter-spacing: 4px;
      color: #ffb81c;
      margin-bottom: 40px;
      font-weight: 300;
    }

    .teams-score {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 60px;
      align-items: center;
      padding: 40px 0;
      border-bottom: 2px solid rgba(255, 184, 28, 0.2);
      margin-bottom: 40px;
    }

    .team-col {
      text-align: center;
    }

    .team-badge {
      display: inline-block;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      border: 4px solid #ffb81c;
      margin-bottom: 15px;
    }

    .team-name {
      font-size: 28px;
      font-weight: bold;
      color: #ffb81c;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .score-display {
      text-align: center;
    }

    .score-number {
      font-size: 80px;
      font-weight: bold;
      color: #ffb81c;
      letter-spacing: 4px;
      line-height: 1;
    }

    .score-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #a0aec0;
      margin-top: 10px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
      padding: 50px 40px;
      border-top: 1px solid rgba(255, 184, 28, 0.1);
      border-bottom: 1px solid rgba(255, 184, 28, 0.1);
      margin-bottom: 40px;
    }

    .team-stats {
      text-align: center;
    }

    .formation-name {
      font-size: 28px;
      color: #ffb81c;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .formation-label {
      font-size: 11px;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 25px;
    }

    .stat-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
      font-size: 13px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid rgba(255, 184, 28, 0.1);
    }

    .stat-name {
      color: #cbd5e1;
    }

    .stat-value {
      color: #ffb81c;
      font-weight: bold;
      font-size: 16px;
    }

    .players-section {
      margin: 40px 0;
    }

    .players-title {
      font-size: 14px;
      color: #ffb81c;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(255, 184, 28, 0.2);
    }

    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
    }

    .player-item {
      background: rgba(255, 184, 28, 0.08);
      padding: 12px;
      border-radius: 8px;
      border-left: 3px solid #ffb81c;
      font-size: 12px;
    }

    .player-num {
      display: block;
      font-weight: bold;
      color: #ffb81c;
      font-size: 14px;
      margin-bottom: 5px;
    }

    .events-section {
      margin-top: 40px;
    }

    .events-title {
      font-size: 14px;
      color: #ffb81c;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(255, 184, 28, 0.2);
    }

    .event-row {
      display: grid;
      grid-template-columns: 80px 60px 100px 1fr 100px;
      gap: 15px;
      padding: 10px;
      border-bottom: 1px solid rgba(255, 184, 28, 0.1);
      align-items: center;
      font-size: 12px;
    }

    .event-time {
      color: #ffb81c;
      font-weight: bold;
    }

    .event-period {
      color: #a0aec0;
    }

    .event-team {
      font-weight: bold;
    }

    .event-type {
      color: #cbd5e1;
    }

    .event-player {
      color: #a0aec0;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 184, 28, 0.2);
      font-size: 11px;
      color: #64748b;
    }

    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }

      .teams-score {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 0;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        padding: 30px 0;
      }

      .score-number {
        font-size: 48px;
      }

      .event-row {
        grid-template-columns: 1fr;
        gap: 5px;
      }
    }

    @media print {
      body {
        background: white;
      }

      .container {
        background: white;
        color: black;
        box-shadow: none;
        padding: 20px;
      }

      .title, .team-name, .formation-name, .stat-value, .player-num, .event-time, .events-title, .players-title {
        color: #1a1a2e;
      }

      .stat-item, .player-item {
        border-color: #ccc;
        background: #f9f9f9;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">🏆 LA FINALE</div>

    <div class="teams-score">
      <div class="team-col">
        <div class="team-badge" style="background-color: ${homeBg};"></div>
        <div class="team-name">${homeDisplay}</div>
      </div>

      <div class="score-display">
        <div class="score-number">${stats.home.goals} - ${stats.away.goals}</div>
        <div class="score-label">Gol</div>
      </div>

      <div class="team-col">
        <div class="team-badge" style="background-color: ${awayBg};"></div>
        <div class="team-name">${awayDisplay}</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="team-stats">
        <div class="formation-name">${settings?.homeTeamConfig?.formation.name || '4-3-3'}</div>
        <div class="formation-label">Formazione</div>
        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-name">Angoli</span>
            <span class="stat-value">${stats.home.corners}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Rimesse</span>
            <span class="stat-value">${stats.home.throwIns}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Falli</span>
            <span class="stat-value">${stats.home.fouls}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Tiri</span>
            <span class="stat-value">${stats.home.shots}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Gialli</span>
            <span class="stat-value">${stats.home.yellowCards}</span>
          </div>
        </div>
      </div>

      <div class="team-stats">
        <div class="formation-name">${settings?.awayTeamConfig?.formation.name || '5-3-2'}</div>
        <div class="formation-label">Formazione</div>
        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-name">Angoli</span>
            <span class="stat-value">${stats.away.corners}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Rimesse</span>
            <span class="stat-value">${stats.away.throwIns}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Falli</span>
            <span class="stat-value">${stats.away.fouls}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Tiri</span>
            <span class="stat-value">${stats.away.shots}</span>
          </div>
          <div class="stat-item">
            <span class="stat-name">Gialli</span>
            <span class="stat-value">${stats.away.yellowCards}</span>
          </div>
        </div>
      </div>
    </div>

    ${homePlayersHTML || awayPlayersHTML ? `
    <div class="players-section">
      <div class="players-title">Rosa Squadre</div>
      <div class="stats-grid">
        <div>
          <h4 style="color: #ffb81c; margin-bottom: 15px; font-size: 14px;">${homeDisplay}</h4>
          <div class="players-grid">
            ${homePlayersHTML}
          </div>
        </div>
        <div>
          <h4 style="color: #ffb81c; margin-bottom: 15px; font-size: 14px;">${awayDisplay}</h4>
          <div class="players-grid">
            ${awayPlayersHTML}
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="events-section">
      <div class="events-title">Cronologia Eventi (${appliedEvents.length})</div>
      ${eventsHTML}
    </div>

    <div class="footer">
      Generato da Subbuteo Referee App | ${new Date().toLocaleDateString('it-IT')}
    </div>
  </div>
</body>
</html>`;
}
