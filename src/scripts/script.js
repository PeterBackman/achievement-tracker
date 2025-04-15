const LOCAL_STORAGE_KEY = "achievements";
const CLAIMED_STORAGE_KEY = "claimed";

function loadAchievements() {
  const achievementsData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  return achievementsData || [];
}

function saveAchievements(data) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

function loadClaimedAchievements() {
  const claimedData = JSON.parse(localStorage.getItem(CLAIMED_STORAGE_KEY));
  return claimedData || [];
}

function saveClaimedAchievements(data) {
  localStorage.setItem(CLAIMED_STORAGE_KEY, JSON.stringify(data));
}

function renderAchievements() {
  const container = document.getElementById("achievements-grid");
  const achievements = loadAchievements();
  const claimed = loadClaimedAchievements();

  container.innerHTML = "";
  achievements.forEach(achievement => {
    const isClaimed = claimed.some(a => a.id === achievement.id);
    const dependencyMet = !achievement.dependency || claimed.some(a => a.id === achievement.dependency);

    // Skip rendering if the dependency is not met and the achievement is not claimed
    if (!dependencyMet && !isClaimed) {
      return;
    }

    const div = document.createElement("div");
    div.className = "achievement";
    div.innerHTML = `
      <img src="images/${achievement.level}.png" class="${dependencyMet ? 'active' : ''}" alt="${achievement.level}" title="${achievement.description}">
      <h3>${achievement.title}</h3>
      ${isClaimed ? '<span class="corner-stat">★</span>' : `<button class="button" ${!dependencyMet ? "disabled" : ""}>Claim</button>`}
    `;

    const button = div.querySelector(".button");
    if (button) {
      button.addEventListener("click", () => claimAchievement(achievement));
    }

    container.appendChild(div);
  });
  updateClaimedPercentage();
}

function claimAchievement(achievement) {
  if (confirm(`Do you want to claim ${achievement.title}?`)) {
    const claimed = loadClaimedAchievements();
    claimed.push({ id: achievement.id, date: new Date().toISOString().split("T")[0] });
    saveClaimedAchievements(claimed);
    renderAchievements();
  }
}

function updateClaimedPercentage() {
  const achievements = loadAchievements();
  const claimed = loadClaimedAchievements();
  const percentage = achievements.length > 0 ? Math.floor((claimed.length / achievements.length) * 100) : 0;
  document.getElementById("percentage").innerText = `${percentage}% Claimed`;
}

function restartAchievements() {
  if (confirm("Do you really want to restart?")) {
    localStorage.removeItem(CLAIMED_STORAGE_KEY);
    renderAchievements();
  }
}

function loadNewAchievements() {
  const fileInput = document.getElementById("achievement-file");
  fileInput.click();

  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const achievements = JSON.parse(reader.result);
        saveAchievements(achievements);
        renderAchievements();
      };
      reader.readAsText(file);
    }
  };
}

document.getElementById("reload").addEventListener("click", loadNewAchievements);
document.getElementById("restart").addEventListener("click", restartAchievements);

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
    saveAchievements([]);
  }
  renderAchievements();
});