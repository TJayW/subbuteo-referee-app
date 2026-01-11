import html2canvas from 'html2canvas';
import type { DomainMatchState, SettingsState } from '@/domain/match/types';
import { selectAppliedEvents, selectTeamStats } from '@/domain/match/selectors';
import { getEventMetadata, formatEventTime } from '@/utils/event-helpers';

export async function exportStatsPNG(
  state: DomainMatchState,
  homeTeamName: string = 'Casa',
  awayTeamName: string = 'Ospite',
  elementId: string = 'stats-export',
  homeDisplayName?: string,
  awayDisplayName?: string
) {
  try {
    const stats = selectTeamStats(state);
    
    let container = document.getElementById(elementId);
    let createdTemp = false;

    if (!container) {
      createdTemp = true;
      container = createStatsCard(stats, homeTeamName, awayTeamName, homeDisplayName, awayDisplayName);
      document.body.appendChild(container);
    }

    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    });

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    const homeDisplay = homeDisplayName || homeTeamName;
    const awayDisplay = awayDisplayName || awayTeamName;
    link.href = canvas.toDataURL('image/png');
    link.download = `match-${homeDisplay}-vs-${awayDisplay}-${timestamp}.png`;
    link.click();

    if (createdTemp && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  } catch (error) {
    console.error('PNG export failed:', error);
  }
}

