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
  "Messages": ["Messages", "Your inbox is ready. Start a conversation from a creator profile."],
  "Friends": ["Friends", "Manage your friends and followers from your BlockSpace account."],
  "Avatar": ["Avatar", "Customize your BlockSpace profile appearance."],
  "Inventory": ["Inventory", "Your saved BlockSpace items and favorites will appear here."],
  "Sandbox": ["Sandbox", "Create and manage your own BlockSpace projects."],
  "Trade": ["Trade", "Trade tools are ready for your BlockSpace account."],
  "Communities": ["Communities", "Discover groups and communities built around your favorite experiences."],
  "Themes": ["Themes", "Choose a surface style and save it locally to your account."],
  "Blog": ["Blog", "Creator stories and BlockSpace updates."],
  "Store": ["Official Store", "Browse BlockSpace merchandise and creator items."],
  "Gift Cards": ["Gift Cards", "Manage your BlockSpace gift cards and account balance."],
  "About": ["About BlockSpace", "BlockSpace is an original discovery interface for interactive experiences."],
  "Jobs": ["Careers", "Build tools for creators, communities, and players."],
  "Newsroom": ["Newsroom", "Announcements and platform updates."],
  "Parents": ["Parents", "Safety, privacy, and account controls."],
  "Help": ["Help Center", "Guidance for accounts, profiles, experiences, and communities."],
  "Terms": ["Terms", "Placeholder terms for the BlockSpace concept."],
  "Accessibility": ["Accessibility", "Accessible contrast, focus states, and keyboard-friendly controls."],
  "Privacy": ["Privacy", "Local profile preferences are stored in your browser in this demo."],
  "Privacy Choices": ["Privacy Choices", "Manage local demo preferences."],
  "Sitemap": ["Sitemap", "Navigate every major BlockSpace section from one page."],
};

const defaultCreation = { title: "", description: "", genre: "Adventure", visibility: "Public" };

