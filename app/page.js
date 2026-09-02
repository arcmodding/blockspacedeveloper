"use client";

import { useEffect, useMemo, useState } from "react";

const navItems = [
  ["⌂", "Home"], ["♙", "Profile"], ["◇", "BlockSpace Plus"], ["▱", "Messages"],
  ["♧", "Friends"], ["♟", "Avatar"], ["▣", "Inventory"], ["♙", "Sandbox"],
  ["⇆", "Trade"], ["♧", "Communities"], ["◌", "Themes"], ["♢", "Blog"],
];
const footerLinks = ["About", "Jobs", "Newsroom", "Parents", "Gift Cards", "Help", "Terms", "Accessibility", "Privacy", "Privacy Choices", "Sitemap"];
const pageCopy = {
  "BlockSpace Plus": ["BlockSpace Plus", "Unlock extra customization, creator tools, profile themes, and future community features."],
  "Messages": ["Messages", "Your inbox is ready. Connect with other players from their profiles."],
  "Friends": ["Friends", "Your friends and followers will appear here as you connect your BlockSpace profile."],
  "Avatar": ["Avatar", "Customize your BlockSpace profile appearance."],
  "Inventory": ["Inventory", "Your saved BlockSpace items and favorites will appear here."],
  "Sandbox": ["Sandbox", "Build and test your own BlockSpace concepts."],
  "Trade": ["Trade", "Trading tools can be connected to your BlockSpace account here."],
  "Communities": ["Communities", "Discover groups and communities built around your favorite experiences."],
  "Themes": ["Themes", "Choose a surface style and save it locally to your account."],
  "Blog": ["Blog", "Creator stories and BlockSpace updates."],
  "Store": ["Official Store", "Browse BlockSpace merchandise and creator items."],
  "About": ["About BlockSpace", "BlockSpace is an original discovery interface for interactive experiences."],
  "Jobs": ["Careers", "Build tools for creators, communities, and players."],
  "Newsroom": ["Newsroom", "Announcements and platform updates."],
  "Parents": ["Parents", "Safety, privacy, and account controls."],
  "Gift Cards": ["Gift Cards", "Gift-card features can be connected here later."],
  "Help": ["Help Center", "Guidance for accounts, profiles, experiences, and communities."],
  "Terms": ["Terms", "Placeholder terms for the BlockSpace concept."],
  "Accessibility": ["Accessibility", "Accessible contrast, focus states, and keyboard-friendly controls."],
  "Privacy": ["Privacy", "Local profile preferences are stored in your browser in this demo."],
  "Privacy Choices": ["Privacy Choices", "Manage local demo preferences."],
  "Sitemap": ["Sitemap", "Navigate every major BlockSpace section from one page."],
};

