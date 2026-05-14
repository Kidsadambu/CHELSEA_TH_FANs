const fixtures = [
  {
    home: 'Chelsea',
    away: 'Manchester City',
    time: '22:30'
  },
  {
    home: 'Tottenham Hotspur',
    away: 'Sunderland',
    time: '01:00'
  }
];

function createFixtureCard(match) {
  return `
    <div class="fixture-card">

      <div class="team">
        <img src="${getClubLogo(match.home)}" alt="${match.home}">
        <span>${match.home}</span>
      </div>

      <div class="match-time">
        ${match.time}
      </div>

      <div class="team away-team">
        <span>${match.away}</span>
        <img src="${getClubLogo(match.away)}" alt="${match.away}">
      </div>

    </div>
  `;
}

function renderFixtures(containerId, matches = fixtures) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = matches
    .map(match => createFixtureCard(match))
    .join('');
}
