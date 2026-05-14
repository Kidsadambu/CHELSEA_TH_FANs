const clubLogos = {
  "Chelsea": "https://i.postimg.cc/yNs5vXxg/CHELSEA.png",
  "Manchester City": "https://i.postimg.cc/PqTc2zJY/Manchester-City.png",
  "Tottenham Hotspur": "https://i.postimg.cc/SQD8GDyz/TOTTENHAM-HOTSPUR.png",
  "Sunderland": "https://i.postimg.cc/mrBq8NkP/Sunderland.png"
};

const defaultLogo = "https://i.postimg.cc/Z5QtVL7h/football-default.png";

function getClubLogo(teamName) {
  return clubLogos[teamName] || defaultLogo;
}

function createTeamCard(teamName) {
  return `
    <div class="team-card">
      <img src="${getClubLogo(teamName)}" alt="${teamName}">
      <h3>${teamName}</h3>
    </div>
  `;
}

function renderTeams(containerId, teams) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = teams
    .map(team => createTeamCard(team))
    .join('');
}
