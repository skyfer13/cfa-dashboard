import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const PALETTE = {
  ethics:  { bg:"#FDE8F0", border:"#F4A7C3", text:"#C0547A" },
  quant:   { bg:"#E8F0FD", border:"#A7C3F4", text:"#5474C0" },
  econ:    { bg:"#E8FDF0", border:"#A7F4C3", text:"#2D9C6A" },
  fsa:     { bg:"#FDF4E8", border:"#F4CFA7", text:"#C07830" },
  corp:    { bg:"#F0E8FD", border:"#C3A7F4", text:"#7054C0" },
  equity:  { bg:"#FDFDE8", border:"#F4F0A7", text:"#9E9830" },
  fi:      { bg:"#E8FDFD", border:"#A7EEF4", text:"#2B9BAA" },
  deriv:   { bg:"#FDE8E8", border:"#F4A7A7", text:"#C05454" },
  alt:     { bg:"#F0FDE8", border:"#C3F4A7", text:"#5AA030" },
  port:    { bg:"#FDE8F8", border:"#F4A7E8", text:"#B84CAA" },
};

const LEVELS = [
  { id:0, label:"not started", emoji:"🔴", color:"#F4A7A7", bg:"#FDE8E8", text:"#C05454" },
  { id:1, label:"read once",   emoji:"🟡", color:"#F4CFA7", bg:"#FDF4E8", text:"#C07830" },
  { id:2, label:"understood",  emoji:"🟢", color:"#A7F4C3", bg:"#E8FDF0", text:"#2D9C6A" },
  { id:3, label:"exam ready",  emoji:"⭐", color:"#F4F0A7", bg:"#FDFDE8", text:"#9E9830" },
];

const SUBJECTS = [
  { key:"ethics",  name:"Ethical & Professional Standards", abbr:"Ethics",    weight:15,
    chapters:["Ethics and Trust","Code of Ethics","Standards I–VII","GIPS Introduction","Ethics Application","Trade Allocation"] },
  { key:"quant",   name:"Quantitative Methods",             abbr:"Quant",     weight:8,
    chapters:["Rates & Returns","Time Value of Money","Statistical Measures","Probability Trees","Portfolio Mathematics","Simulation Methods","Estimation & Inference","Hypothesis Testing","Non-Parametric Tests","Simple Linear Regression","Big Data Techniques"] },
  { key:"econ",    name:"Economics",                        abbr:"Econ",      weight:8,
    chapters:["Firm & Market Structures","Business Cycles","Fiscal Policy","Monetary Policy","Geopolitics","International Trade","Capital Flows & FX","Exchange Rate Calculations"] },
  { key:"fsa",     name:"Financial Statement Analysis",     abbr:"FSA",       weight:13,
    chapters:["Intro to FSA","Income Statements","Balance Sheets","Cash Flows I","Cash Flows II","Inventories","Long-Term Assets","Liabilities & Equity","Income Taxes","Reporting Quality","Analysis Techniques","Financial Modeling","Quality Evaluation"] },
  { key:"corp",    name:"Corporate Issuers",                abbr:"Corp",      weight:9,
    chapters:["Organizational Forms","Investors & Stakeholders","Corporate Governance","Working Capital","Capital Investments","Capital Structure","Business Models"] },
  { key:"equity",  name:"Equity Investments",               abbr:"Equity",    weight:11,
    chapters:["Market Organization","Security Indexes","Market Efficiency","Equity Securities","Company Analysis: Past","Industry Analysis","Company Forecasting","Equity Valuation"] },
  { key:"fi",      name:"Fixed Income",                     abbr:"Fixed Inc", weight:11,
    chapters:["Instrument Features","Cash Flows & Types","Issuance & Trading","Corporate FI Markets","Government FI Markets","FI Valuation","Yield Measures (Fixed)","Yield Measures (Float)","Term Structure","Interest Rate Risk","Credit Risk","Govt Credit Analysis","Corp Credit Analysis","Securitization"] },
  { key:"deriv",   name:"Derivatives",                      abbr:"Deriv",     weight:6,
    chapters:["Derivative Features","Forward & Contingent Claims","Benefits & Risks","Arbitrage & Cost of Carry","Forward Pricing","Futures Pricing","Swap Pricing","Option Pricing","Put–Call Parity"] },
  { key:"alt",     name:"Alternative Investments",          abbr:"Alt Inv",   weight:7,
    chapters:["Features & Methods","Performance & Returns","Private Capital","Real Estate & Infrastructure","Natural Resources","Hedge Funds","Digital Assets"] },
  { key:"port",    name:"Portfolio Management",             abbr:"Portfolio", weight:12,
    chapters:["Risk & Return I","Risk & Return II","Portfolio Overview","Behavioral Biases","Risk Management","Technical Analysis","Introduction to Trading"] },
];

