"use client";

import { useEffect, useMemo, useState } from "react";

const navItems = [
  ["⌂", "Home"], ["♙", "Profile"], ["◇", "BlockSpace Plus"], ["▱", "Messages"],
  ["♧", "Friends"], ["♟", "Avatar"], ["▣", "Inventory"], ["♙", "Sandbox"],
  ["⇆", "Trade"], ["♧", "Communities"], ["◌", "Themes"], ["♢", "Blog"],
];

const footerLinks = ["About", "Jobs", "Newsroom", "Parents", "Gift Cards", "Help", "Terms", "Accessibility", "Privacy", "Privacy Choices", "Sitemap"];

const experiences = [
  { title: "Neon City", type: "Roleplay", players: "18.4K", description: "Build a life in a bright open city.", creator: "NovaWorks" },
  { title: "Skybound", type: "Adventure", players: "14.1K", description: "Explore floating islands and hidden ruins.", creator: "CloudPeak" },
  { title: "Block Builder", type: "Building", players: "11.8K", description: "Design your own place and invite friends.", creator: "BrickLab" },
  { title: "Drift District", type: "Racing", players: "9.6K", description: "Race through neon streets and mountain roads.", creator: "ApexForge" },
  { title: "Mystery Manor", type: "Mystery", players: "7.3K", description: "Search the mansion before time runs out.", creator: "NightKey" },
  { title: "Pixel Pets", type: "Collection", players: "6.9K", description: "Collect, trade, and raise unusual companions.", creator: "PetByte" },
];

const pageCopy = {
  "BlockSpace Plus": ["BlockSpace Plus", "Unlock extra customization, creator tools, profile themes, and future community features."],
  "Messages": ["Messages", "Your inbox is ready for conversations with people you connect with on BlockSpace."],
  "Friends": ["Friends", "Manage your friends, follow creators, and keep up with the people you play with."],
  "Avatar": ["Avatar", "Customize your BlockSpace avatar with outfits, animations, accessories, and colors."],
  "Inventory": ["Inventory", "Everything you own can appear here: collectibles, avatar items, passes, and more."],
  "Sandbox": ["Sandbox", "Build and test your own interactive world in BlockSpace."],
  "Trade": ["Trade", "Review offers and exchange eligible collectibles with other players."],
  "Communities": ["Communities", "Join creator groups, fan spaces, and interest-based communities."],
  "Themes": ["Themes", "Choose the colors and profile style you want for your BlockSpace account."],
  "Blog": ["Blog", "Creator stories, product notes, and community highlights."],
  "Store": ["Official Store", "Browse BlockSpace merchandise and creator items. Checkout is a demo for now."],
  "About": ["About BlockSpace", "BlockSpace is an original platform concept for discovering, creating, and sharing interactive worlds."],
  "Jobs": ["Careers", "Build the tools that power BlockSpace creators, communities, and players."],
  "Newsroom": ["Newsroom", "Product announcements and BlockSpace updates."],
  "Parents": ["Parents", "Learn about privacy, controls, reporting, and safer community tools."],
  "Gift Cards": ["Gift Cards", "Gift cards are a demo feature and do not process real payments."],
  "Help": ["Help Center", "Find guidance for accounts, profiles, worlds, inventory, and communities."],
  "Terms": ["Terms", "Placeholder terms for the BlockSpace concept."],
  "Accessibility": ["Accessibility", "BlockSpace uses readable contrast, keyboard-friendly controls, and responsive layouts."],
  "Privacy": ["Privacy", "This frontend demo stores account preferences locally in your browser."],
  "Privacy Choices": ["Privacy Choices", "Manage local demo preferences."],
  "Sitemap": ["Sitemap", "Explore every major area of BlockSpace."],
};

function VerificationBadge({ small = false }) {
  return <span className={small ? "verificationBadge small" : "verificationBadge"} aria-label="Verified">✓</span>;
}

function Icon({ glyph }) { return <span className="navIcon" aria-hidden="true">{glyph}</span>; }

function CardArt({ index }) {
  return <div className={`cardArt art${index % 6}`}><span className="artGrid" /><span className="artOrb" /><span className="artCube">◆</span></div>;
}