function VerificationBadge({ small = false }) {
  return <img className={`verificationImg ${small ? "small" : ""}`} src="/verification-badge.png" alt="Verified" />;
}
function Icon({ glyph }) { return <span className="navIcon" aria-hidden="true">{glyph}</span>; }
function getSavedProfile() { try { return JSON.parse(localStorage.getItem("blockspace_profile") || "null"); } catch { return null; } }
function formatCount(n) { if (n >= 1_000_000_000) return `${(n/1_000_000_000).toFixed(1)}B`; if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`; if (n >= 1_000) return `${(n/1_000).toFixed(1)}K`; return String(n ?? 0); }
function getSavedCreations() { try { return JSON.parse(localStorage.getItem("blockspace_creations") || "[]"); } catch { return []; } }

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
  const [session, setSession] = useState(null);
  const [authStatus, setAuthStatus] = useState({ configured: false, loading: true });
  const [verificationTarget, setVerificationTarget] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ username: "", subName: "" });
  const [theme, setTheme] = useState("dark");
  const [creations, setCreations] = useState([]);
  const [creationOpen, setCreationOpen] = useState(false);
  const [creationForm, setCreationForm] = useState(defaultCreation);
  const [editingCreationId, setEditingCreationId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatar, setAvatar] = useState({ hair: "Brown Waves", hairColor: "Brown", shirt: "Creator Shirt", shirtColor: "White", pants: "Classic Jeans", skin: "Warm", face: "Classic" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => { loadSession(); notify("Google sign-in successful."); }, 0);
    } else if (params.get("auth") === "error") {
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => notify("Google sign-in could not be completed."), 0);
    }
    setProfile(getSavedProfile());
    loadSession();
    loadVerification();
    try { setTheme(localStorage.getItem("blockspace_theme") || "dark"); } catch {}
    setCreations(getSavedCreations());
    try { setAvatar(JSON.parse(localStorage.getItem("blockspace_avatar") || "null") || { hair: "Brown Waves", hairColor: "Brown", shirt: "Creator Shirt", shirtColor: "White", pants: "Classic Jeans", skin: "Warm", face: "Classic" }); } catch {}
    try { setFriends(JSON.parse(localStorage.getItem("blockspace_friends") || "[]")); } catch { setFriends([]); }
    loadGames();
    const timer = setInterval(loadGames, 30000);
    return () => clearInterval(timer);
  }, []);

  async function loadSession() {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const json = await res.json();
      setAuthStatus({ configured: Boolean(json.configured), loading: false });
      setSession(json.authenticated ? json : null);
    } catch { setAuthStatus({ configured: false, loading: false }); }
  }
  async function loadVerification() {
    try {
      const res = await fetch("/api/admin/verification", { cache: "no-store" });
      const json = await res.json();
      if (Array.isArray(json.verified)) setVerifiedCreators(json.verified);
    } catch {}
  }

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
  function navigate(label) { setActive(label); setQuery(""); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
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
  function openAvatarEditor() { setAvatarOpen(true); }
  function saveAvatar(event) { event.preventDefault(); localStorage.setItem("blockspace_avatar", JSON.stringify(avatar)); setAvatarOpen(false); notify("Avatar saved."); }
  function resetAvatar() { const base={ hair: "Brown Waves", hairColor: "Brown", shirt: "Creator Shirt", shirtColor: "White", pants: "Classic Jeans", skin: "Warm", face: "Classic" }; setAvatar(base); localStorage.setItem("blockspace_avatar", JSON.stringify(base)); notify("Avatar reset."); }
  function openSignIn() {
    setForm(profile ? { username: profile.username, subName: profile.subName } : { username: "", subName: "" });
    profile ? setEditOpen(true) : setAuthOpen(true);
  }
  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("blockspace_profile");
    setProfile(null);
    setSession(null);
    navigate("Home");
    notify("Signed out.");
  }
  async function openVerification() {
    if (!session?.isAdmin) {
      notify(session ? "Verification is restricted to the BlockSpace owner." : "Sign in with the owner's Google account to manage verification.");
      return;
    }
    await loadVerification();
    setAdminOpen(true);
  }
  async function changeVerification(username, action) {
    const clean = username.trim().replace(/^@/, "");
    if (clean.length < 3) return notify("Enter a BlockSpace username.");
    const res = await fetch("/api/admin/verification", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: clean, action }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return notify(json.error || "Verification update failed.");
    setVerifiedCreators(json.verified || []);
    setVerificationTarget("");
    notify(action === "add" ? `@${clean} is now verified.` : `Verification removed from @${clean}.`);
  }
  function changeTheme(name) { setTheme(name); localStorage.setItem("blockspace_theme", name); document.documentElement.dataset.theme = name; notify(`${name[0].toUpperCase()+name.slice(1)} theme applied.`); }
  function openCreateProject() { setEditingCreationId(null); setCreationForm(defaultCreation); setCreationOpen(true); }
  function editCreation(item) { setEditingCreationId(item.id); setCreationForm({ title: item.title, description: item.description, genre: item.genre, visibility: item.visibility }); setCreationOpen(true); }
  function saveCreation(event) {
    event.preventDefault();
    const title = creationForm.title.trim().slice(0, 60);
    const description = creationForm.description.trim().slice(0, 240);
    if (title.length < 2) return notify("Give your creation a title.");
    const stamp = new Date().toISOString();
    const next = editingCreationId
      ? creations.map(c => c.id === editingCreationId ? { ...c, ...creationForm, title, description, updatedAt: stamp } : c)
      : [{ id: crypto.randomUUID(), ...creationForm, title, description, createdAt: stamp, updatedAt: stamp, plays: 0 }, ...creations];
    setCreations(next); localStorage.setItem("blockspace_creations", JSON.stringify(next)); setCreationOpen(false); setEditingCreationId(null); notify(editingCreationId ? "Creation updated." : "Creation created.");
  }
  function deleteCreation(id) { const next = creations.filter(c => c.id !== id); setCreations(next); localStorage.setItem("blockspace_creations", JSON.stringify(next)); notify("Creation deleted."); }
  function publishCreation(id) { setCreations(current => { const next = current.map(c => c.id === id ? { ...c, visibility: "Public", published: true } : c); localStorage.setItem("blockspace_creations", JSON.stringify(next)); return next; }); notify("Creation published."); }
  function duplicateCreation(item) { const copy = { ...item, id: crypto.randomUUID(), title: `${item.title} Copy`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), plays: 0, published: false }; const next = [copy, ...creations]; setCreations(next); localStorage.setItem("blockspace_creations", JSON.stringify(next)); notify("Creation duplicated."); }
  function followCreator(name) { if (!name) return; setFriends(current => { if (current.includes(name)) { const next = current.filter(x => x !== name); localStorage.setItem("blockspace_friends", JSON.stringify(next)); notify(`Unfollowed ${name}.`); return next; } const next = [...current, name]; localStorage.setItem("blockspace_friends", JSON.stringify(next)); notify(`Following ${name}.`); return next; }); }
  function sendMessage() { const text = messageText.trim(); if (!text) return notify("Write a message first."); setMessageText(""); setMessageOpen(false); notify("Message sent in the demo inbox."); }
  function copyProfileLink() { navigator.clipboard?.writeText(window.location.href).then(() => notify("Profile link copied.")).catch(() => notify("Profile link ready to share.")); }

  const visible = useMemo(() => { const q=query.trim().toLowerCase(); return !q ? games : games.filter(g => `${g.name} ${g.creator} ${g.genre} ${g.description}`.toLowerCase().includes(q)); }, [games,query]);
  const profileName = profile?.subName || "Guest";
  const username = profile?.username || "guest";
  const pageData = pageCopy[active];
  const creators = [...new Set(games.map(g => g.creator).filter(Boolean))];
  const currentUsername = profile?.username || "guest";
  const currentUserVerified = verifiedCreators.some((name) => name.toLowerCase() === currentUsername.toLowerCase());

  return <main className="shell">
    <aside className="sidebar">
      <div className="brandRow"><div className="brandMark">B</div><div className="brandName">BLOCKSPACE</div></div>
      <button className="profileMini" onClick={() => navigate("Profile")} aria-label="Open profile"><div className="avatarCircle">{profile ? profile.subName.slice(0,2).toUpperCase() : "BS"}</div><div className="profileText"><strong>{profileName}</strong><span>@{username}</span></div></button>
      <nav className="mainNav">{navItems.map(([glyph,label]) => <button key={label} className={`navItem ${active===label?"selected":""}`} onClick={()=>navigate(label)}><Icon glyph={glyph}/><span>{label}</span>{label==="Messages"&&<b className="countBubble">3</b>}</button>)}</nav>
      <div className="sidePromo"><div className="promoIcon">◆</div><strong>More features. More worlds.</strong><p>Unlock customization and creator tools.</p><button onClick={()=>navigate("BlockSpace Plus")}>Explore Plus</button></div>
      <div className="sidebarBottom"><button className="simpleLink" onClick={()=>navigate("Store")}><span>▣</span> Official Store</button><button className="simpleLink" onClick={()=>navigate("Gift Cards")}><span>▤</span> Buy Gift Cards</button><button className="simpleLink" onClick={openVerification}><span>✓</span> Verification</button>{profile?<button className="simpleLink signOut" onClick={signOut}><span>↪</span> Sign Out</button>:<button className="simpleLink signIn" onClick={openSignIn}><span>→</span> Sign In</button>}</div>
    </aside>

    <section className="pageArea"><div className="scene"><div className="scenePattern"/><div className="sceneGlow glowOne"/><div className="sceneGlow glowTwo"/><div className="contentPanel">
      <header className="topBar"><div><div className="crumb">BLOCKSPACE</div><h1>{active === "Store" ? "Official Store" : active}</h1></div><div className="topActions"><label className="searchBox"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search real Roblox experiences" onKeyDown={e=>e.key==="Enter"&&notify(query?`Showing matches for “${query}”`:"Type a game name.")}/></label><button className={`topIcon ${liked?"liked":""}`} onClick={()=>{setLiked(v=>!v);notify(!liked?"Added to favorites.":"Removed from favorites.")}} aria-label="Favorite">{liked?"♥":"♡"}</button><button className="topAvatar" onClick={()=>navigate("Profile")} aria-label="Open profile">{profile?profile.subName.slice(0,2).toUpperCase():"BS"}</button></div></header>

      {active === "Home" && <>
        <section className="heroStrip"><div className="heroCopy"><span className="heroEyebrow">REAL ROBLOX EXPERIENCES</span><h2>Find your next favorite world.</h2><p>Browse real Roblox experiences here. Player counts refresh from Roblox public game data, and Play opens the experience on Roblox.</p><div className="heroButtons"><button className="primaryButton" onClick={()=>document.getElementById("experiences")?.scrollIntoView({behavior:"smooth"})}>Explore experiences</button><button className="secondaryButton" onClick={()=>loadGames()}>Refresh player counts</button></div></div><div className="heroBadge"><div className="floatingCube">◆</div><strong>REAL-TIME DATA</strong><span>Refreshes every 30 seconds.</span></div></section>
        <section id="experiences" className="experienceSection"><div className="sectionHeader"><div><h3>Popular on Roblox</h3><p>Real game data loaded through BlockSpace's server-side proxy.</p></div><button className="viewAll" onClick={()=>{setQuery("");notify(`${games.length} real experiences available.`)}}>View all</button></div>
          {gameLoading && !games.length ? <div className="loadingState">Loading real Roblox experiences…</div> : gameError && !games.length ? <div className="emptyState">Could not load Roblox data. <button onClick={loadGames}>Try again</button></div> : visible.length ? <div className="experienceGrid">{visible.map((game,index)=>{const verified=verifiedCreators.includes(game.creator);return <article className="experienceCard" key={game.universeId}><button className="cardImageButton" onClick={()=>openGame(game)} title={`Open ${game.name} on Roblox`}>{game.icon?<img className="gameIcon" src={game.icon} alt=""/>:<div className={`cardArt art${index%6}`}><span className="artGrid"/><span className="artOrb"/><span className="artCube">◆</span></div>}</button><div className="cardBody"><div className="titleLine"><button className="gameTitleButton" onClick={()=>openGame(game)}>{game.name}</button>{verified&&<VerificationBadge small/>}</div><div className="metaLine"><span>{game.genre}</span><span>•</span><span>{formatCount(game.playing)} playing</span></div><p>{game.description?.slice(0,105)}{game.description?.length>105?"…":""}</p><div className="creatorLine"><span>by</span><button className="creatorButton" onClick={()=>{navigate("Profile");notify(`${game.creator} creator selected.`)}}>{game.creator}</button>{verified&&<VerificationBadge small/>}</div><div className="gameStats"><span>{formatCount(game.visits)} visits</span><span>{formatCount(game.favorites)} favorites</span></div><button className="secondaryButton fullButton" onClick={()=>followCreator(game.creator)}>{friends.includes(game.creator)?"Following":"Follow creator"}</button><button className="playButton" onClick={()=>openGame(game)}>Play on Roblox</button></div></article>})}</div> : <div className="emptyState">No real experiences matched “{query}”. <button onClick={()=>setQuery("")}>Clear search</button></div>}
        </section>
        <section className="creatorStrip"><div><span className="heroEyebrow">BLOCKSPACE</span><h3>Build something of your own.</h3><p>Create local BlockSpace projects in Sandbox, edit them later, duplicate them, and publish them from your dashboard.</p></div><button className="primaryButton" onClick={()=>navigate("Sandbox")}>Open Creator Studio</button></section>
      </>}

      {active === "Profile" && <section className="profileShell"><div className="profileCover"><div className="coverPattern"/><div className="coverCharacter"><div className="characterHead"/><div className="characterBody"/><div className="characterLeg one"/><div className="characterLeg two"/></div><button className="coverAction" onClick={()=>notify("3D profile preview opened.")}>3D</button></div><div className="profileMain"><div className="profileTop"><div className="profileAvatarBig"><div className={`avatarPreviewMini skin-${avatar.skin.toLowerCase()} shirt-${avatar.shirtColor.toLowerCase()}`}><span className={`avatarFace face-${avatar.face.toLowerCase()}`}>●</span><span className={`avatarHair hair-${avatar.hairColor.toLowerCase()}`}>⌁</span></div></div><div className="profileIdentity"><div className="profileNameRow"><h2>{profileName}</h2>{profile&&currentUserVerified&&<VerificationBadge/>}</div><p>@{username}</p><div className="likePill">♥ <span>{liked?1:0}</span></div></div><div className="profileActions"><button onClick={openSignIn}>{profile?"Edit profile":"Sign In"}</button><button onClick={openAvatarEditor}>Edit avatar</button><button onClick={()=>navigate("Themes")}>Edit Theme</button><button onClick={()=>setMenuOpen(v=>!v)}>•••</button>{menuOpen&&<div className="profileMenu"><button onClick={copyProfileLink}>Copy profile link</button><button onClick={()=>notify("Profile reported in the demo.")}>Report profile</button><button onClick={()=>followCreator(username)}>{friends.includes(username)?"Unfollow":"Follow"}</button></div>}</div></div><div className="profilePills"><span>{friends.length} Friends</span><span>0 Followers</span><span>{friends.length} Following</span></div><div className="profileBio">{profile?`Welcome to ${profileName}'s BlockSpace profile.`:"Sign in to create your own profile."}<button onClick={openSignIn}>{profile?"edit":"Sign in"}</button></div><div className="tabs"><button className="activeTab" onClick={()=>notify("About selected.")}>About</button><button onClick={()=>navigate("Sandbox")}>Creations</button></div><section className="wearing"><h3>Currently Wearing</h3><div className="itemRow">{[["shades","BlockSpace Shades","Accessory"],["dance","Signature Dance","Animation"],["shirt","Creator Shirt","Classic Shirt"],["face",":P","Face"],["hair","Brown Waves","Hair"]].map(([cls,title,type])=><button className="wearItem" key={title} onClick={()=>notify(`${title} selected.`)}><div className={`wearArt ${cls}`}>{cls==="face"?":P":cls==="hair"?"≋":"◆"}</div><strong>{title}</strong><span>{type}</span></button>)}</div></section></div></section>}

      {active === "Sandbox" && <section className="genericPage sandboxPage"><div className="genericHero"><span className="heroEyebrow">CREATOR STUDIO</span><h2>Create your BlockSpace world.</h2><p>Build project drafts directly in your browser. Your creations are saved locally on this device in this demo.</p><button className="primaryButton" onClick={openCreateProject}>+ Create new</button></div><div className="sectionHeader creatorHeader"><div><h3>My creations</h3><p>{creations.length} saved project{creations.length===1?"":"s"}.</p></div><button className="viewAll" onClick={openCreateProject}>+ New project</button></div>{creations.length ? <div className="creationGrid">{creations.map(item=><article className="creationCard" key={item.id}><div className="creationArt"><span>◆</span></div><div className="creationBody"><div className="creationTitle"><h3>{item.title}</h3><span className={`visibilityTag ${item.visibility.toLowerCase()}`}>{item.visibility}</span></div><p>{item.description || "No description yet."}</p><div className="creationMeta"><span>{item.genre}</span><span>•</span><span>{item.published?"Published":"Draft"}</span><span>•</span><span>{item.plays || 0} plays</span></div><div className="creationActions"><button onClick={()=>editCreation(item)}>Edit</button><button onClick={()=>duplicateCreation(item)}>Duplicate</button><button onClick={()=>publishCreation(item.id)}>Publish</button><button className="dangerButton" onClick={()=>deleteCreation(item.id)}>Delete</button></div></div></article>)}</div> : <div className="emptyState">You haven't created anything yet. <button onClick={openCreateProject}>Create your first project</button></div>}</section>}

      {active !== "Home" && active !== "Profile" && active !== "Sandbox" && pageData && <section className="genericPage"><div className="genericHero"><span className="heroEyebrow">BLOCKSPACE</span><h2>{pageData[0]}</h2><p>{pageData[1]}</p>{active==="Avatar"&&<button className="primaryButton" onClick={()=>notify("Avatar editor is ready in the demo.")}>Customize avatar</button>}{active==="Themes"&&<div className="themeChoices"><button onClick={()=>changeTheme("dark")}>Dark</button><button onClick={()=>changeTheme("graphite")}>Graphite</button><button onClick={()=>changeTheme("midnight")}>Midnight</button></div>}{active==="Messages"&&<button className="primaryButton" onClick={()=>setMessageOpen(true)}>New message</button>}{active==="Friends"&&<button className="primaryButton" onClick={()=>notify(friends.length?`${friends.length} creators followed.`:"You aren't following any creators yet.")}>View following</button>}{active==="Inventory"&&<button className="primaryButton" onClick={()=>navigate("Profile")}>View profile items</button>}{active==="Communities"&&<button className="primaryButton" onClick={()=>notify("Community discovery opened.")}>Discover communities</button>}{active==="BlockSpace Plus"&&<button className="primaryButton" onClick={()=>notify("Plus preview opened.")}>View Plus benefits</button>}{active==="Trade"&&<button className="primaryButton" onClick={()=>notify("Trade request composer opened.")}>Start a trade</button>}{active==="Blog"&&<button className="primaryButton" onClick={()=>notify("Latest BlockSpace post opened.")}>Read latest</button>}{active==="Store"&&<button className="primaryButton" onClick={()=>notify("Store preview opened.")}>Browse store</button>}</div><div className="infoGrid"><div className="infoCard"><h3>Quick action</h3><p>This section is interactive and ready for the full BlockSpace backend.</p><button className="secondaryButton" onClick={()=>notify(`${pageData[0]} action completed.`)}>Run action</button></div><div className="infoCard"><h3>Explore real games</h3><p>Return to the discovery feed to see live Roblox player counts.</p><button className="primaryButton" onClick={()=>navigate("Home")}>Back to Home</button></div></div></section>}

      <footer className="footer"><div className="footerLinks">{footerLinks.map(link=><button key={link} onClick={()=>navigate(link)}>{link}</button>)}</div><div className="footerBottom"><span>© 2026 BlockSpace</span><span>Game data and links are provided by Roblox public endpoints.</span></div></footer>
    </div></div></section>

    {avatarOpen&&<div className="modalBackdrop" onClick={()=>setAvatarOpen(false)}><form className="profileModal accountModal avatarModal" onClick={e=>e.stopPropagation()} onSubmit={saveAvatar}><button type="button" className="closeModal" onClick={()=>setAvatarOpen(false)}>×</button><div className="avatarEditorPreview"><div className="avatarDoll skin-warm"><div className={`dollHead skin-${avatar.skin.toLowerCase()}`}></div><div className={`dollHair hair-${avatar.hairColor.toLowerCase()}`}></div><div className={`dollBody shirt-${avatar.shirtColor.toLowerCase()}`}></div><div className="dollLegs"></div></div></div><h2>Customize your avatar</h2><p>Change your hair, face, clothing, and colors.</p><div className="avatarControls"><label>Hair<select value={avatar.hair} onChange={e=>setAvatar({...avatar,hair:e.target.value})}><option>Brown Waves</option><option>Short Fade</option><option>Curly</option><option>Spiky</option><option>Long</option></select></label><label>Hair color<select value={avatar.hairColor} onChange={e=>setAvatar({...avatar,hairColor:e.target.value})}><option>Brown</option><option>Black</option><option>Blonde</option><option>Red</option></select></label><label>Shirt<select value={avatar.shirt} onChange={e=>setAvatar({...avatar,shirt:e.target.value})}><option>Creator Shirt</option><option>Block Tee</option><option>Hoodie</option><option>Jacket</option></select></label><label>Shirt color<select value={avatar.shirtColor} onChange={e=>setAvatar({...avatar,shirtColor:e.target.value})}><option>White</option><option>Black</option><option>Blue</option><option>Red</option></select></label><label>Pants<select value={avatar.pants} onChange={e=>setAvatar({...avatar,pants:e.target.value})}><option>Classic Jeans</option><option>Black Jeans</option><option>Shorts</option><option>Cargo Pants</option></select></label><label>Skin tone<select value={avatar.skin} onChange={e=>setAvatar({...avatar,skin:e.target.value})}><option>Warm</option><option>Light</option><option>Tan</option><option>Deep</option></select></label><label>Face<select value={avatar.face} onChange={e=>setAvatar({...avatar,face:e.target.value})}><option>Classic</option><option>Smile</option><option>Happy</option><option>Chill</option></select></label></div><div className="avatarActions"><button type="button" className="secondaryButton" onClick={resetAvatar}>Reset</button><button className="primaryButton" type="submit">Save avatar</button></div></form></div>}

    {(authOpen||editOpen)&&<div className="modalBackdrop" onClick={()=>{setAuthOpen(false);setEditOpen(false)}}><form className="profileModal accountModal" onClick={e=>e.stopPropagation()} onSubmit={saveProfile}><button type="button" className="closeModal" onClick={()=>{setAuthOpen(false);setEditOpen(false)}}>×</button><div className="modalLogo">B</div><h2>{profile?"Edit your profile":"Create your BlockSpace account"}</h2><p>Choose the name people will see on your profile.</p><label>Username<input required value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="yourusername" maxLength={20}/></label><label>Display name<input required value={form.subName} onChange={e=>setForm({...form,subName:e.target.value})} placeholder="Your display name" maxLength={30}/></label><small>{authStatus.configured ? "Google sign-in secures your BlockSpace account. Your Google password is handled by Google, not BlockSpace." : "Google sign-in has not been configured on this deployment yet."}</small>{!profile&&<button type="button" className="googleButton fullButton" onClick={()=>window.location.href="/api/auth/google"} disabled={!authStatus.configured}>Continue with Google</button>}<button className="primaryButton fullButton" type="submit">{profile?"Save profile":"Continue with local demo"}</button></form></div>}

    {creationOpen&&<div className="modalBackdrop" onClick={()=>setCreationOpen(false)}><form className="profileModal accountModal creationModal" onClick={e=>e.stopPropagation()} onSubmit={saveCreation}><button type="button" className="closeModal" onClick={()=>setCreationOpen(false)}>×</button><div className="modalLogo">◆</div><h2>{editingCreationId?"Edit creation":"Create a new project"}</h2><p>Make a project and save it to your creator dashboard.</p><label>Project name<input required value={creationForm.title} onChange={e=>setCreationForm({...creationForm,title:e.target.value})} placeholder="My awesome world" maxLength={60}/></label><label>Description<textarea value={creationForm.description} onChange={e=>setCreationForm({...creationForm,description:e.target.value})} placeholder="Tell people what your project is about." maxLength={240}/></label><div className="formGrid"><label>Genre<select value={creationForm.genre} onChange={e=>setCreationForm({...creationForm,genre:e.target.value})}><option>Adventure</option><option>Obby</option><option>Roleplay</option><option>Simulator</option><option>Social</option><option>Racing</option><option>Horror</option></select></label><label>Visibility<select value={creationForm.visibility} onChange={e=>setCreationForm({...creationForm,visibility:e.target.value})}><option>Public</option><option>Private</option></select></label></div><button className="primaryButton fullButton" type="submit">{editingCreationId?"Save changes":"Create project"}</button></form></div>}

    {messageOpen&&<div className="modalBackdrop" onClick={()=>setMessageOpen(false)}><form className="profileModal accountModal" onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();sendMessage()}}><button type="button" className="closeModal" onClick={()=>setMessageOpen(false)}>×</button><div className="modalLogo">✉</div><h2>New message</h2><p>Send a message in the local demo inbox.</p><label>Message<textarea value={messageText} onChange={e=>setMessageText(e.target.value)} placeholder="Write something…" maxLength={500}/></label><button className="primaryButton fullButton" type="submit">Send message</button></form></div>}

    {adminOpen&&<div className="modalBackdrop" onClick={()=>setAdminOpen(false)}><div className="adminModal" onClick={e=>e.stopPropagation()}><button className="closeModal" onClick={()=>setAdminOpen(false)}>×</button><span className="heroEyebrow">OWNER TOOLS</span><h2>Verification</h2><p className="modalLead">Only the Google account set in BLOCKSPACE_ADMIN_EMAIL can add or remove badges. Changes are stored server-side.</p><div className="verificationRules"><strong><VerificationBadge/> Verified badge</strong><span>Use a BlockSpace username to manually assign or remove the badge.</span></div><div className="adminVerifyForm"><input value={verificationTarget} onChange={e=>setVerificationTarget(e.target.value)} placeholder="BlockSpace username" maxLength={30}/><div className="verifyFormActions"><button className="primaryButton" onClick={()=>changeVerification(verificationTarget,"add")}>Add badge</button><button className="secondaryButton" onClick={()=>changeVerification(verificationTarget,"remove")}>Remove badge</button></div></div><div className="creatorList">{verifiedCreators.length ? verifiedCreators.map(creator=><div className="creatorRow" key={creator}><div><strong>@{creator}</strong><span>Verified BlockSpace account</span></div><button className="verifyToggle on" onClick={()=>changeVerification(creator,"remove")}><VerificationBadge small/> Remove</button></div>) : <div className="emptyState">No verified accounts yet.</div>}</div><button className="secondaryButton fullButton" onClick={()=>setAdminOpen(false)}>Done</button></div></div>}
    {toast&&<div className="toast" role="status">{toast}</div>}
  </main>;
}
