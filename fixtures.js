const STORAGE_KEY = 'chelsea-fixtures';

const defaultFixtures = [
  {
    id: '1',
    home: 'Chelsea',
    away: 'Manchester City',
    time: '22:30',
    date: '2026-05-20',
    competition: 'Premier League',
    stadium: 'Stamford Bridge',
    status: 'upcoming'
  },
  {
    id: '2',
    home: 'Tottenham Hotspur',
    away: 'Sunderland',
    time: '01:00',
    date: '2026-05-24',
    competition: 'FA Cup',
    stadium: 'Tottenham Hotspur Stadium',
    status: 'upcoming'
  }
];

function loadFixtures() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFixtures));
    return defaultFixtures;
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return defaultFixtures;
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'live':
      return 'LIVE';
    case 'finished':
      return 'FT';
    default:
      return 'Upcoming';
  }
}

function createFixtureCard(match) {
  return `
    <div class="fixture-card">

      <div class="team">
        <img src="${getClubLogo(match.home)}" alt="${match.home}">
        <span>${match.home}</span>
      </div>

      <div class="match-time">
        <div>${match.time}</div>
        <small style="display:block;font-size:.75rem;margin-top:6px;color:#64748b">
          ${getStatusLabel(match.status)}
        </small>
      </div>

      <div class="team away-team">
        <span>${match.away}</span>
        <img src="${getClubLogo(match.away)}" alt="${match.away}">
      </div>

    </div>

    <div style="margin-top:-10px;margin-bottom:10px;padding:0 10px;color:#64748b;font-size:.92rem;text-align:center">
      ${match.date || ''} · ${match.competition || ''} · ${match.stadium || ''}
    </div>
  `;
}

function renderFixtures(containerId, matches = null) {
  const container = document.getElementById(containerId);

  if (!container) return;

  const fixtures = matches || loadFixtures();

  container.innerHTML = fixtures
    .map(match => createFixtureCard(match))
    .join('');
}