const totalChaps = SUBJECTS.reduce((s,x)=>s+x.chapters.length,0);

const EXAM_DATE  = new Date("2026-08-19");
const READY_DATE = new Date("2026-07-19");
const TODAY      = new Date("2026-04-19");
const daysToReady = Math.max(0,Math.ceil((READY_DATE-TODAY)/(1000*60*60*24)));
const daysToExam  = Math.max(0,Math.ceil((EXAM_DATE-TODAY)/(1000*60*60*24)));
const weeksLeft   = Math.max(1,Math.ceil(daysToReady/7));

const initData = () => {
  try {
    const saved = localStorage.getItem("cfa_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      return SUBJECTS.map(s=>{
        const match = parsed.find(x=>x.key===s.key);
        return match ? {...s, ratings: match.ratings} : {...s, ratings: new Array(s.chapters.length).fill(0)};
      });
    }
  } catch {}
  return SUBJECTS.map(s=>({...s, ratings: new Array(s.chapters.length).fill(0)}));
};

const save = (data) => {
  localStorage.setItem("cfa_v2", JSON.stringify(data.map(s=>({key:s.key,ratings:s.ratings}))));
};

const TABS = ["overview","subjects","chapters","weakest"];

export default function CFA() {
  const [data, setData] = useState(initData);
  const [tab, setTab] = useState("overview");
  const [open, setOpen] = useState(null);

  const updateRating = (key, idx, val) => {
    setData(prev => {
      const next = prev.map(s=>{
        if (s.key!==key) return s;
        const ratings = [...s.ratings];
        ratings[idx] = ratings[idx]===val ? 0 : val;
        return {...s, ratings};
      });
      save(next);
      return next;
    });
  };

  const resetAll = () => {
    if (window.confirm("Reset all ratings to zero? This cannot be undone!")) {
      const fresh = SUBJECTS.map(s=>({...s, ratings: new Array(s.chapters.length).fill(0)}));
      setData(fresh);
      localStorage.removeItem("cfa_v2");
    }
  };

  const exportCSV = () => {
    const rows = [["Subject","Chapter","Status"]];
    data.forEach(s=>s.chapters.forEach((ch,i)=>{
      rows.push([s.name, ch, LEVELS[s.ratings[i]].label]);
    }));
    const csv = rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download = "cfa_progress.csv"; a.click();
  };

  // stats
  const allRatings = data.flatMap(s=>s.ratings);
  const examReady  = allRatings.filter(r=>r===3).length;
  const understood = allRatings.filter(r=>r===2).length;
  const readOnce   = allRatings.filter(r=>r===1).length;
  const notStarted = allRatings.filter(r=>r===0).length;
  const masteredPct = Math.round((examReady/totalChaps)*100);
  const progressPct = Math.round(((examReady+understood)/totalChaps)*100);

  const subjectScore = (s) => {
    const sum = s.ratings.reduce((a,r)=>a+r,0);
    return Math.round((sum/(s.chapters.length*3))*100);
  };

  const ranked = [...data].sort((a,b)=>subjectScore(a)-subjectScore(b));
  const weak = ranked[0];
  const wP = PALETTE[weak.key];
  const weakScore = subjectScore(weak);
  const weakReady = weak.ratings.filter(r=>r===3).length;
  const weakLeft  = weak.chapters.length - weakReady;

  const overviewBar = data.map(s=>({
    name: s.abbr,
    "exam ready": s.ratings.filter(r=>r===3).length,
    "understood": s.ratings.filter(r=>r===2).length,
    "read once":  s.ratings.filter(r=>r===1).length,
    "not started":s.ratings.filter(r=>r===0).length,
    col: PALETTE[s.key].border,
  }));

  const piData = [
    {name:"exam ready", value:examReady,  fill:"#F4F0A7"},
    {name:"understood", value:understood, fill:"#A7F4C3"},
    {name:"read once",  value:readOnce,   fill:"#F4CFA7"},
    {name:"not started",value:notStarted, fill:"#F5EEF8"},
  ];

  const btn = (active) => ({
    background: active?"#FDE8F3":"transparent",
    border: active?"1.5px solid #F4A7C3":"1.5px solid #eee",
    color: active?"#C0547A":"#999",
    borderRadius:20, padding:"5px 16px", fontSize:12,
    fontWeight: active?500:400, cursor:"pointer", fontFamily:"inherit",
  });

  const card = (extra={}) => ({
    background:"#fff", border:"1.5px solid #F4E8F0",
    borderRadius:14, padding:"18px 20px", ...extra,
  });

  return (
    <div style={{background:"#FDF8FB",minHeight:"100vh",fontFamily:"-apple-system,'Segoe UI',sans-serif",color:"#333"}}>
      {/* Header */}
      <div style={{background:"#fff",borderBottom:"1.5px solid #F4E0EE",padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:12,paddingBottom:16}}>
          <div>
            <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>CFA Level I · Aug 2026</div>
            <h1 style={{margin:0,fontSize:26,fontWeight:600,color:"#2D2030",lineHeight:1}}>hey skyfer! ✦</h1>
            <div style={{fontSize:12,color:"#aaa",marginTop:5}}>
              ready by <span style={{color:"#5AA030",fontWeight:500}}>Jul 19</span> ({daysToReady}d) · exam <span style={{color:"#C05454",fontWeight:500}}>Aug 19</span> ({daysToExam}d)
            </div>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            {[
              {label:"exam ready",  val:examReady,   color:"#9E9830", bg:"#FDFDE8", bc:"#F4F0A7"},
              {label:"understood",  val:understood,  color:"#2D9C6A", bg:"#E8FDF0", bc:"#A7F4C3"},
              {label:"chapters left",val:notStarted+readOnce, color:"#C05454", bg:"#FDE8E8", bc:"#F4A7A7"},
            ].map(({label,val,color,bg,bc})=>(
              <div key={label} style={{textAlign:"center",background:bg,borderRadius:12,padding:"10px 18px",border:`1.5px solid ${bc}`}}>
                <div style={{fontSize:20,fontWeight:600,color,lineHeight:1}}>{val}</div>
                <div style={{fontSize:10,color:"#bbb",marginTop:4}}>{label}</div>
              </div>
            ))}
            <button onClick={exportCSV} style={{background:"#E8FDF0",border:"1.5px solid #A7F4C3",color:"#2D9C6A",borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>↓ export</button>
            <button onClick={resetAll} style={{background:"#FDE8E8",border:"1.5px solid #F4A7A7",color:"#C05454",borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>↺ reset</button>
          </div>
        </div>

        {/* Legend */}
        <div style={{display:"flex",gap:16,marginBottom:12}}>
          {LEVELS.map(l=>(
            <span key={l.id} style={{fontSize:11,color:"#aaa",display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:10,height:10,borderRadius:"50%",background:l.color,display:"inline-block"}}/>
              {l.label}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6}}>
          {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={btn(tab===t)}>{t}</button>)}
        </div>
      </div>

      <div style={{padding:"20px 32px",maxWidth:1080,boxSizing:"border-box"}}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div>
            {/* Stat cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:16}}>
              {[
                {label:"exam ready",    val:`${masteredPct}%`, sub:`${examReady} chapters`,      bg:"#FDFDE8",bc:"#F4F0A7",tc:"#9E9830"},
                {label:"understood+",  val:`${progressPct}%`, sub:`${examReady+understood} chaps`,bg:"#E8FDF0",bc:"#A7F4C3",tc:"#2D9C6A"},
                {label:"not started",  val:notStarted,        sub:"chapters",                    bg:"#FDE8E8",bc:"#F4A7A7",tc:"#C05454"},
                {label:"weakest",      val:weak.abbr,         sub:`${weakScore}% score`,         bg:"#FDF4E8",bc:"#F4CFA7",tc:"#C07830"},
                {label:"weeks to ready",val:weeksLeft,        sub:"to Jul 19",                   bg:"#F0E8FD",bc:"#C3A7F4",tc:"#7054C0"},
              ].map(({label,val,sub,bg,bc,tc})=>(
                <div key={label} style={{background:bg,border:`1.5px solid ${bc}`,borderRadius:12,padding:"14px"}}>
                  <div style={{fontSize:10,color:tc,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6,opacity:0.7}}>{label}</div>
                  <div style={{fontSize:22,fontWeight:600,color:tc,lineHeight:1}}>{val}</div>
                  <div style={{fontSize:11,color:tc,marginTop:4,opacity:0.65}}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {/* Stacked bar */}
              <div style={card()}>
                <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>confidence per subject</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart layout="vertical" data={overviewBar} barSize={12}>
                    <XAxis type="number" tick={{fill:"#ccc",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis dataKey="name" type="category" tick={{fill:"#888",fontSize:11}} axisLine={false} tickLine={false} width={60}/>
                    <Tooltip content={({active,payload,label})=>active&&payload?.length?(
                      <div style={{background:"#fff",border:"1.5px solid #F4C3DC",borderRadius:10,padding:"8px 14px",fontSize:12}}>
                        <div style={{color:"#C0547A",fontWeight:500,marginBottom:3}}>{label}</div>
                        {payload.map((p,i)=><div key={i} style={{color:"#888"}}>{p.name}: {p.value}</div>)}
                      </div>
                    ):null}/>
                    <Bar dataKey="exam ready"  stackId="a" fill="#F4F0A7" radius={[0,0,0,0]}/>
                    <Bar dataKey="understood"  stackId="a" fill="#A7F4C3"/>
                    <Bar dataKey="read once"   stackId="a" fill="#F4CFA7"/>
                    <Bar dataKey="not started" stackId="a" fill="#F5EEF8" radius={[0,3,3,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie */}
              <div style={card()}>
                <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>overall breakdown</div>
                <div style={{fontSize:12,color:"#888",marginBottom:8}}>
                  <span style={{fontSize:20,fontWeight:600,color:"#9E9830"}}>{examReady}</span> of {totalChaps} chapters exam ready
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={piData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={44} paddingAngle={2}>
                      {piData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                    </Pie>
                    <Tooltip content={({active,payload})=>active&&payload?.length?(
                      <div style={{background:"#fff",border:"1.5px solid #F4C3DC",borderRadius:10,padding:"8px 14px",fontSize:12}}>
                        <div style={{color:"#C0547A",fontWeight:500}}>{payload[0].name}</div>
                        <div style={{color:"#888"}}>{payload[0].value} chapters</div>
                      </div>
                    ):null}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",marginTop:4}}>
                  {piData.map(d=>(
                    <span key={d.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#aaa"}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:d.fill,display:"inline-block",border:"1px solid #ddd"}}/>
                      {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBJECTS ── */}
        {tab==="subjects" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
            {data.map(s=>{
              const p = PALETTE[s.key];
              const sc = subjectScore(s);
              const counts = [0,1,2,3].map(l=>s.ratings.filter(r=>r===l).length);
              return (
                <div key={s.key} style={{background:"#fff",border:`1.5px solid ${p.border}`,borderRadius:14,padding:"16px",borderTop:`4px solid ${p.border}`}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#333",marginBottom:4}}>{s.name}</div>
                  <div style={{fontSize:11,color:"#bbb",marginBottom:10}}>weight: {s.weight}% · {s.chapters.length} chapters</div>
                  {/* Mini progress bar */}
                  <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:10}}>
                    {[0,1,2,3].map(l=>(
                      <div key={l} style={{flex:counts[l],background:LEVELS[l].color,transition:"flex 0.3s"}}/>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:22,fontWeight:600,color:p.text}}>{sc}%</div>
                    <div style={{display:"flex",gap:4}}>
                      {[0,1,2,3].map(l=>(
                        <span key={l} style={{fontSize:10,background:LEVELS[l].bg,color:LEVELS[l].text,borderRadius:8,padding:"2px 6px"}}>{counts[l]}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={()=>setTab("chapters")||setOpen(s.key)} style={{marginTop:10,width:"100%",background:p.bg,border:`1.5px solid ${p.border}`,color:p.text,borderRadius:8,padding:"6px",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                    rate chapters →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CHAPTERS ── */}
        {tab==="chapters" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {data.map(s=>{
              const p = PALETTE[s.key];
              const sc = subjectScore(s);
              const isOpen = open===s.key;
              return (
                <div key={s.key} style={{background:"#fff",border:`1.5px solid ${isOpen?p.border:"#F4E8F0"}`,borderRadius:13,overflow:"hidden"}}>
                  <div onClick={()=>setOpen(isOpen?null:s.key)} style={{padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:p.border,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:13,fontWeight:500,color:"#333"}}>{s.name}</span>
                        <span style={{background:p.bg,border:`1.5px solid ${p.border}`,color:p.text,borderRadius:20,padding:"2px 10px",fontSize:11}}>{s.weight}% wt</span>
                      </div>
                      <div style={{display:"flex",height:5,borderRadius:3,overflow:"hidden",maxWidth:200}}>
                        {[0,1,2,3].map(l=>{
                          const cnt = s.ratings.filter(r=>r===l).length;
                          return <div key={l} style={{flex:cnt,background:LEVELS[l].color}}/>;
                        })}
                      </div>
                    </div>
                    <span style={{fontSize:13,fontWeight:600,color:p.text}}>{sc}%</span>
                    <span style={{color:p.border,fontSize:16,transform:isOpen?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
                  </div>

                  {isOpen && (
                    <div style={{borderTop:`1.5px solid ${p.bg}`,padding:"12px 18px 16px"}}>
                      <div style={{fontSize:11,color:"#bbb",marginBottom:10}}>tap a level to rate each chapter — tap again to undo</div>
                      {s.chapters.map((ch,idx)=>{
                        const rating = s.ratings[idx];
                        return (
                          <div key={idx} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #FAF0F5"}}>
                            <span style={{fontSize:12,color:"#555",flex:1,lineHeight:1.4}}>{idx+1}. {ch}</span>
                            <div style={{display:"flex",gap:5}}>
                              {LEVELS.map(l=>(
                                <button key={l.id} onClick={()=>updateRating(s.key,idx,l.id)}
                                  title={l.label}
                                  style={{
                                    width:28,height:28,borderRadius:8,border:`1.5px solid ${rating===l.id?l.color:"#eee"}`,
                                    background:rating===l.id?l.bg:"transparent",
                                    cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",
                                    transition:"all 0.15s",
                                  }}>
                                  {l.emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── WEAKEST ── */}
        {tab==="weakest" && (
          <div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {ranked.map((s,i)=>{
                const p=PALETTE[s.key];
                const sc=subjectScore(s);
                return(
                  <span key={s.key} style={{background:i===0?"#FDE8E8":p.bg,border:`1.5px solid ${i===0?"#F4A7A7":p.border}`,color:i===0?"#C05454":p.text,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:i===0?600:400}}>
                    {i===0?"⚠ ":""}{s.abbr} {sc}%
                  </span>
                );
              })}
            </div>

            <div style={{background:wP.bg,border:`1.5px solid ${wP.border}`,borderRadius:16,padding:"22px",marginBottom:14}}>
              <div style={{fontSize:10,color:"#C05454",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>⚠ needs most attention</div>
              <div style={{fontSize:24,fontWeight:600,color:wP.text,marginBottom:4}}>{weak.name}</div>
              <div style={{fontSize:12,color:wP.text,opacity:0.7,marginBottom:18}}>exam weight: {weak.weight}% · {weak.chapters.length} chapters</div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
                {LEVELS.map(l=>{
                  const cnt = weak.ratings.filter(r=>r===l.id).length;
                  return(
                    <div key={l.id} style={{background:"#fff",borderRadius:10,padding:"12px",border:`1.5px solid ${l.color}`,textAlign:"center"}}>
                      <div style={{fontSize:20,marginBottom:4}}>{l.emoji}</div>
                      <div style={{fontSize:18,fontWeight:600,color:l.text}}>{cnt}</div>
                      <div style={{fontSize:10,color:"#bbb",marginTop:2}}>{l.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div style={{display:"flex",height:10,borderRadius:5,overflow:"hidden",marginBottom:18}}>
                {[0,1,2,3].map(l=>{
                  const cnt=weak.ratings.filter(r=>r===l).length;
                  return <div key={l} style={{flex:cnt||0.01,background:LEVELS[l].color}}/>;
                })}
              </div>

              <div style={{background:"#fff",borderRadius:10,padding:"14px 16px",border:`1.5px solid ${wP.border}`}}>
                <div style={{fontSize:11,color:wP.text,fontWeight:600,marginBottom:8}}>action plan for skyfer</div>
                <div style={{fontSize:12,color:"#555",lineHeight:1.8}}>
                  {weakLeft} chapters still need to reach <strong style={{color:"#9E9830"}}>⭐ exam ready</strong> in {weak.name}.
                  {weak.weight>=10 && <> High exam weight ({weak.weight}%) — mastering this subject has outsized score impact.</>}
                  {" "}Aim to move at least <strong style={{color:wP.text}}>{Math.ceil(weakLeft/weeksLeft)} chapters/week</strong> to exam ready before Jul 19.
                </div>
              </div>
            </div>

            {/* All ranked */}
            <div style={card()}>
              <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>all subjects ranked by confidence score</div>
              {ranked.map((s,i)=>{
                const p=PALETTE[s.key];
                const sc=subjectScore(s);
                const examReadyCnt=s.ratings.filter(r=>r===3).length;
                return(
                  <div key={s.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                    <div style={{width:18,textAlign:"right",fontSize:11,color:i===0?"#C05454":"#ccc"}}>{i+1}</div>
                    <div style={{width:68,fontSize:11,color:"#555"}}>{s.abbr}</div>
                    <div style={{flex:1,height:7,background:"#F5EEF8",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${sc}%`,background:i===0?"#F4A7A7":p.border,borderRadius:4}}/>
                    </div>
                    <div style={{width:38,textAlign:"right",fontSize:11,fontFamily:"monospace",color:i===0?"#C05454":"#aaa"}}>{sc}%</div>
                    <div style={{width:48,fontSize:10,color:"#ccc",textAlign:"right"}}>{s.weight}% wt</div>
                    <div style={{width:52,fontSize:10,color:"#9E9830",textAlign:"right"}}>⭐{examReadyCnt}/{s.chapters.length}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}