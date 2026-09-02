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
  "Messages": ["Messages", "Your inbox is ready. Start conversations from friends once messaging is connected."],
  "Friends": ["Friends", "Your friend list is ready for people you meet around BlockSpace."],
  "Avatar": ["Avatar", "Customize your BlockSpace avatar with outfits, animations, accessories, and colors."],
  "Inventory": ["Inventory", "Everything you own can appear here: collectibles, avatar items, passes, and more."],
  "Sandbox": ["Sandbox", "Prototype and build your own interactive world in BlockSpace."],
  "Trade": ["Trade", "Trade collectible items with other players once both accounts are connected."],
  "Communities": ["Communities", "Join creator groups, fan spaces, and interest-based communities."],
  "Themes": ["Themes", "Choose the colors, surfaces, and profile style you want for your BlockSpace account."],
  "Blog": ["Blog", "Creator stories, product notes, and community highlights will appear here."],
  "Store": ["Official Store", "Browse BlockSpace merchandise and creator items. Payments are not connected in this demo."],
  "About": ["About BlockSpace", "BlockSpace is an original platform concept for discovering, creating, and sharing interactive worlds."],
  "Jobs": ["Careers", "Build the tools that power BlockSpace creators, communities, and players."],
  "Newsroom": ["Newsroom", "Product announcements and BlockSpace updates will appear here."],
  "Parents": ["Parents", "Learn about privacy, controls, reporting, and safer community tools."],
  "Gift Cards": ["Gift Cards", "Gift cards are not connected to a real payment system in this demo."],
  "Help": ["Help Center", "Find guidance for accounts, profiles, worlds, inventory, and communities."],
  "Terms": ["Terms", "This demo contains placeholder terms for the BlockSpace concept."],
  "Accessibility": ["Accessibility", "BlockSpace uses readable contrast, keyboard-friendly controls, and responsive layouts."],
  "Privacy": ["Privacy", "This frontend demo stores account preferences locally in your browser."],
  "Privacy Choices": ["Privacy Choices", "Change local demo preferences here. No third-party ad controls are connected."],
  "Sitemap": ["Sitemap", "Home, Profile, Plus, Messages, Friends, Avatar, Inventory, Sandbox, Trade, Communities, Themes, and Blog."],
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

  useEffect(() => {
    setProfile(getSavedProfile());
    try { setVerifiedCreators(JSON.parse(localStorage.getItem("blockspace_verified_creators") || "[]")); } catch { setVerifiedCreators([]); }
  }, []);

  function notify(message) {
    setToast(message);
    window.clearTimeout(window.__blockspaceToast);
    window.__blockspaceToast = window.setTimeout(() => setToast(""), 2200);
  }

  function navigate(label) {
    setActive(label);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveProfile(event) {
    event.preventDefault();
    const username = form.username.trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
    const subName = form.subName.trim().slice(0, 30);
    if (!username || username.length < 3) { notify("Username must be at least 3 characters."); return; }
    if (!subName) { notify("Please enter a sub name."); return; }
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return experiences;
    return experiences.filter((item) => `${item.title} ${item.type} ${item.description} ${item.creator}`.toLowerCase().includes(q));
  }, [query]);

  const profileName = profile?.subName || "Guest";
  const username = profile?.username || "guest";
  const pageData = pageCopy[active];

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brandRow"><div className="brandMark">B</div><div className="brandName">BLOCKSPACE</div></div>

        <button className="profileMini" onClick={() => navigate("Profile")}>
          <div className="avatarCircle">{profile ? profile.subName.slice(0,2).toUpperCase() : "BS"}</div>
          <div className="profileText"><strong>{profileName}</strong><span>@{username}</span></div>
        </button>

        <nav className="mainNav">
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
                <label className="searchBox"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && notify(query ? `Searching for “${query}”` : "Type something to search.")} placeholder="Search" /></label>
                <button className={`topIcon ${liked ? "liked" : ""}`} aria-label="Favorite" onClick={() => { setLiked((v) => !v); notify(!liked ? "Added to favorites." : "Removed from favorites."); }}>{liked ? "♥" : "♡"}</button>
                <button className="topAvatar" onClick={() => navigate("Profile")} aria-label="Open profile">{profile ? profile.subName.slice(0,2).toUpperCase() : "BS"}</button>
              </div>
            </header>

            {active === "Home" && (
              <>
                <section className="heroStrip"><div className="heroCopy"><span className="heroEyebrow">DISCOVER SOMETHING NEW</span><h2>Find your next favorite world.</h2><p>Play community-made experiences, meet people, and make something of your own.</p><div className="heroButtons"><button className="primaryButton" onClick={() => document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" })}>Explore experiences</button><button className="secondaryButton" onClick={() => navigate("Sandbox")}>Open Sandbox</button></div></div><div className="heroBadge"><div className="floatingCube">◆</div><strong>BUILD • PLAY • SHARE</strong><span>All in one place.</span></div></section>
                <section id="experiences" className="experienceSection"><div className="sectionHeader"><div><h3>Featured experiences</h3><p>Popular worlds from BlockSpace creators.</p></div><button className="viewAll" onClick={() => notify(`${visible.length} experiences shown.`)}>View all</button></div>
                  {visible.length ? <div className="experienceGrid">{visible.map((item, index) => { const verified = verifiedCreators.includes(item.creator); return <article className="experienceCard" key={item.title}><CardArt index={index} /><div className="cardBody"><div className="titleLine"><h4>{item.title}</h4>{verified && <VerificationBadge small />}</div><div className="metaLine"><span>{item.type}</span><span>•</span><span>{item.players} playing</span></div><p>{item.description}</p><div className="creatorLine"><span>by</span><button className="creatorButton" onClick={() => notify(`${item.creator} creator profile opened.`)}>{item.creator}</button>{verified && <span className="verifiedWord">Verified</span>}</div><button className="playButton" onClick={() => notify(`${item.title} is ready to launch in the demo.`)}>Play</button></div></article>; })}</div> : <div className="emptyState">No worlds matched “{query}”. <button onClick={() => setQuery("")}>Clear search</button></div>}
                </section>
                <section className="creatorStrip"><div><span className="heroEyebrow">FOR CREATORS</span><h3>Create your own corner of BlockSpace.</h3><p>Prototype ideas, publish experiences, and grow a community around your work.</p></div><button className="primaryButton" onClick={() => navigate("Sandbox")}>Start creating</button></section>
              </>
            )}

            {active === "Profile" && (
              <section className="profileShell">
                <div className="profileCover"><div className="coverPattern" /><div className="coverCharacter"><div className="characterHead" /><div className="characterBody" /><div className="characterLeg one" /><div className="characterLeg two" /></div><button className="coverAction" onClick={() => notify("3D profile preview coming next.")}>3D</button></div>
                <div className="profileMain">
                  <div className="profileTop"><div className="profileAvatarBig">{profile ? profile.subName.slice(0,2).toUpperCase() : "BS"}</div><div className="profileIdentity"><div className="profileNameRow"><h2>{profileName}</h2>{profile && <span className="handleCheck">✓</span>}</div><p>@{username}</p><div className="likePill">♥ <span>0</span></div></div><div className="profileActions"><button onClick={openSignIn}>{profile ? "Edit profile" : "Sign In"}</button><button onClick={() => navigate("Avatar")}>Edit avatar</button><button onClick={() => navigate("Themes")}>Edit Theme</button><button onClick={() => notify("More profile actions coming soon.")}>•••</button></div></div>
                  <div className="profilePills"><span>0 Friends</span><span>0 Followers</span><span>0 Following</span></div>
                  <div className="profileBio">{profile ? `Welcome to ${profileName}'s BlockSpace profile.` : "Sign in to create your own profile."}<button onClick={openSignIn}>{profile ? "edit" : "Sign in"}</button></div>
                  <div className="tabs"><button className="activeTab">About</button><button onClick={() => notify("Creations tab selected.")}>Creations</button></div>
                  <section className="wearing"><h3>Currently Wearing</h3><div className="itemRow"><div className="wearItem"><div className="wearArt shades">◼</div><strong>BlockSpace Shades</strong><span>Accessory</span></div><div className="wearItem"><div className="wearArt dance">♟</div><strong>Signature Dance</strong><span>Animation</span></div><div className="wearItem"><div className="wearArt shirt">◆</div><strong>Creator Shirt</strong><span>Classic Shirt</span></div><div className="wearItem"><div className="wearArt face">:P</div><strong>Classic Face</strong><span>Face</span></div><div className="wearItem"><div className="wearArt hair">≋</div><strong>Brown Waves</strong><span>Hair</span></div></div></section>
                </div>
              </section>
            )}

            {active !== "Home" && active !== "Profile" && pageData && (
              <section className="genericPage"><div className="genericHero"><span className="heroEyebrow">BLOCKSPACE</span><h2>{pageData[0]}</h2><p>{pageData[1]}</p>{active === "Avatar" && <button className="primaryButton" onClick={() => navigate("Profile")}>View my profile</button>}{active === "Themes" && <button className="primaryButton" onClick={() => notify("Theme saved locally.")}>Save Theme</button>}{active === "Sandbox" && <button className="primaryButton" onClick={() => notify("Sandbox project created.")}>Create project</button>}</div><div className="infoGrid"><div className="infoCard"><h3>Ready for the full build</h3><p>This area is connected and ready to expand into a complete BlockSpace feature.</p><button className="secondaryButton" onClick={() => notify(`${pageData[0]} is connected.`)}>Test button</button></div><div className="infoCard"><h3>Go home</h3><p>Return to the discovery feed and browse experiences.</p><button className="primaryButton" onClick={() => navigate("Home")}>Back to Home</button></div></div></section>
            )}

            <footer className="footer"><div className="footerLinks">{footerLinks.map((link) => <button key={link} onClick={() => navigate(link)}>{link}</button>)}</div><div className="footerBottom"><span>© 2026 BlockSpace</span><span>Original platform concept.</span></div></footer>
          </div>
        </div>
      </section>

      {(authOpen || editOpen) && (
        <div className="modalBackdrop" onClick={() => { setAuthOpen(false); setEditOpen(false); }}>
          <form className="profileModal accountModal" onClick={(e) => e.stopPropagation()} onSubmit={saveProfile}>
            <button type="button" className="closeModal" onClick={() => { setAuthOpen(false); setEditOpen(false); }}>×</button>
            <div className="modalLogo">B</div><h2>{profile ? "Edit your profile" : "Create your BlockSpace account"}</h2><p>Choose the name people will see on your profile.</p>
            <label>Username<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="yourusername" /></label>
            <label>Sub name<input required value={form.subName} onChange={(e) => setForm({ ...form, subName: e.target.value })} placeholder="Your display name" /></label>
            <small>Username uses letters, numbers, and underscores. This demo saves your profile locally in your browser.</small>
            <button className="primaryButton fullButton" type="submit">{profile ? "Save profile" : "Sign in & continue"}</button>
          </form>
        </div>
      )}

      {adminOpen && <div className="modalBackdrop" onClick={() => setAdminOpen(false)}><div className="adminModal" onClick={(e) => e.stopPropagation()}><button className="closeModal" onClick={() => setAdminOpen(false)}>×</button><span className="heroEyebrow">ADMIN TOOLS</span><h2>Verification</h2><p className="modalLead">Verification is manual. No creator gets a badge automatically.</p><div className="verificationRules"><strong>Verified badge</strong><span>Original BlockSpace blue check beside a creator name.</span></div><div className="creatorList">{[...new Set(experiences.map((item) => item.creator))].map((creator) => { const isVerified = verifiedCreators.includes(creator); return <div className="creatorRow" key={creator}><div><strong>{creator}</strong><span>Creator account</span></div><button className={`verifyToggle ${isVerified ? "on" : ""}`} onClick={() => toggleVerification(creator)}>{isVerified ? <><VerificationBadge small /> Verified</> : "Add badge"}</button></div>; })}</div><button className="secondaryButton fullButton" onClick={() => setAdminOpen(false)}>Done</button></div></div>}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