function getSavedProfile() {
  try { return JSON.parse(localStorage.getItem("blockspace_profile") || "null"); } catch { return null; }
}

export default function Home() {
  const [active, setActive] = useState("Home");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState(false);
  const [verifiedCreators, setVerifiedCreators] = useState([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ username: "", subName: "" });
  const [profileTab, setProfileTab] = useState("About");
  const [modal, setModal] = useState(null);
  const [theme, setTheme] = useState("Dark");

  useEffect(() => {
    setProfile(getSavedProfile());
    try { setVerifiedCreators(JSON.parse(localStorage.getItem("blockspace_verified_creators") || "[]")); } catch { setVerifiedCreators([]); }
    try { setTheme(localStorage.getItem("blockspace_theme") || "Dark"); } catch {}
  }, []);

  function notify(message) {
    setToast(message);
    window.clearTimeout(window.__blockspaceToast);
    window.__blockspaceToast = window.setTimeout(() => setToast(""), 2200);
  }

  function navigate(label) {
    setActive(label);
    setQuery("");
    setProfileTab("About");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveProfile(event) {
    event.preventDefault();
    const username = form.username.trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
    const subName = form.subName.trim().slice(0, 30);
    if (!username || username.length < 3) { notify("Username must be at least 3 characters."); return; }
    if (!subName) { notify("Please enter a display name."); return; }
    const next = { username, subName };
    localStorage.setItem("blockspace_profile", JSON.stringify(next));
    setProfile(next);
    setAuthOpen(false);
    setEditOpen(false);
    notify("Profile saved.");
  }

  function openSignIn() {
    setForm(profile ? { username: profile.username, subName: profile.subName } : { username: "", subName: "" });
    if (profile) setEditOpen(true); else setAuthOpen(true);
  }

  function signOut() {
    localStorage.removeItem("blockspace_profile");
    setProfile(null);
    navigate("Home");
    notify("Signed out.");
  }

  function toggleVerification(creator) {
    setVerifiedCreators((current) => {
      const next = current.includes(creator) ? current.filter((name) => name !== creator) : [...current, creator];
      localStorage.setItem("blockspace_verified_creators", JSON.stringify(next));
      notify(next.includes(creator) ? `${creator} is now verified.` : `${creator} verification removed.`);
      return next;
    });
  }

  function setLocalTheme(nextTheme) {
    setTheme(nextTheme);
    localStorage.setItem("blockspace_theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme.toLowerCase();
    notify(`${nextTheme} theme saved.`);
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return experiences;
    return experiences.filter((item) => `${item.title} ${item.type} ${item.description} ${item.creator}`.toLowerCase().includes(q));
  }, [query]);

  const profileName = profile?.subName || "Guest";
  const username = profile?.username || "guest";
  const pageData = pageCopy[active];

  function doSearch() {
    const clean = query.trim();
    if (!clean) return notify("Type something to search.");
    if (active !== "Home") setActive("Home");
    notify(`Showing results for “${clean}”.`);
    setTimeout(() => document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" }), 20);
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brandRow"><div className="brandMark">B</div><div className="brandName">BLOCKSPACE</div></div>

        <button className="profileMini" onClick={() => navigate("Profile")} aria-label="Open profile">
          <div className="avatarCircle">{profile ? profile.subName.slice(0,2).toUpperCase() : "BS"}</div>
          <div className="profileText"><strong>{profileName}</strong><span>@{username}</span></div>
        </button>

        <nav className="mainNav" aria-label="Main navigation">
          {navItems.map(([glyph, label]) => <button key={label} className={`navItem ${active === label ? "selected" : ""}`} onClick={() => navigate(label)}><Icon glyph={glyph} /><span>{label}</span></button>)}
        </nav>

        <div className="sidePromo"><div className="promoIcon">◆</div><strong>More features. More worlds.</strong><p>Unlock extra customization and creator tools.</p><button onClick={() => navigate("BlockSpace Plus")}>Explore Plus</button></div>

        <div className="sidebarBottom">
          <button className="simpleLink" onClick={() => navigate("Store")}><span>▣</span> Official Store</button>
          <button className="simpleLink" onClick={() => navigate("Gift Cards")}><span>▤</span> Buy Gift Cards</button>
          <button className="simpleLink" onClick={() => setAdminOpen(true)}><span>✓</span> Verification</button>
          {profile ? <button className="simpleLink signOut" onClick={signOut}><span>↪</span> Sign Out</button> : <button className="simpleLink signIn" onClick={openSignIn}><span>→</span> Sign In</button>}
        </div>
      </aside>

      <section className="pageArea">
        <div className="scene">
          <div className="scenePattern" /><div className="sceneGlow glowOne" /><div className="sceneGlow glowTwo" />
          <div className="contentPanel">
            <header className="topBar">
              <div><div className="crumb">BLOCKSPACE</div><h1>{active === "Store" ? "Official Store" : active}</h1></div>
              <div className="topActions">
                <label className="searchBox"><button type="button" onClick={doSearch} aria-label="Search">⌕</button><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Search" /></label>
                <button className={`topIcon ${liked ? "liked" : ""}`} aria-label="Favorite site" onClick={() => { setLiked((v) => !v); notify(!liked ? "Added to favorites." : "Removed from favorites."); }}>{liked ? "♥" : "♡"}</button>
                <button className="topAvatar" onClick={() => navigate("Profile")} aria-label="Open profile">{profile ? profile.subName.slice(0,2).toUpperCase() : "BS"}</button>
              </div>
            </header>

            {active === "Home" && (
              <>
                <section className="heroStrip"><div className="heroCopy"><span className="heroEyebrow">DISCOVER SOMETHING NEW</span><h2>Find your next favorite world.</h2><p>Play community-made experiences, meet people, and make something of your own.</p><div className="heroButtons"><button className="primaryButton" onClick={() => document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" })}>Explore experiences</button><button className="secondaryButton" onClick={() => navigate("Sandbox")}>Open Sandbox</button></div></div><div className="heroBadge"><div className="floatingCube">◆</div><strong>BUILD • PLAY • SHARE</strong><span>All in one place.</span></div></section>
                <section id="experiences" className="experienceSection"><div className="sectionHeader"><div><h3>Featured experiences</h3><p>Popular worlds from BlockSpace creators.</p></div><button className="viewAll" onClick={() => { setQuery(""); notify("Showing all featured experiences."); }}>View all</button></div>
                  {visible.length ? <div className="experienceGrid">{visible.map((item, index) => { const verified = verifiedCreators.includes(item.creator); return <article className="experienceCard" key={item.title}><CardArt index={index} /><div className="cardBody"><div className="titleLine"><h4>{item.title}</h4>{verified && <VerificationBadge small />}</div><div className="metaLine"><span>{item.type}</span><span>•</span><span>{item.players} playing</span></div><p>{item.description}</p><div className="creatorLine"><span>by</span><button className="creatorButton" onClick={() => { setModal({ type: "creator", name: item.creator }); }}>{item.creator}</button>{verified && <span className="verifiedWord">Verified</span>}</div><button className="playButton" onClick={() => { setModal({ type: "launch", title: item.title }); }}>Play</button></div></article>; })}</div> : <div className="emptyState">No worlds matched “{query}”. <button onClick={() => setQuery("")}>Clear search</button></div>}
                </section>
                <section className="creatorStrip"><div><span className="heroEyebrow">FOR CREATORS</span><h3>Create your own corner of BlockSpace.</h3><p>Prototype ideas, publish experiences, and grow a community around your work.</p></div><button className="primaryButton" onClick={() => navigate("Sandbox")}>Start creating</button></section>
              </>
            )}

            {active === "Profile" && (
              <section className="profileShell">
                <div className="profileCover"><div className="coverPattern" /><div className="coverCharacter" aria-hidden="true"><div className="characterHead" /><div className="characterBody" /><div className="characterLeg one" /><div className="characterLeg two" /></div><button className="coverAction" onClick={() => setModal({ type: "threeD" })}>3D</button></div>
                <div className="profileMain">
                  <div className="profileTop"><div className="profileAvatarBig">{profile ? profile.subName.slice(0,2).toUpperCase() : "BS"}</div><div className="profileIdentity"><div className="profileNameRow"><h2>{profileName}</h2>{profile && <span className="handleCheck" aria-label="Account confirmed">✓</span>}</div><p>@{username}</p><button className={`likePill ${liked ? "active" : ""}`} onClick={() => { setLiked((v) => !v); notify(!liked ? "Profile liked." : "Profile like removed."); }}>♥ <span>{liked ? "1" : "0"}</span></button></div><div className="profileActions"><button onClick={openSignIn}>{profile ? "Edit profile" : "Sign In"}</button><button onClick={() => navigate("Avatar")}>Edit avatar</button><button onClick={() => navigate("Themes")}>Edit theme</button><button onClick={() => setModal({ type: "more" })} aria-label="More profile actions">•••</button></div></div>
                  <div className="profilePills"><button onClick={() => setModal({ type: "stat", label: "Friends", value: "0" })}>0 Friends</button><button onClick={() => setModal({ type: "stat", label: "Followers", value: "0" })}>0 Followers</button><button onClick={() => setModal({ type: "stat", label: "Following", value: "0" })}>0 Following</button></div>
                  <div className="profileBio">{profile ? `Welcome to ${profileName}'s BlockSpace profile.` : "Sign in to create your own profile."}<button onClick={openSignIn}>{profile ? "edit" : "Sign in"}</button></div>
                  <div className="tabs"><button className={profileTab === "About" ? "activeTab" : ""} onClick={() => setProfileTab("About")}>About</button><button className={profileTab === "Creations" ? "activeTab" : ""} onClick={() => setProfileTab("Creations")}>Creations</button></div>
                  {profileTab === "About" ? <section className="wearing"><h3>Currently Wearing</h3><div className="itemRow">{[["shades","BlockSpace Shades","Accessory"],["dance","Signature Dance","Animation"],["shirt","Creator Shirt","Classic Shirt"],["face","Classic Face","Face"],["hair","Brown Waves","Hair"]].map(([kind,name,type]) => <button className="wearItem" key={name} onClick={() => setModal({ type: "item", name, kind, itemType: type })}><div className={`wearArt ${kind}`}>{kind === "face" ? ":P" : kind === "hair" ? "≋" : kind === "shades" ? "◼" : kind === "dance" ? "♟" : "◆"}</div><strong>{name}</strong><span>{type}</span></button>)}</div></section> : <section className="creationsPanel"><div className="creationEmpty"><div className="creationIcon">◆</div><h3>No published creations yet</h3><p>Create your first world in Sandbox and it will appear here.</p><button className="primaryButton" onClick={() => navigate("Sandbox")}>Create a world</button></div></section>}
                </div>
              </section>
            )}

            {active !== "Home" && active !== "Profile" && pageData && (
              <section className="genericPage"><div className="genericHero"><span className="heroEyebrow">BLOCKSPACE</span><h2>{pageData[0]}</h2><p>{pageData[1]}</p><div className="genericActions">{active === "Avatar" && <button className="primaryButton" onClick={() => setModal({ type: "avatar" })}>Customize avatar</button>}{active === "Themes" && <><button className="primaryButton" onClick={() => setLocalTheme(theme === "Dark" ? "Light" : "Dark")}>{theme === "Dark" ? "Switch to light" : "Switch to dark"}</button><button className="secondaryButton" onClick={() => notify(`Current theme: ${theme}.`)}>Preview theme</button></>}{active === "Sandbox" && <button className="primaryButton" onClick={() => setModal({ type: "sandbox" })}>Create project</button>}{active === "Messages" && <button className="primaryButton" onClick={() => setModal({ type: "message" })}>Compose message</button>}{active === "Friends" && <button className="primaryButton" onClick={() => setModal({ type: "friends" })}>Find friends</button>}{active === "Inventory" && <button className="primaryButton" onClick={() => notify("Inventory refreshed.")}>Refresh inventory</button>}{active === "Trade" && <button className="primaryButton" onClick={() => setModal({ type: "trade" })}>Create trade</button>}{active === "Communities" && <button className="primaryButton" onClick={() => setModal({ type: "community" })}>Browse communities</button>}{active === "BlockSpace Plus" && <button className="primaryButton" onClick={() => setModal({ type: "plus" })}>View Plus features</button>}</div></div><div className="infoGrid"><div className="infoCard"><h3>Quick action</h3><p>Use this control to try the connected feature.</p><button className="secondaryButton" onClick={() => setModal({ type: "action", title: active })}>Open {active}</button></div><div className="infoCard"><h3>Go home</h3><p>Return to the discovery feed and browse experiences.</p><button className="primaryButton" onClick={() => navigate("Home")}>Back to Home</button></div></div></section>
            )}

            <footer className="footer"><div className="footerLinks">{footerLinks.map((link) => <button key={link} onClick={() => navigate(link)}>{link}</button>)}</div><div className="footerBottom"><span>© 2026 BlockSpace</span><span>Original platform concept.</span></div></footer>
          </div>
        </div>
      </section>

      {(authOpen || editOpen) && (
        <div className="modalBackdrop" onClick={() => { setAuthOpen(false); setEditOpen(false); }}>
          <form className="profileModal accountModal" onClick={(e) => e.stopPropagation()} onSubmit={saveProfile}>
            <button type="button" className="closeModal" onClick={() => { setAuthOpen(false); setEditOpen(false); }}>×</button>
            <div className="modalLogo">B</div><h2>{profile ? "Edit your profile" : "Create your BlockSpace account"}</h2><p>Choose the username and display name people will see.</p>
            <label>Username<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="yourusername" /></label>
            <label>Display name<input required value={form.subName} onChange={(e) => setForm({ ...form, subName: e.target.value })} placeholder="Your display name" /></label>
            <small>Username uses letters, numbers, and underscores. Your profile is saved locally in this demo.</small>
            <button className="primaryButton fullButton" type="submit">{profile ? "Save profile" : "Create account"}</button>
          </form>
        </div>
      )}

      {adminOpen && <div className="modalBackdrop" onClick={() => setAdminOpen(false)}><div className="adminModal" onClick={(e) => e.stopPropagation()}><button className="closeModal" onClick={() => setAdminOpen(false)}>×</button><span className="heroEyebrow">ADMIN TOOLS</span><h2>Verification</h2><p className="modalLead">Verification is manual. No creator receives a badge automatically.</p><div className="verificationRules"><strong>Verified badge</strong><span>Original BlockSpace blue check beside a creator name.</span></div><div className="creatorList">{[...new Set(experiences.map((item) => item.creator))].map((creator) => { const isVerified = verifiedCreators.includes(creator); return <div className="creatorRow" key={creator}><div><strong>{creator}</strong><span>Creator account</span></div><button type="button" className={`verifyToggle ${isVerified ? "on" : ""}`} onClick={() => toggleVerification(creator)}>{isVerified ? <><VerificationBadge small /> Verified</> : "Add badge"}</button></div>; })}</div><button className="secondaryButton fullButton" onClick={() => setAdminOpen(false)}>Done</button></div></div>}

      {modal && <div className="modalBackdrop" onClick={() => setModal(null)}><div className="genericModal" onClick={(e) => e.stopPropagation()}><button className="closeModal" onClick={() => setModal(null)}>×</button>
        {modal.type === "launch" && <><div className="modalLogo">▶</div><h2>Launching {modal.title}</h2><p>This demo doesn't connect to a real game client yet, but the button is fully connected.</p><button className="primaryButton fullButton" onClick={() => { setModal(null); notify(`${modal.title} launch requested.`); }}>Continue</button></>}
        {modal.type === "creator" && <><div className="modalLogo">C</div><h2>{modal.name}</h2><p>Creator profile opened. Verification is controlled manually from the Verification panel.</p><button className="primaryButton fullButton" onClick={() => { setModal(null); setAdminOpen(true); }}>Manage verification</button></>}
        {modal.type === "threeD" && <><div className="modalLogo">3D</div><h2>3D profile preview</h2><div className="previewCharacter"><div className="characterHead" /><div className="characterBody" /><div className="characterLeg one" /><div className="characterLeg two" /></div><p>Interactive 3D controls are represented by this working preview in the demo.</p><button className="primaryButton fullButton" onClick={() => setModal(null)}>Close preview</button></>}
        {modal.type === "more" && <><div className="modalLogo">•••</div><h2>Profile actions</h2><div className="actionStack"><button onClick={() => { setModal(null); openSignIn(); }}>Edit profile</button><button onClick={() => { setModal(null); setLiked((v) => !v); notify(liked ? "Profile unliked." : "Profile liked."); }}>Toggle like</button><button onClick={() => { setModal(null); notify("Profile link copied to demo clipboard."); }}>Share profile</button></div></>}
        {modal.type === "stat" && <><div className="modalLogo">0</div><h2>{modal.label}</h2><p>Your current {modal.label.toLowerCase()} count is {modal.value}.</p><button className="primaryButton fullButton" onClick={() => setModal(null)}>Done</button></>}
        {modal.type === "item" && <><div className={`modalItemArt wearArt ${modal.kind}`}>{modal.kind === "face" ? ":P" : modal.kind === "hair" ? "≋" : modal.kind === "shades" ? "◼" : modal.kind === "dance" ? "♟" : "◆"}</div><h2>{modal.name}</h2><p>Category: {modal.itemType}. This item is ready for the demo profile.</p><button className="primaryButton fullButton" onClick={() => setModal(null)}>Done</button></>}
        {modal.type === "avatar" && <><div className="modalLogo">A</div><h2>Avatar editor</h2><p>Pick a simple avatar change for the demo.</p><div className="avatarChoices"><button onClick={() => notify("Classic outfit selected.")}>Classic</button><button onClick={() => notify("Neon outfit selected.")}>Neon</button><button onClick={() => notify("Shadow outfit selected.")}>Shadow</button></div><button className="primaryButton fullButton" onClick={() => { setModal(null); navigate("Profile"); }}>Save avatar</button></>}
        {modal.type === "sandbox" && <><div className="modalLogo">+</div><h2>New project</h2><p>Choose a starter project for your new BlockSpace world.</p><div className="avatarChoices"><button onClick={() => notify("Flat world selected.")}>Flat world</button><button onClick={() => notify("City starter selected.")}>City starter</button><button onClick={() => notify("Obby starter selected.")}>Obby starter</button></div><button className="primaryButton fullButton" onClick={() => { setModal(null); notify("Project created in demo."); }}>Create</button></>}
        {modal.type === "message" && <><div className="modalLogo">✉</div><h2>New message</h2><label className="modalInputLabel">To<input placeholder="username" /></label><label className="modalInputLabel">Message<textarea placeholder="Write a message..." rows="4" /></label><button className="primaryButton fullButton" onClick={() => { setModal(null); notify("Demo message sent."); }}>Send</button></>}
        {modal.type === "friends" && <><div className="modalLogo">♧</div><h2>Find friends</h2><input className="wideInput" placeholder="Search users" /><button className="primaryButton fullButton" onClick={() => notify("Friend search submitted.")}>Search</button></>}
        {modal.type === "trade" && <><div className="modalLogo">⇆</div><h2>Create trade</h2><p>Select a partner and item to build a trade offer.</p><button className="primaryButton fullButton" onClick={() => { setModal(null); notify("Trade draft created."); }}>Start trade</button></>}
        {modal.type === "community" && <><div className="modalLogo">♧</div><h2>Communities</h2><p>Browse creator groups, game clubs, and interest spaces.</p><button className="primaryButton fullButton" onClick={() => { setModal(null); notify("Community browser opened."); }}>Browse</button></>}
        {modal.type === "plus" && <><div className="modalLogo">+</div><h2>BlockSpace Plus</h2><p>Extra profile themes, creator tools, and customization features are ready for the full platform.</p><button className="primaryButton fullButton" onClick={() => { setModal(null); notify("Plus feature preview opened."); }}>Preview</button></>}
        {modal.type === "action" && <><div className="modalLogo">B</div><h2>{modal.title}</h2><p>The {modal.title} section is connected and ready for the next full feature build.</p><button className="primaryButton fullButton" onClick={() => { setModal(null); notify(`${modal.title} action completed.`); }}>Done</button></>}
      </div></div>}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
