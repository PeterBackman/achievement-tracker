const VERSION = "0.2.0";
const LOCAL_STORAGE_KEY = "achievements";
const CLAIMED_STORAGE_KEY = "claimed";

function showCustomDialog(message, onConfirm) {
  const dialog = document.getElementById("custom-dialog");
  const dialogMessage = document.getElementById("dialog-message");
  const confirmButton = document.getElementById("dialog-confirm");
  const cancelButton = document.getElementById("dialog-cancel");

  dialogMessage.innerHTML = message; // Use innerHTML to allow italic text
  dialog.classList.remove("hidden");

  const closeDialog = () => {
    dialog.classList.add("hidden");
    confirmButton.removeEventListener("click", handleConfirm);
    cancelButton.removeEventListener("click", handleCancel);
  };

  const handleConfirm = () => {
    closeDialog();
    onConfirm();
  };

  const handleCancel = () => {
    closeDialog();
  };

  confirmButton.addEventListener("click", handleConfirm);
  cancelButton.addEventListener("click", handleCancel);
}

function displayVersion() {
  const versionElement = document.getElementById("version-number");
  if (versionElement) {
    versionElement.textContent = VERSION;
  }
}

function displayContentVersion() {
  const {version} = loadAchievements();
  const versionElement = document.getElementById("content-version");
  if (versionElement) {
    versionElement.textContent = version;
  }
}

function loadAchievements() {
  const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  if (!data) return { version: null, achievements: [] };

  return {
    version: data.version || null, // Extract the version
    achievements: data.achievements || [] // Extract the achievements
  };
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
  const {achievements} = loadAchievements();
  const claimed = loadClaimedAchievements();

  container.innerHTML = "";
  achievements.forEach(achievement => {
    const isClaimed = claimed.some(a => a.id === achievement.id);
    // Check if all dependencies are met
    const dependencyMet = !achievement.dependency || achievement.dependency.every(depId =>
      claimed.some(a => a.id === depId)
    );

    // Skip rendering if the dependency is not met and the achievement is not claimed
    if (!dependencyMet || isClaimed) {
      return;
    }

    const div = document.createElement("div");
    div.className = "achievement";
    div.innerHTML = `
      <img src="images/${achievement.level}.png" class="achievement-image" alt="${achievement.level}" title="${achievement.description}">
      <h3>${achievement.title}</h3>
      ${isClaimed ? '<span class="corner-stat">★</span>' : `<button class="button" ${!dependencyMet ? "disabled" : ""}>Erövra trofé</button>`}
    `;

    // Add a divider outside the group wrapper
    const divider = document.createElement("hr");
    div.appendChild(divider);

    // Add the group image
    if (achievement.group) {
      const groupWrapper = document.createElement("div");
      groupWrapper.className = "group-wrapper";
        
      const groupImg = document.createElement("img");
      groupImg.src = `images/${achievement.group}.png`; // Path to the group image
      groupImg.alt = achievement.group; // Alt text for accessibility
      groupImg.title = achievement.group; // Title text for accessibility
      groupImg.className = "group-image"; // Add a class for styling

      groupImg.addEventListener("click", (event) => {
        // Create a tooltip element
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = groupImg.title; 
        document.body.appendChild(tooltip);

        // Position the tooltip at the click location
        tooltip.style.left = `${event.pageX + 0}px`; // Offset by 10px to avoid overlapping the cursor
        tooltip.style.top = `${event.pageY + 20}px`;

        // Remove the tooltip after 3 seconds
        setTimeout(() => {
          tooltip.remove();
        }, 3000);
      });
        
      groupWrapper.appendChild(groupImg);
      div.appendChild(groupWrapper);
    }

    const img = div.querySelector("img.achievement-image");
    if (img) {
      img.addEventListener("click", (event) => {
        // Create a tooltip element
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = img.title; 
        document.body.appendChild(tooltip);

        // Position the tooltip at the click location
        tooltip.style.left = `${event.pageX + 0}px`; // Offset by 10px to avoid overlapping the cursor
        tooltip.style.top = `${event.pageY + 20}px`;

        // Remove the tooltip after 3 seconds
        setTimeout(() => {
          tooltip.remove();
        }, 3000);
      });
    }

    const button = div.querySelector(".button");
    if (button) {
      button.addEventListener("click", () => claimAchievement(achievement));
    }

    container.appendChild(div);
  });
  updateClaimedPercentage();
}

function claimAchievement(achievement) {
  showCustomDialog(
    `Har du uppfyllt kraven för trofén <i>${achievement.title}</i>?<br><br>${achievement.description}`,
    () => {
      const claimed = loadClaimedAchievements();
      claimed.push({ id: achievement.id, date: new Date().toISOString().split("T")[0] });
      saveClaimedAchievements(claimed);
      renderAchievements();
  }
);
}

function updateClaimedPercentage() {
  const achievements = loadAchievements().achievements;
  const claimed = loadClaimedAchievements();

  const percentage = achievements.length > 0 ? Math.floor((claimed.length / achievements.length) * 100) : 0;
  document.getElementById("percentage").innerText = `${percentage}% avklarat`;
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
        if (achievements.version && Array.isArray(achievements.achievements)) {
            saveAchievements(achievements);
            renderAchievements();
            displayContentVersion();
        } else {
            alert("Invalid achievement file format.");
        }
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
  displayVersion();
  displayContentVersion()
});