/**
 * PNG Export Generator (Pure)
 * Generates HTML container for PNG export WITHOUT side effects
 * 
 * RESPONSIBILITY: Pure HTML DOM generation
 * NO: document manipulation, download, html2canvas
 */

import type { DomainMatchState, SettingsState, TeamConfig } from '@/domain/match/types';
import { selectAppliedEvents, selectTeamStats } from '@/domain/match/selectors';

export interface PNGReportData {
  homeDisplay: string;
  awayDisplay: string;
  stats: ReturnType<typeof selectTeamStats>;
  state: DomainMatchState;
  homeConfig?: TeamConfig;
  awayConfig?: TeamConfig;
}

/**
 * Generate PNG report data (pure function)
 */
export function generatePNGReportData(
  state: DomainMatchState,
  homeTeamName: string,
  awayTeamName: string,
  settings?: SettingsState
): PNGReportData {
  const stats = selectTeamStats(state);
  const homeDisplay = settings?.homeTeamConfig?.displayName || homeTeamName;
  const awayDisplay = settings?.awayTeamConfig?.displayName || awayTeamName;

  return {
    homeDisplay,
    awayDisplay,
    stats,
    state,
    homeConfig: settings?.homeTeamConfig,
    awayConfig: settings?.awayTeamConfig,
  };
}

/**
 * Generate HTML for PNG export (pure function - returns HTML string)
 */
