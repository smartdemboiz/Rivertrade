"use client";

import { useState } from "react";

export default function DashboardProfile() {
  const [saved, setSaved] = useState(false);

  return (
    <section className="dashboard-profile" aria-labelledby="profile-title">
      <h2 id="profile-title">Profile</h2>
      <form className="dashboard-profile-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
        <label htmlFor="profile-name">Full name<input id="profile-name" placeholder="Your full name" /></label>
        <label htmlFor="profile-email">Email address<input id="profile-email" type="email" placeholder="you@example.com" /></label>
        <label htmlFor="profile-phone">Phone number<input id="profile-phone" type="tel" placeholder="Your phone number" /></label>
        <button type="submit">Save changes</button>
        {saved && <p role="status">Profile changes saved.</p>}
      </form>
    </section>
  );
}
