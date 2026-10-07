(() => {
  const profilesKey = "myOnlineGamesProfiles";
  const activeProfileKey = "myOnlineGamesActiveProfile";
  const unlockedProfileKey = "myOnlineGamesUnlockedProfile";

  function getProfiles() {
    return JSON.parse(localStorage.getItem(profilesKey) || "{}");
  }

  function getActiveProfileName() {
    return localStorage.getItem(activeProfileKey);
  }

  async function hashPassword(name, password) {
    const bytes = new TextEncoder().encode(`${name}:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function createProfile(name, passwordHash) {
    const profiles = getProfiles();
    profiles[name] ||= { games: {} };
    profiles[name].passwordHash = passwordHash;
    localStorage.setItem(profilesKey, JSON.stringify(profiles));
    localStorage.setItem(activeProfileKey, name);
    sessionStorage.setItem(unlockedProfileKey, name);
  }

  function unlockProfile(name, passwordHash) {
    const profile = getProfiles()[name];
    if (!profile || profile.passwordHash !== passwordHash) {
      return false;
    }
    localStorage.setItem(activeProfileKey, name);
    sessionStorage.setItem(unlockedProfileKey, name);
    return true;
  }

  function isUnlocked() {
    const name = getActiveProfileName();
    return name && sessionStorage.getItem(unlockedProfileKey) === name;
  }

  function getGame(gameId, defaults) {
    const name = getActiveProfileName();
    if (!isUnlocked()) {
      return { ...defaults };
    }
    const profiles = getProfiles();
    profiles[name] ||= { games: {} };
    profiles[name].games[gameId] ||= { ...defaults };
    localStorage.setItem(profilesKey, JSON.stringify(profiles));
    return profiles[name].games[gameId];
  }

  function saveGame(gameId, progress) {
    const name = getActiveProfileName();
    if (!isUnlocked()) {
      return false;
    }
    const profiles = getProfiles();
    profiles[name] ||= { games: {} };
    profiles[name].games[gameId] = progress;
    localStorage.setItem(profilesKey, JSON.stringify(profiles));
    return true;
  }

  window.GameProfiles = { createProfile, getActiveProfileName, getGame, getProfiles, hashPassword, isUnlocked, saveGame, unlockProfile };
})();
