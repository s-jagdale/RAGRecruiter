export function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRoleLabel(role) {
  if (!role) return "";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function trackLabel(track) {
  const map = {
    technical: "Technical",
    soft_skills: "Soft Skills",
    behavioral: "Behavioral",
    mixed: "Mixed / Full Prep",
  };
  return map[track] || formatRoleLabel(track);
}

export function averageScore(scores = []) {
  if (!scores.length) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}
