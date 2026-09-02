 "use client";
import {useMemo,useState} from "react";

const games=[
 {name:"Brookhaven RP",players:"48.2K",tag:"Roleplay",img:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80"},
 {name:"Blade Arena",players:"22.7K",tag:"Fighting",img:"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80"},
 {name:"City Builders",players:"14.9K",tag:"Building",img:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80"},
 {name:"Sky Obby",players:"9.4K",tag:"Adventure",img:"https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=900&q=80"}
];

export default function Home(){
 const [q,setQ]=useState(""); const [tab,setTab]=useState("Discover"); const [modal,setModal]=useState(null);
 const [logged,setLogged]=useState(false);
 const results=useMemo(()=>games.filter(g=>(g.name+" "+g.tag).toLowerCase().includes(q.toLowerCase())),[q]);
 return <main>
  <header><div className="brand"><span className="cube">◆</span> BlockWorld</div>
   <nav>{["Discover","Marketplace","Create"].map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</nav>
   <div className="right"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search experiences"/>{logged?<button className="avatar">BW</button>:<button className="login" onClick={()=>setModal("login")}>Sign in</button>}</div>
  </header>
  <section className="hero"><div><div className="eyebrow">COMMUNITY GAMING PLATFORM</div><h1>Play. Create.<br/><span>Share.</span></h1><p>Discover experiences, meet creators, and build your own worlds.</p><button className="primary" onClick={()=>document.getElementById("games").scrollIntoView({behavior:"smooth"})}>Explore experiences</button></div><div className="heroCard"><div className="heroGlow"></div><div className="miniCube">◆</div><b>Build your world</b><small>Creator tools • Social play • Endless possibilities</small></div></section>
  <section id="games"><div className="sectionHead"><div><h2>{q?`Search results for “${q}”`:"Popular experiences"}</h2><p>Jump into something new.</p></div><button className="ghost">See all →</button></div>
   <div className="grid">{results.map(g=><article className="game" key={g.name}><img src={g.img}/><div className="gameBody"><div className="gameTitle">{g.name}<span className="verified" title="Verified creator">✓</span></div><span className="tag">{g.tag}</span><div className="players">● {g.players} playing</div></div></article>)}</div>
   {!results.length&&<div className="empty">No experiences found. Try another search.</div>}
  </section>
  <section className="creator"><div><div className="eyebrow">FOR CREATORS</div><h2>Turn ideas into experiences.</h2><p>Prototype, publish, and grow a community around your creations.</p><button className="primary" onClick={()=>setModal("create")}>Start creating</button></div><div className="stats"><b>10M+</b><span>community visits</span><b>250K+</b><span>creators</span><b>∞</b><span>possibilities</span></div></section>
  <footer><span>© 2026 BlockWorld</span><span>Terms · Privacy · Safety</span></footer>
  {modal&&<div className="overlay" onClick={()=>setModal(null)}><div className="modal" onClick={e=>e.stopPropagation()}>{modal==="login"?<><h2>Sign in</h2><p className="muted">Demo authentication for this starter. No real account credentials are transmitted.</p><input placeholder="Username"/><input type="password" placeholder="Password"/><button className="primary wide" onClick={()=>{setLogged(true);setModal(null)}}>Continue demo</button></>:<><h2>Creator Studio</h2><p className="muted">This starter includes the creator UI flow. Connect your own auth/database to publish real content.</p><button className="primary wide" onClick={()=>setModal(null)}>Got it</button></>}<button className="close" onClick={()=>setModal(null)}>×</button></div></div>}
 </main>
}