export function generatePNGReportHTML(data: PNGReportData): string {
  const { homeDisplay, awayDisplay, stats, state, homeConfig, awayConfig } = data;
  
  const homeBgColor = homeConfig?.color.primary || '#dc2626';
  const awayBgColor = awayConfig?.color.primary || '#3b82f6';

  // Get recent goals
  const allEvents = selectAppliedEvents(state);
  const goalTimeline = allEvents
    .filter((e) => e.type === 'goal')
    .map((e) => ({
      team: e.team,
      secondsInPeriod: e.secondsInPeriod,
      period: e.period,
    }))
    .slice(-6);

  // Calculate goal momentum
  const homeGoals = goalTimeline.filter((g) => g.team === 'home').length;
  const awayGoals = goalTimeline.filter((g) => g.team === 'away').length;
  const goalMomentum = homeGoals > awayGoals ? 'home' : awayGoals > homeGoals ? 'away' : 'balanced';

  // COMPLETE HTML template migrated from export-advanced.ts createAdvancedStadiumReport
  // This is PURE - only generates string, no DOM manipulation
  return `
    <div style="
      background: linear-gradient(135deg, #0d1b2a 0%, #1a1f3a 50%, #0f1419 100%);
      border-radius: 0px;
      overflow: hidden;
      color: white;
      padding: 0;
      min-height: 1200px;
      position: relative;
      font-family: 'Segoe UI', system-ui, sans-serif;
    ">
      <!-- TOP BROADCAST BAR -->
      <div style="
        background: linear-gradient(90deg, #1a1a2e 0%, #0d1620 100%);
        padding: 16px 40px;
        border-bottom: 3px solid #ffb81c;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div style="
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: #ffb81c;
          font-weight: 800;
        ">
          🏆 FINALE DI CAMPIONATO
        </div>
        <div style="
          font-size: 10px;
          color: #a0aec0;
          letter-spacing: 2px;
        ">
          ${new Date().toLocaleDateString('it-IT')} • Subbuteo Sports Network
        </div>
      </div>

      <!-- MAIN SCOREBOARD - BROADCAST STYLE -->
      <div style="
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
        padding: 50px 40px;
        border-bottom: 1px solid rgba(255, 184, 28, 0.3);
        position: relative;
      ">
        <!-- Background Pattern -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.05;
          background: 
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255, 184, 28, 0.3) 40px, rgba(255, 184, 28, 0.3) 41px),
            repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255, 184, 28, 0.3) 30px, rgba(255, 184, 28, 0.3) 31px);
          pointer-events: none;
        "></div>

        <div style="position: relative; z-index: 1;">
          <!-- Score Container - Stats Dashboard Style -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
            align-items: center;
            margin-bottom: 0px;
          ">
            <!-- HOME TEAM -->
            <div style="
              text-align: right;
              padding-right: 40px;
              border-right: 3px solid rgba(255, 184, 28, 0.5);
            ">
              <!-- Team Logo -->
              <div style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, ${homeBgColor} 0%, ${homeBgColor}cc 100%);
                border-radius: 50%;
                border: 6px solid #ffb81c;
                box-shadow: 0 12px 40px rgba(255, 184, 28, 0.4), 0 0 60px ${homeBgColor}80;
                margin-bottom: 20px;
                margin-left: auto;
                font-size: 48px;
                font-weight: 900;
                color: white;
              ">
                ${homeDisplay.charAt(0)}
              </div>

              <!-- Team Name -->
              <div style="
                font-size: 36px;
                font-weight: 900;
                color: #ffb81c;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 8px;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
              ">
                ${homeDisplay}
              </div>

              <!-- Record/Status -->
              <div style="
                font-size: 12px;
                color: #cbd5e1;
                letter-spacing: 1px;
              ">
                Squadra Casa
              </div>
            </div>

            <!-- CENTER SCORE - BROADCAST STYLE -->
            <div style="
              text-align: center;
              padding: 0 30px;
            ">
              <!-- Match Status -->
              <div style="
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #ffb81c;
                margin-bottom: 20px;
                font-weight: 700;
              ">
                RISULTATO FINALE
              </div>

              <!-- BIG SCORE -->
              <div style="
                background: linear-gradient(135deg, #ffb81c 0%, #ffa500 50%, #ff9500 100%);
                padding: 40px 50px;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(255, 184, 28, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
              ">
                <!-- Shine Effect -->
                <div style="
                  position: absolute;
                  top: 0;
                  left: -100%;
                  right: -100%;
                  height: 2px;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
                "></div>

                <div style="
                  font-size: 100px;
                  font-weight: 900;
                  color: #0d1b2a;
                  line-height: 1;
                  letter-spacing: 2px;
                  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                  position: relative;
                  white-space: nowrap;
                  text-align: center;
                ">
                  ${stats.home.goals}&nbsp;&nbsp;-&nbsp;&nbsp;${stats.away.goals}
                </div>
              </div>

              <!-- Momentum Indicator -->
              <div style="
                display: flex;
                gap: 6px;
                justify-content: center;
              ">
                <div style="
                  flex: 1;
                  height: 4px;
                  background: ${goalMomentum === 'home' || goalMomentum === 'balanced' ? homeBgColor : 'rgba(0, 0, 0, 0.2)'};
                  border-radius: 2px;
                "></div>
                <div style="
                  flex: 1;
                  height: 4px;
                  background: ${goalMomentum === 'balanced' ? '#ffb81c' : 'rgba(0, 0, 0, 0.2)'};
                  border-radius: 2px;
                "></div>
                <div style="
                  flex: 1;
                  height: 4px;
                  background: ${goalMomentum === 'away' || goalMomentum === 'balanced' ? awayBgColor : 'rgba(0, 0, 0, 0.2)'};
                  border-radius: 2px;
                "></div>
              </div>
            </div>

            <!-- AWAY TEAM -->
            <div style="
              text-align: left;
              padding-left: 40px;
              border-left: 3px solid rgba(255, 184, 28, 0.5);
            ">
              <!-- Team Logo -->
              <div style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, ${awayBgColor} 0%, ${awayBgColor}cc 100%);
                border-radius: 50%;
                border: 6px solid #ffb81c;
                box-shadow: 0 12px 40px rgba(255, 184, 28, 0.4), 0 0 60px ${awayBgColor}80;
                margin-bottom: 20px;
                font-size: 48px;
                font-weight: 900;
                color: white;
              ">
                ${awayDisplay.charAt(0)}
              </div>

              <!-- Team Name -->
              <div style="
                font-size: 36px;
                font-weight: 900;
                color: #ffb81c;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 8px;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
              ">
                ${awayDisplay}
              </div>

              <!-- Record/Status -->
              <div style="
                font-size: 12px;
                color: #cbd5e1;
                letter-spacing: 1px;
              ">
                Squadra Ospite
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- GOAL TIMELINE - BROADCAST TICKER -->
      ${
        goalTimeline.length > 0
          ? `
      <div style="
        background: linear-gradient(90deg, rgba(255, 184, 28, 0.08) 0%, transparent 100%);
        padding: 30px 40px;
        border-bottom: 1px solid rgba(255, 184, 28, 0.2);
      ">
        <div style="
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: #ffb81c;
          margin-bottom: 20px;
          font-weight: 800;
        ">
          ⏱️ TIMELINE RETI
        </div>

        <div style="
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        ">
          ${goalTimeline
            .map(
              (g, idx) => `
            <div style="
              background: ${g.team === 'home' ? homeBgColor : awayBgColor};
              color: white;
              padding: 14px 20px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 700;
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
              border: 2px solid ${g.team === 'home' ? homeBgColor : awayBgColor};
              position: relative;
              letter-spacing: 1px;
            ">
              <div style="
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: #ffb81c;
                font-weight: 700;
              ">
                ${idx + 1}
              </div>
              ${g.secondsInPeriod}'
            </div>
          `
            )
            .join('')}
        </div>
      </div>
      `
          : ''
      }

      <!-- FORMATIONS & STATS - BROADCAST GRID -->
      <div style="
        padding: 40px;
        background: linear-gradient(180deg, rgba(255, 184, 28, 0.05) 0%, transparent 100%);
      ">
        <!-- Formations Header -->
        <div style="
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(255, 184, 28, 0.3);
        ">
          <div style="
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #ffb81c;
            font-weight: 800;
          ">
            ⚽ FORMAZIONI E STATISTICHE
          </div>
        </div>

        <!-- Stats Grid - 2 Columns -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
        ">
          <!-- HOME TEAM STATS -->
          <div style="
            padding: 40px;
            background: linear-gradient(135deg, rgba(${parseInt(homeBgColor.slice(1, 3), 16)}, ${parseInt(homeBgColor.slice(3, 5), 16)}, ${parseInt(homeBgColor.slice(5, 7), 16)}, 0.12) 0%, rgba(${parseInt(homeBgColor.slice(1, 3), 16)}, ${parseInt(homeBgColor.slice(3, 5), 16)}, ${parseInt(homeBgColor.slice(5, 7), 16)}, 0.05) 100%);
            border: 2px solid rgba(255, 184, 28, 0.2);
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          ">
            <!-- Formation -->
            <div style="
              text-align: center;
              margin-bottom: 35px;
            ">
              <div style="
                font-size: 14px;
                color: #ffb81c;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 12px;
                font-weight: 700;
              ">
                Formazione
              </div>
              <div style="
                font-size: 40px;
                font-weight: 900;
                color: #ffb81c;
                letter-spacing: 3px;
                text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
                text-align: center;
                word-spacing: 0px;
                white-space: nowrap;
              ">
                ${homeConfig?.formation.name || '4-3-3'}
              </div>
            </div>

            <!-- Stats Table -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Angoli</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.home.corners}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Rimesse</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.home.throwIns}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Falli</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.home.fouls}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Tiri</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.home.shots}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Gialli</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.home.yellowCards}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Rossi</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.home.redCards}</span>
              </div>
            </div>
          </div>

          <!-- AWAY TEAM STATS -->
          <div style="
            padding: 40px;
            background: linear-gradient(135deg, rgba(${parseInt(awayBgColor.slice(1, 3), 16)}, ${parseInt(awayBgColor.slice(3, 5), 16)}, ${parseInt(awayBgColor.slice(5, 7), 16)}, 0.12) 0%, rgba(${parseInt(awayBgColor.slice(1, 3), 16)}, ${parseInt(awayBgColor.slice(3, 5), 16)}, ${parseInt(awayBgColor.slice(5, 7), 16)}, 0.05) 100%);
            border: 2px solid rgba(255, 184, 28, 0.2);
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          ">
            <!-- Formation -->
            <div style="
              text-align: center;
              margin-bottom: 35px;
            ">
              <div style="
                font-size: 14px;
                color: #ffb81c;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 12px;
                font-weight: 700;
              ">
                Formazione
              </div>
              <div style="
                font-size: 40px;
                font-weight: 900;
                color: #ffb81c;
                letter-spacing: 3px;
                text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
                text-align: center;
                word-spacing: 0px;
                white-space: nowrap;
              ">
                ${awayConfig?.formation.name || '5-3-2'}
              </div>
            </div>

            <!-- Stats Table -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Angoli</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.away.corners}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Rimesse</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.away.throwIns}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Falli</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.away.fouls}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Tiri</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.away.shots}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Gialli</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.away.yellowCards}</span>
              </div>

              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                align-items: center;
                padding: 14px;
                background: rgba(255, 184, 28, 0.08);
                border-radius: 6px;
                border-left: 4px solid #ffb81c;
              ">
                <span style="color: #cbd5e1; font-size: 13px; font-weight: 600;">Rossi</span>
                <span style="color: #ffb81c; font-weight: 800; font-size: 20px; text-align: right;">${stats.away.redCards}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER - BROADCAST CREDIT -->
      <div style="
        background: linear-gradient(90deg, #1a1a2e 0%, #0d1620 100%);
        padding: 24px 40px;
        border-top: 3px solid #ffb81c;
        text-align: center;
        font-size: 11px;
        color: #64748b;
        letter-spacing: 1px;
      ">
        Subbuteo Sports Network • Live Match Report • ${new Date().toLocaleDateString('it-IT')} • Official Broadcast Feed
      </div>
    </div>
  `;
}

/**
 * Export metadata for filename generation
 */
export function generatePNGFilename(homeDisplay: string, awayDisplay: string): string {
  return `match-${homeDisplay}-vs-${awayDisplay}-${new Date().toISOString().split('T')[0]}.png`;
}