function VerificationBadge({ small = false }) {
  return <img className={`verificationImg ${small ? "small" : ""}`} src="/verification-badge.png" alt="Verified" />;
}
function Icon({ glyph }) { return <span className="navIcon" aria-hidden="true">{glyph}</span>; }
function getSavedProfile() { try { return JSON.parse(localStorage.getItem("blockspace_profile") || "null"); } catch { return null; } }
function formatCount(n) { if (n >= 1_000_000_000) return `${(n/1_000_000_000).toFixed(1)}B`; if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`; if (n >= 1_000) return `${(n/1_000).toFixed(1)}K`; return String(n ?? 0); }

export default function Home() {
  const [active, setActive] = useState("Home");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState(false);
  const [games, setGames] = useState([]);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameError, setGameError] = useState("");
  const [verifiedCreators, setVerifiedCreators] = useState([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ username: "", subName: "" });
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    setProfile(getSavedProfile());
    try { setVerifiedCreators(JSON.parse(localStorage.getItem("blockspace_verified_creators") || "[]")); } catch { setVerifiedCreators([]); }
    try { setTheme(localStorage.getItem("blockspace_theme") || "dark"); } catch {}
    loadGames();
    const timer = setInterval(loadGames, 30000);
    return () => clearInterval(timer);
  }, []);

  async function loadGames() {
    setGameLoading(true);
    try {
      const res = await fetch("/api/roblox/games", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load games");
      setGames(json.data || []); setGameError("");
    } catch (e) { setGameError(e.message); }
    finally { setGameLoading(false); }
  }
  function notify(message) { setToast(message); clearTimeout(window.__blockspaceToast); window.__blockspaceToast = setTimeout(() => setToast(""), 2400); }
  function navigate(label) { setActive(label); setQuery(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function openGame(game) { window.open(game.url, "_blank", "noopener,noreferrer"); }
  function saveProfile(event) {
    event.preventDefault();
    const username = form.username.trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
    const subName = form.subName.trim().slice(0, 30);
    if (username.length < 3) return notify("Username must be at least 3 characters.");
    if (!subName) return notify("Please enter a display name.");
    const next = { username, subName };
    localStorage.setItem("blockspace_profile", JSON.stringify(next)); setProfile(next); setAuthOpen(false); setEditOpen(false); notify("Profile saved.");
  }
  function openSignIn() { setForm(profile ? { username: profile.username, subName: profile.subName } : { username: "", subName: "" }); profile ? setEditOpen(true) : setAuthOpen(true); }
  function signOut() { localStorage.removeItem("blockspace_profile"); setProfile(null); navigate("Home"); notify("Signed out."); }
  function toggleVerification(creator) { setVerifiedCreators(current => { const next = current.includes(creator) ? current.filter(x => x !== creator) : [...current, creator]; localStorage.setItem("blockspace_verified_creators", JSON.stringify(next)); notify(next.includes(creator) ? `${creator} verified.` : `${creator} badge removed.`); return next; }); }
  function changeTheme(name) { setTheme(name); localStorage.setItem("blockspace_theme", name); document.documentElement.dataset.theme = name; notify(`${name[0].toUpperCase()+name.slice(1)} theme applied.`); }

  const visible = useMemo(() => { const q=query.trim().toLowerCase(); return !q ? games : games.filter(g => `${g.name} ${g.creator} ${g.genre} ${g.description}`.toLowerCase().includes(q)); }, [games,query]);
  const profileName = profile?.subName || "Guest";
  const username = profile?.username || "guest";
  const pageData = pageCopy[active];
  const creators = [...new Set(games.map(g => g.creator).filter(Boolean))];

  return <main className="shell">
    <aside className="sidebar">
      <div className="brandRow"><div className="brandMark">B</div><div className="brandName">BLOCKSPACE</div></div>
      <button className="profileMini" onClick={() => navigate("Profile")}><div className="avatarCircle">{profile ? profile.subName.slice(0,2).toUpperCase() : "BS"}</div><div className="profileText"><strong>{profileName}</strong><span>@{username}</span></div></button>
      <nav className="mainNav">{navItems.map(([glyph,label]) => <button key={label} className={`navItem ${active===label?"selected":""}`} onClick={()=>navigate(label)}><Icon glyph={glyph}/><span>{label}</span></button>)}</nav>
      <div className="sidePromo"><div className="promoIcon">◆</div><strong>More features. More worlds.</strong><p>Unlock customization and creator tools.</p><button onClick={()=>navigate("BlockSpace Plus")}>Explore Plus</button></div>
      <div className="sidebarBottom"><button className="simpleLink" onClick={()=>navigate("Store")}><span>▣</span> Official Store</button><button className="simpleLink" onClick={()=>navigate("Gift Cards")}><span>▤</span> Buy Gift Cards</button><button className="simpleLink" onClick={()=>setAdminOpen(true)}><span>✓</span> Verification</button>{profile?<button className="simpleLink signOut" onClick={signOut}><span>↪</span> Sign Out</button>:<button className="simpleLink signIn" onClick={openSignIn}><span>→</span> Sign In</button>}</div>
    </aside>

    <section className="pageArea"><div className="scene"><div className="scenePattern"/><div className="sceneGlow glowOne"/><div className="sceneGlow glowTwo"/><div className="contentPanel">
      <header className="topBar"><div><div className="crumb">BLOCKSPACE</div><h1>{active === "Store" ? "Official Store" : active}</h1></div><div className="topActions"><label className="searchBox"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search real Roblox experiences" onKeyDown={e=>e.key==="Enter"&&notify(query?`Showing matches for “${query}”`:"Type a game name.")}/></label><button className={`topIcon ${liked?"liked":""}`} onClick={()=>{setLiked(v=>!v);notify(!liked?"Added to favorites.":"Removed from favorites.")}}>{liked?"♥":"♡"}</button><button className="topAvatar" onClick={()=>navigate("Profile")}>{profile?profile.subName.slice(0,2).toUpperCase():"BS"}</button></div></header>

      {active === "Home" && <>
        <section className="heroStrip"><div className="heroCopy"><span className="heroEyebrow">REAL ROBLOX EXPERIENCES</span><h2>Find your next favorite world.</h2><p>Browse real Roblox experiences here. Player counts refresh from Roblox's public game data, and Play opens the experience on Roblox.</p><div className="heroButtons"><button className="primaryButton" onClick={()=>document.getElementById("experiences")?.scrollIntoView({behavior:"smooth"})}>Explore experiences</button><button className="secondaryButton" onClick={()=>loadGames()}>Refresh player counts</button></div></div><div className="heroBadge"><div className="floatingCube">◆</div><strong>REAL-TIME DATA</strong><span>Refreshes every 30 seconds.</span></div></section>
        <section id="experiences" className="experienceSection"><div className="sectionHeader"><div><h3>Popular on Roblox</h3><p>Real game data loaded through BlockSpace's server-side proxy.</p></div><button className="viewAll" onClick={()=>notify(`${visible.length} real experiences shown.`)}>View all</button></div>
          {gameLoading && !games.length ? <div className="loadingState">Loading real Roblox experiences…</div> : gameError && !games.length ? <div className="emptyState">Could not load Roblox data. <button onClick={loadGames}>Try again</button></div> : visible.length ? <div className="experienceGrid">{visible.map((game,index)=>{const verified=verifiedCreators.includes(game.creator);return <article className="experienceCard" key={game.universeId}><button className="cardImageButton" onClick={()=>openGame(game)} title={`Open ${game.name} on Roblox`}>{game.icon?<img className="gameIcon" src={game.icon} alt=""/>:<div className={`cardArt art${index%6}`}><span className="artGrid"/><span className="artOrb"/><span className="artCube">◆</span></div>}</button><div className="cardBody"><div className="titleLine"><button className="gameTitleButton" onClick={()=>openGame(game)}>{game.name}</button>{verified&&<VerificationBadge small/>}</div><div className="metaLine"><span>{game.genre}</span><span>•</span><span>{formatCount(game.playing)} playing</span></div><p>{game.description?.slice(0,105)}{game.description?.length>105?"…":""}</p><div className="creatorLine"><span>by</span><button className="creatorButton" onClick={()=>notify(`${game.creator} creator selected.`)}>{game.creator}</button>{verified&&<VerificationBadge small/>}</div><div className="gameStats"><span>{formatCount(game.visits)} visits</span><span>{formatCount(game.favorites)} favorites</span></div><button className="playButton" onClick={()=>openGame(game)}>Play on Roblox</button></div></article>})}</div> : <div className="emptyState">No real experiences matched “{query}”. <button onClick={()=>setQuery("")}>Clear search</button></div>}
        </section>
        <section className="creatorStrip"><div><span className="heroEyebrow">BLOCKSPACE</span><h3>Discover real Roblox games.</h3><p>BlockSpace is a discovery layer. The Play buttons send you to Roblox's official experience pages.</p></div><button className="primaryButton" onClick={()=>window.open("https://www.roblox.com/discover", "_blank", "noopener,noreferrer")}>Open Roblox Discover</button></section>
      </>}

      {active === "Profile" && <section className="profileShell"><div className="profileCover"><div className="coverPattern"/><div className="coverCharacter"><div className="characterHead"/><div className="characterBody"/><div className="characterLeg one"/><div className="characterLeg two"/></div><button className="coverAction" onClick={()=>notify("3D profile preview opened.")}>3D</button></div><div className="profileMain"><div className="profileTop"><div className="profileAvatarBig">{profile?profile.subName.slice(0,2).toUpperCase():"BS"}</div><div className="profileIdentity"><div className="profileNameRow"><h2>{profileName}</h2>{profile&&<VerificationBadge/>}</div><p>@{username}</p><div className="likePill">♥ <span>{liked?1:0}</span></div></div><div className="profileActions"><button onClick={openSignIn}>{profile?"Edit profile":"Sign In"}</button><button onClick={()=>navigate("Avatar")}>Edit avatar</button><button onClick={()=>navigate("Themes")}>Edit Theme</button><button onClick={()=>notify("Profile menu opened.")}>•••</button></div></div><div className="profilePills"><span>0 Friends</span><span>0 Followers</span><span>0 Following</span></div><div className="profileBio">{profile?`Welcome to ${profileName}'s BlockSpace profile.`:"Sign in to create your own profile."}<button onClick={openSignIn}>{profile?"edit":"Sign in"}</button></div><div className="tabs"><button className="activeTab" onClick={()=>notify("About selected.")}>About</button><button onClick={()=>notify("Creations selected.")}>Creations</button></div><section className="wearing"><h3>Currently Wearing</h3><div className="itemRow">{[["shades","BlockSpace Shades","Accessory"],["dance","Signature Dance","Animation"],["shirt","Creator Shirt","Classic Shirt"],["face",":P","Face"],["hair","Brown Waves","Hair"]].map(([cls,title,type])=><div className="wearItem" key={title}><div className={`wearArt ${cls}`}>{cls==="face"?":P":cls==="hair"?"≋":"◆"}</div><strong>{title}</strong><span>{type}</span></div>)}</div></section></div></section>}

      {active !== "Home" && active !== "Profile" && pageData && <section className="genericPage"><div className="genericHero"><span className="heroEyebrow">BLOCKSPACE</span><h2>{pageData[0]}</h2><p>{pageData[1]}</p>{active==="Avatar"&&<button className="primaryButton" onClick={()=>navigate("Profile")}>View my profile</button>}{active==="Themes"&&<div className="themeChoices"><button onClick={()=>changeTheme("dark")}>Dark</button><button onClick={()=>changeTheme("graphite")}>Graphite</button><button onClick={()=>changeTheme("midnight")}>Midnight</button></div>}{active==="Sandbox"&&<button className="primaryButton" onClick={()=>notify("Sandbox project created.")}>Create project</button>}{active==="Store"&&<button className="primaryButton" onClick={()=>notify("Store preview opened.")}>Browse store</button>}</div><div className="infoGrid"><div className="infoCard"><h3>Connected</h3><p>This section is interactive and ready for the full BlockSpace backend.</p><button className="secondaryButton" onClick={()=>notify(`${pageData[0]} is connected.`)}>Test button</button></div><div className="infoCard"><h3>Explore real games</h3><p>Return to the discovery feed to see live Roblox player counts.</p><button className="primaryButton" onClick={()=>navigate("Home")}>Back to Home</button></div></div></section>}

      <footer className="footer"><div className="footerLinks">{footerLinks.map(link=><button key={link} onClick={()=>navigate(link)}>{link}</button>)}</div><div className="footerBottom"><span>© 2026 BlockSpace</span><span>Game data and links are provided by Roblox public endpoints.</span></div></footer>
    </div></div></section>

    {(authOpen||editOpen)&&<div className="modalBackdrop" onClick={()=>{setAuthOpen(false);setEditOpen(false)}}><form className="profileModal accountModal" onClick={e=>e.stopPropagation()} onSubmit={saveProfile}><button type="button" className="closeModal" onClick={()=>{setAuthOpen(false);setEditOpen(false)}}>×</button><div className="modalLogo">B</div><h2>{profile?"Edit your profile":"Create your BlockSpace account"}</h2><p>Choose the name people will see on your profile.</p><label>Username<input required value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="yourusername"/></label><label>Display name<input required value={form.subName} onChange={e=>setForm({...form,subName:e.target.value})} placeholder="Your display name"/></label><small>This is a local demo account. It does not collect or transmit Roblox passwords or cookies.</small><button className="primaryButton fullButton" type="submit">{profile?"Save profile":"Continue"}</button></form></div>}

    {adminOpen&&<div className="modalBackdrop" onClick={()=>setAdminOpen(false)}><div className="adminModal" onClick={e=>e.stopPropagation()}><button className="closeModal" onClick={()=>setAdminOpen(false)}>×</button><span className="heroEyebrow">ADMIN TOOLS</span><h2>Verification</h2><p className="modalLead">A creator badge is manually assigned by you. It is never automatic.</p><div className="verificationRules"><strong><VerificationBadge/> Verified badge</strong><span>The badge image matches the blue check style you supplied.</span></div><div className="creatorList">{creators.map(creator=>{const isVerified=verifiedCreators.includes(creator);return <div className="creatorRow" key={creator}><div><strong>{creator}</strong><span>Creator account</span></div><button className={`verifyToggle ${isVerified?"on":""}`} onClick={()=>toggleVerification(creator)}>{isVerified?<><VerificationBadge small/> Verified</>:"Add badge"}</button></div>})}</div><button className="secondaryButton fullButton" onClick={()=>setAdminOpen(false)}>Done</button></div></div>}
    {toast&&<div className="toast">{toast}</div>}
  </main>;
}