function createStatsCard(
  stats: ReturnType<typeof selectTeamStats>,
  homeTeamName: string,
  awayTeamName: string,
  homeDisplayName?: string,
  awayDisplayName?: string
): HTMLDivElement {
  const homeStats = stats.home;
  const awayStats = stats.away;
  const homeDisplay = homeDisplayName || homeTeamName;
  const awayDisplay = awayDisplayName || awayTeamName;

  const container = document.createElement('div');
  container.id = 'stats-export';
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.width = '1200px';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  const html = `
    <div style="background: linear-gradient(135deg, #001f3f 0%, #003d7a 100%); padding: 60px; color: white; width: 100%;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 50px;">
        <div style="font-size: 18px; text-transform: uppercase; letter-spacing: 4px; color: #ffb81c; margin-bottom: 10px; font-weight: bold;">
          SPORTS NETWORK
        </div>
        <div style="font-size: 14px; color: #b0b0b0;">STATISTICHE PARTITA</div>
      </div>

      <!-- Main Score -->
      <div style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 60px;">
        <div style="text-align: center; flex: 1;">
          <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">${homeDisplay}</div>
          <div style="font-size: 120px; font-weight: 900; color: #4CAF50; line-height: 1;">${homeStats.goals}</div>
        </div>
        
        <div style="text-align: center; flex: 0 0 auto; padding: 0 40px;">
          <div style="font-size: 24px; color: #ffb81c; font-weight: bold;">vs</div>
          <div style="font-size: 12px; color: #b0b0b0; margin-top: 10px; text-transform: uppercase;">
            ${new Date().toLocaleDateString('it-IT')}
          </div>
        </div>

        <div style="text-align: center; flex: 1;">
          <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">${awayDisplay}</div>
          <div style="font-size: 120px; font-weight: 900; color: #FF6B6B; line-height: 1;">${awayStats.goals}</div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 40px;">
        ${[
          { icon: '👎', label: 'Falli', home: homeStats.fouls, away: awayStats.fouls },
          { icon: '🟡', label: 'Gialli', home: homeStats.yellowCards, away: awayStats.yellowCards },
          { icon: '🔴', label: 'Rossi', home: homeStats.redCards, away: awayStats.redCards },
          { icon: '⏱️', label: 'Timeout', home: homeStats.timeouts, away: awayStats.timeouts },
          { icon: '📸', label: 'Tiri', home: homeStats.shots, away: awayStats.shots },
          { icon: '🤾', label: 'Rimesse', home: homeStats.throwIns, away: awayStats.throwIns },
        ]
          .map(stat => `
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid rgba(255, 184, 28, 0.3);">
              <div style="font-size: 28px; margin-bottom: 10px;">${stat.icon}</div>
              <div style="font-size: 12px; text-transform: uppercase; color: #b0b0b0; margin-bottom: 12px; letter-spacing: 2px;">${stat.label}</div>
              <div style="display: flex; justify-content: space-around; font-size: 24px; font-weight: bold;">
                <div style="color: #4CAF50;">${stat.home}</div>
                <div style="color: #FF6B6B;">${stat.away}</div>
              </div>
            </div>
          `)
          .join('')}
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 2px solid rgba(255, 184, 28, 0.3); padding-top: 30px;">
        <div style="font-size: 12px; color: #b0b0b0; text-transform: uppercase; letter-spacing: 2px;">
          POWERED BY SUBBUTEO REFEREE SYSTEM
        </div>
        <div style="font-size: 11px; color: #666; margin-top: 10px;">
          ${new Date().toLocaleString('it-IT')}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  return container;
}

export function exportJSON(
  state: DomainMatchState,
  homeTeamName: string = 'Casa',
  awayTeamName: string = 'Ospite',
  settings?: SettingsState
) {
  const appliedEvents = selectAppliedEvents(state);
  const stats = selectTeamStats(state);

  const data = {
    match: {
      homeTeam: homeTeamName,
      awayTeam: awayTeamName,
      finalScore: `${stats.home.goals} - ${stats.away.goals}`,
      period: state.period,
      timestamp: new Date().toISOString(),
      durationSeconds: state.elapsedSeconds,
      eventsCursor: state.cursor,
      totalEvents: state.events.length,
      ...(settings?.officiating && {
        referees: {
          referee1: settings.officiating.referee1,
          ...(settings.officiating.referee2 && { referee2: settings.officiating.referee2 }),
        },
      }),
    },
    homeTeam: {
      name: homeTeamName,
      displayName: settings?.homeTeamConfig?.displayName || homeTeamName,
      stats: {
        ...stats.home,
        name: homeTeamName,
      },
      ...(settings?.homeTeamConfig && {
        color: settings.homeTeamConfig.color,
        formation: settings.homeTeamConfig.formation.name,
        players: settings.homeTeamConfig.formation.players,
      }),
    },
    awayTeam: {
      name: awayTeamName,
      displayName: settings?.awayTeamConfig?.displayName || awayTeamName,
      stats: {
        ...stats.away,
        name: awayTeamName,
      },
      ...(settings?.awayTeamConfig && {
        color: settings.awayTeamConfig.color,
        formation: settings.awayTeamConfig.formation.name,
        players: settings.awayTeamConfig.formation.players,
      }),
    },
    events: appliedEvents.map(e => ({
      id: e.id,
      time: formatEventTime(e.secondsInPeriod),
      period: e.period,
      type: e.type,
      team: e.team,
      delta: e.delta ?? 1,
      note: e.note || '',
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const homeDisplay = settings?.homeTeamConfig?.displayName || homeTeamName;
  const awayDisplay = settings?.awayTeamConfig?.displayName || awayTeamName;
  link.download = `match-${homeDisplay}-vs-${awayDisplay}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(
  state: DomainMatchState,
  homeTeamName: string = 'Casa',
  awayTeamName: string = 'Ospite',
  settings?: SettingsState
) {
  const appliedEvents = selectAppliedEvents(state);
  const stats = selectTeamStats(state);

  const rows = [
    ['STATISTICHE PARTITA', `${settings?.homeTeamConfig?.displayName || homeTeamName} vs ${settings?.awayTeamConfig?.displayName || awayTeamName}`, '', ''],
    ...(settings?.officiating && settings.officiating.referee1
      ? [
          ['ARBITRI', '', '', ''],
          ['Arbitro Principale', settings.officiating.referee1, '', ''],
          ...(settings.officiating.referee2
            ? [['Arbitro Assistente', settings.officiating.referee2, '', '']]
            : []),
          ['', '', '', ''],
        ]
      : []),
    ['', settings?.homeTeamConfig?.displayName || 'Casa', settings?.awayTeamConfig?.displayName || 'Ospite', ''],
    ['Gol', stats.home.goals, stats.away.goals, ''],
    ['Falli', stats.home.fouls, stats.away.fouls, ''],
    ['Gialli', stats.home.yellowCards, stats.away.yellowCards, ''],
    ['Rossi', stats.home.redCards, stats.away.redCards, ''],
    ['Timeout', stats.home.timeouts, stats.away.timeouts, ''],
    ['Tiri', stats.home.shots, stats.away.shots, ''],
    ['Tiri in Porta', stats.home.shotsOnTarget, stats.away.shotsOnTarget, ''],
    ['Angoli', stats.home.corners, stats.away.corners, ''],
    ['Rimesse', stats.home.throwIns, stats.away.throwIns, ''],
    ...(settings?.homeTeamConfig || settings?.awayTeamConfig
      ? [
          ['', '', '', ''],
          ['FORMAZIONI', '', '', ''],
          ['Casa', settings?.homeTeamConfig?.formation.name || '', '', ''],
          ...(settings?.homeTeamConfig?.formation.players.length
            ? [
                ['Giocatori Casa', '', '', ''],
                ...settings.homeTeamConfig.formation.players.map(p => [
                  `${p.number || ''} ${p.name} ${p.isCaptain ? '(C)' : ''}`,
                  p.position || '',
                  '',
                  '',
                ]),
              ]
            : []),
          ['', '', '', ''],
          ['Ospite', settings?.awayTeamConfig?.formation.name || '', '', ''],
          ...(settings?.awayTeamConfig?.formation.players.length
            ? [
                ['Giocatori Ospite', '', '', ''],
                ...settings.awayTeamConfig.formation.players.map(p => [
                  `${p.number || ''} ${p.name} ${p.isCaptain ? '(C)' : ''}`,
                  p.position || '',
                  '',
                  '',
                ]),
              ]
            : []),
        ]
      : []),
    ['', '', '', ''],
    ['EVENT LOG', '', '', ''],
    ['Tempo', 'Periodo', 'Team', 'Evento', 'Nota'],
    ...appliedEvents.map(e => {
      const meta = getEventMetadata(e.type);
      const teamDisplay = e.team === 'home' 
        ? (settings?.homeTeamConfig?.displayName || homeTeamName)
        : (settings?.awayTeamConfig?.displayName || awayTeamName);
      return [
        formatEventTime(e.secondsInPeriod),
        e.period,
        teamDisplay,
        meta.label,
        e.note || '',
      ];
    }),
  ];

  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const homeDisplay = settings?.homeTeamConfig?.displayName || homeTeamName;
  const awayDisplay = settings?.awayTeamConfig?.displayName || awayTeamName;
  link.download = `match-${homeDisplay}-vs-${awayDisplay}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
