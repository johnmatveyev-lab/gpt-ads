"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/platform/logout", { method: "POST" });
    window.location.href = "/platform/login";
  }

  return (
    <button type="button" className="platformGhostButton" onClick={logout}>
      Sign out
    </button>
  );
}
