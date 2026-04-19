import React, { useState, useEffect } from 'react';
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
  { key:"ethics",  name:"Ethical & Professional Standards", abbr:"Ethics",    weight:15, chapters:["Ethics and Trust","Code of Ethics","Standards I–VII","GIPS Introduction","Ethics Application","Trade Allocation"] },
  { key:"quant",   name:"Quantitative Methods",             abbr:"Quant",     weight:8,  chapters:["Rates & Returns","Time Value of Money","Statistical Measures","Probability Trees","Portfolio Mathematics","Simulation Methods","Estimation & Inference","Hypothesis Testing","Non-Parametric Tests","Simple Linear Regression","Big Data Techniques"] },
  { key:"econ",    name:"Economics",                        abbr:"Econ",      weight:8,  chapters:["Firm & Market Structures","Business Cycles","Fiscal Policy","Monetary Policy","Geopolitics","International Trade","Capital Flows & FX","Exchange Rate Calculations"] },
  { key:"fsa",     name:"Financial Statement Analysis",     abbr:"FSA",       weight:13, chapters:["Intro to FSA","Income Statements","Balance Sheets","Cash Flows I","Cash Flows II","Inventories","Long-Term Assets","Liabilities & Equity","Income Taxes","Reporting Quality","Analysis Techniques","Financial Modeling","Quality Evaluation"] },
  { key:"corp",    name:"Corporate Issuers",                abbr:"Corp",      weight:9,  chapters:["Organizational Forms","Investors & Stakeholders","Corporate Governance","Working Capital","Capital Investments","Capital Structure","Business Models"] },
  { key:"equity",  name:"Equity Investments",               abbr:"Equity",    weight:11, chapters:["Market Organization","Security Indexes","Market Efficiency","Equity Securities","Company Analysis: Past","Industry Analysis","Company Forecasting","Equity Valuation"] },
  { key:"fi",      name:"Fixed Income",                     abbr:"Fixed Inc", weight:11, chapters:["Instrument Features","Cash Flows & Types","Issuance & Trading","Corporate FI Markets","Government FI Markets","FI Valuation","Yield Measures (Fixed)","Yield Measures (Float)","Term Structure","Interest Rate Risk","Credit Risk","Govt Credit Analysis","Corp Credit Analysis","Securitization"] },
  { key:"deriv",   name:"Derivatives",                      abbr:"Deriv",     weight:6,  chapters:["Derivative Features","Forward & Contingent Claims","Benefits & Risks","Arbitrage & Cost of Carry","Forward Pricing","Futures Pricing","Swap Pricing","Option Pricing","Put–Call Parity"] },
  { key:"alt",     name:"Alternative Investments",          abbr:"Alt Inv",   weight:7,  chapters:["Features & Methods","Performance & Returns","Private Capital","Real Estate & Infrastructure","Natural Resources","Hedge Funds","Digital Assets"] },
  { key:"port",    name:"Portfolio Management",             abbr:"Portfolio", weight:12, chapters:["Risk & Return I","Risk & Return II","Portfolio Overview","Behavioral Biases","Risk Management","Technical Analysis","Introduction to Trading"] },
];

const EXAM_DATE  = new Date("2026-08-19T09:00:00");
const READY_DATE = new Date("2026-07-19T00:00:00");
const totalChaps = SUBJECTS.reduce((s,x)=>s+x.chapters.length,0);
const weeksLeft  = Math.max(1,Math.ceil((READY_DATE-new Date())/(1000*60*60*24*7)));

const FINANCE_NEWS = [
  { title:"Fed holds rates steady amid inflation uncertainty", src:"Reuters", time:"2h ago", tag:"Monetary Policy" },
  { title:"US Treasury yields rise as bond markets reassess rate cut timeline", src:"Bloomberg", time:"3h ago", tag:"Fixed Income" },
  { title:"S&P 500 edges higher on strong corporate earnings", src:"CNBC", time:"4h ago", tag:"Equity" },
  { title:"IMF revises global growth forecast downward for 2026", src:"IMF", time:"5h ago", tag:"Economics" },
  { title:"Oil prices slip as OPEC+ signals output increase", src:"FT", time:"6h ago", tag:"Commodities" },
  { title:"India's Sensex hits record high on FII inflows", src:"Economic Times", time:"7h ago", tag:"Equity" },
  { title:"Credit spreads widen as default concerns mount in HY market", src:"WSJ", time:"8h ago", tag:"Credit" },
  { title:"Bitcoin surpasses $90k as institutional demand grows", src:"CoinDesk", time:"9h ago", tag:"Alt Investments" },
  { title:"ECB minutes reveal split on pace of rate normalisation", src:"Reuters", time:"10h ago", tag:"Monetary Policy" },
  { title:"Private equity dealmaking rebounds in Q1 2026", src:"FT", time:"11h ago", tag:"Alt Investments" },
];

const TAG_COLORS = {
  "Monetary Policy": { bg:"#E8F0FD", text:"#5474C0" },
  "Fixed Income":    { bg:"#E8FDFD", text:"#2B9BAA" },
  "Equity":          { bg:"#FDFDE8", text:"#9E9830" },
  "Economics":       { bg:"#E8FDF0", text:"#2D9C6A" },
  "Commodities":     { bg:"#FDF4E8", text:"#C07830" },
  "Credit":          { bg:"#FDE8E8", text:"#C05454" },
  "Alt Investments": { bg:"#F0E8FD", text:"#7054C0" },
};

const initData = () => {
  try {
    const saved = localStorage.getItem("cfa_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      return SUBJECTS.map(s=>{
        const match = parsed.find(x=>x.key===s.key);
        return match ? {...s,ratings:match.ratings} : {...s,ratings:new Array(s.chapters.length).fill(0)};
      });
    }
  } catch {}
  return SUBJECTS.map(s=>({...s,ratings:new Array(s.chapters.length).fill(0)}));
};

const saveData = (data) => {
  localStorage.setItem("cfa_v2", JSON.stringify(data.map(s=>({key:s.key,ratings:s.ratings}))));
};

const TABS = ["overview","subjects","chapters","weakest"];

export default function CFA() {
  const [data, setData]   = useState(initData);
  const [tab, setTab]     = useState("overview");
  const [open, setOpen]   = useState(null);
  const [now, setNow]     = useState(new Date());

  useEffect(()=>{
    const t = setInterval(()=>setNow(new Date()), 1000);
    return ()=>clearInterval(t);
  },[]);

  const getCountdown = (target) => {
    const diff = target - now;
    if (diff<=0) return {d:0,h:0,m:0,s:0};
    const d = Math.floor(diff/(1000*60*60*24));
    const h = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    const m = Math.floor((diff%(1000*60*60))/(1000*60));
    const s = Math.floor((diff%( 1000*60))/1000);
    return {d,h,m,s};
  };

  const readyCd = getCountdown(READY_DATE);
  const examCd  = getCountdown(EXAM_DATE);

  const dateStr = now.toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

  const updateRating = (key,idx,val) => {
    setData(prev=>{
      const next = prev.map(s=>{
        if (s.key!==key) return s;
        const ratings=[...s.ratings];
        ratings[idx]=ratings[idx]===val?0:val;
        return {...s,ratings};
      });
      saveData(next);
      return next;
    });
  };

  const resetAll = () => {
    if (window.confirm("Reset all ratings to zero?")) {
      const fresh = SUBJECTS.map(s=>({...s,ratings:new Array(s.chapters.length).fill(0)}));
      setData(fresh);
      localStorage.removeItem("cfa_v2");
    }
  };

  const exportCSV = () => {
    const rows=[["Subject","Chapter","Status"]];
    data.forEach(s=>s.chapters.forEach((ch,i)=>{
      rows.push([s.name,ch,LEVELS[s.ratings[i]].label]);
    }));
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const a=document.createElement("a");
    a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download="cfa_progress.csv"; a.click();
  };

  const allRatings = data.flatMap(s=>s.ratings);
  const examReady  = allRatings.filter(r=>r===3).length;
  const understood = allRatings.filter(r=>r===2).length;
  const readOnce   = allRatings.filter(r=>r===1).length;
  const notStarted = allRatings.filter(r=>r===0).length;
  const masteredPct= Math.round((examReady/totalChaps)*100);
  const progressPct= Math.round(((examReady+understood)/totalChaps)*100);

  const subjectScore = (s)=>Math.round((s.ratings.reduce((a,r)=>a+r,0)/(s.chapters.length*3))*100);
  const ranked = [...data].sort((a,b)=>subjectScore(a)-subjectScore(b));
  const weak=ranked[0]; const wP=PALETTE[weak.key];
  const weakScore=subjectScore(weak);
  const weakReady=weak.ratings.filter(r=>r===3).length;
  const weakLeft=weak.chapters.length-weakReady;

  const piData=[
    {name:"exam ready",value:examReady,  fill:"#F4F0A7"},
    {name:"understood",value:understood, fill:"#A7F4C3"},
    {name:"read once", value:readOnce,   fill:"#F4CFA7"},
    {name:"not started",value:notStarted,fill:"#F5EEF8"},
  ];

  const btn=(active)=>({
    background:active?"#FDE8F3":"transparent",
    border:active?"1.5px solid #F4A7C3":"1.5px solid #eee",
    color:active?"#C0547A":"#999",
    borderRadius:20,padding:"5px 16px",fontSize:12,
    fontWeight:active?500:400,cursor:"pointer",fontFamily:"inherit",
  });

  const card=(extra={})=>({background:"#fff",border:"1.5px solid #F4E8F0",borderRadius:14,padding:"18px 20px",...extra});

  const cdBox=(val,label)=>(
    <div style={{textAlign:"center",background:"#FDE8F3",borderRadius:10,padding:"8px 10px",minWidth:48,border:"1.5px solid #F4A7C3"}}>
      <div style={{fontSize:20,fontWeight:600,color:"#C0547A",lineHeight:1}}>{String(val).padStart(2,"0")}</div>
      <div style={{fontSize:9,color:"#F4A7C3",marginTop:2,letterSpacing:"0.08em"}}>{label}</div>
    </div>
  );

  const examCdBox=(val,label)=>(
    <div style={{textAlign:"center",background:"#FDE8E8",borderRadius:10,padding:"8px 10px",minWidth:48,border:"1.5px solid #F4A7A7"}}>
      <div style={{fontSize:20,fontWeight:600,color:"#C05454",lineHeight:1}}>{String(val).padStart(2,"0")}</div>
      <div style={{fontSize:9,color:"#F4A7A7",marginTop:2,letterSpacing:"0.08em"}}>{label}</div>
    </div>
  );

  return (
    <div style={{background:"#FDF8FB",minHeight:"100vh",fontFamily:"-apple-system,'Segoe UI',sans-serif",color:"#333"}}>

      {/* Header */}
      <div style={{background:"#fff",borderBottom:"1.5px solid #F4E0EE",padding:"16px 24px 0"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,paddingBottom:14}}>
          <div>
            <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:3}}>CFA Level I · Aug 2026</div>
            <h1 style={{margin:0,fontSize:24,fontWeight:600,color:"#2D2030",lineHeight:1}}>hey skyfer! ✦</h1>
            <div style={{fontSize:11,color:"#bbb",marginTop:4}}>{dateStr}</div>
            <div style={{fontSize:13,fontWeight:500,color:"#C0547A",marginTop:2,fontFamily:"monospace"}}>{timeStr}</div>
          </div>

          {/* Countdowns */}
          <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:10,color:"#C0547A",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6,textAlign:"center"}}>ready by Jul 19</div>
              <div style={{display:"flex",gap:5}}>
                {cdBox(readyCd.d,"days")}{cdBox(readyCd.h,"hrs")}{cdBox(readyCd.m,"min")}{cdBox(readyCd.s,"sec")}
              </div>
            </div>
            <div>
              <div style={{fontSize:10,color:"#C05454",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6,textAlign:"center"}}>exam Aug 19</div>
              <div style={{display:"flex",gap:5}}>
                {examCdBox(examCd.d,"days")}{examCdBox(examCd.h,"hrs")}{examCdBox(examCd.m,"min")}{examCdBox(examCd.s,"sec")}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {[
              {label:`⭐ ${examReady} ready`,  bg:"#FDFDE8",bc:"#F4F0A7",tc:"#9E9830"},
              {label:`🟢 ${understood} understood`, bg:"#E8FDF0",bc:"#A7F4C3",tc:"#2D9C6A"},
              {label:`🔴 ${notStarted} pending`,bg:"#FDE8E8",bc:"#F4A7A7",tc:"#C05454"},
            ].map(({label,bg,bc,tc})=>(
              <div key={label} style={{background:bg,border:`1.5px solid ${bc}`,color:tc,borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:500}}>{label}</div>
            ))}
            <button onClick={exportCSV} style={{background:"#E8FDF0",border:"1.5px solid #A7F4C3",color:"#2D9C6A",borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>↓ export</button>
            <button onClick={resetAll}  style={{background:"#FDE8E8",border:"1.5px solid #F4A7A7",color:"#C05454",borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>↺ reset</button>
          </div>
        </div>

        {/* Legend + tabs */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",gap:6}}>
            {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={btn(tab===t)}>{t}</button>)}
          </div>
          <div style={{display:"flex",gap:12}}>
            {LEVELS.map(l=>(
              <span key={l.id} style={{fontSize:10,color:"#aaa",display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:l.color,display:"inline-block"}}/>
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <div style={{height:14}}/>
      </div>

      {/* Main layout — sidebar + content */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,padding:"16px 24px",maxWidth:1200,boxSizing:"border-box"}}>

        {/* ── LEFT CONTENT ── */}
        <div>

          {tab==="overview" && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                {[
                  {label:"exam ready",     val:`${masteredPct}%`, sub:`${examReady} chapters`,       bg:"#FDFDE8",bc:"#F4F0A7",tc:"#9E9830"},
                  {label:"understood+",    val:`${progressPct}%`, sub:`${examReady+understood} chaps`,bg:"#E8FDF0",bc:"#A7F4C3",tc:"#2D9C6A"},
                  {label:"not started",    val:notStarted,        sub:"chapters",                    bg:"#FDE8E8",bc:"#F4A7A7",tc:"#C05454"},
                  {label:"weakest subject",val:weak.abbr,         sub:`${weakScore}% score`,         bg:"#FDF4E8",bc:"#F4CFA7",tc:"#C07830"},
                ].map(({label,val,sub,bg,bc,tc})=>(
                  <div key={label} style={{background:bg,border:`1.5px solid ${bc}`,borderRadius:12,padding:"12px"}}>
                    <div style={{fontSize:9,color:tc,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5,opacity:0.7}}>{label}</div>
                    <div style={{fontSize:20,fontWeight:600,color:tc,lineHeight:1}}>{val}</div>
                    <div style={{fontSize:10,color:tc,marginTop:3,opacity:0.65}}>{sub}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={card()}>
                  <div style={{fontSize:10,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>confidence per subject</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart layout="vertical" data={data.map(s=>({name:s.abbr,"⭐":s.ratings.filter(r=>r===3).length,"🟢":s.ratings.filter(r=>r===2).length,"🟡":s.ratings.filter(r=>r===1).length,"🔴":s.ratings.filter(r=>r===0).length}))} barSize={10}>
                      <XAxis type="number" tick={{fill:"#ccc",fontSize:9}} axisLine={false} tickLine={false}/>
                      <YAxis dataKey="name" type="category" tick={{fill:"#888",fontSize:10}} axisLine={false} tickLine={false} width={56}/>
                      <Tooltip/>
                      <Bar dataKey="⭐" stackId="a" fill="#F4F0A7"/>
                      <Bar dataKey="🟢" stackId="a" fill="#A7F4C3"/>
                      <Bar dataKey="🟡" stackId="a" fill="#F4CFA7"/>
                      <Bar dataKey="🔴" stackId="a" fill="#FAD5D5" radius={[0,3,3,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={card()}>
                  <div style={{fontSize:10,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>overall breakdown</div>
                  <div style={{fontSize:11,color:"#888",marginBottom:6}}><span style={{fontSize:18,fontWeight:600,color:"#9E9830"}}>{examReady}</span> of {totalChaps} exam ready</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={piData} dataKey="value" cx="50%" cy="50%" outerRadius={72} innerRadius={38} paddingAngle={2}>
                        {piData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"3px 10px",marginTop:4}}>
                    {piData.map(d=>(
                      <span key={d.name} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#aaa"}}>
                        <span style={{width:7,height:7,borderRadius:"50%",background:d.fill,display:"inline-block",border:"1px solid #ddd"}}/>
                        {d.name} ({d.value})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==="subjects" && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
              {data.map(s=>{
                const p=PALETTE[s.key]; const sc=subjectScore(s);
                const counts=[0,1,2,3].map(l=>s.ratings.filter(r=>r===l).length);
                return(
                  <div key={s.key} style={{background:"#fff",border:`1.5px solid ${p.border}`,borderRadius:14,padding:"14px",borderTop:`4px solid ${p.border}`}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#333",marginBottom:3}}>{s.name}</div>
                    <div style={{fontSize:10,color:"#bbb",marginBottom:8}}>weight: {s.weight}% · {s.chapters.length} chaps</div>
                    <div style={{display:"flex",height:7,borderRadius:4,overflow:"hidden",marginBottom:8}}>
                      {[0,1,2,3].map(l=><div key={l} style={{flex:counts[l]||0.01,background:LEVELS[l].color}}/>)}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:20,fontWeight:600,color:p.text}}>{sc}%</div>
                      <div style={{display:"flex",gap:3}}>
                        {[0,1,2,3].map(l=><span key={l} style={{fontSize:10,background:LEVELS[l].bg,color:LEVELS[l].text,borderRadius:6,padding:"2px 5px"}}>{counts[l]}</span>)}
                      </div>
                    </div>
                    <button onClick={()=>{setTab("chapters");setOpen(s.key);}} style={{marginTop:8,width:"100%",background:p.bg,border:`1.5px solid ${p.border}`,color:p.text,borderRadius:8,padding:"5px",fontSize:10,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>rate chapters →</button>
                  </div>
                );
              })}
            </div>
          )}

          {tab==="chapters" && (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {data.map(s=>{
                const p=PALETTE[s.key]; const sc=subjectScore(s); const isOpen=open===s.key;
                return(
                  <div key={s.key} style={{background:"#fff",border:`1.5px solid ${isOpen?p.border:"#F4E8F0"}`,borderRadius:13,overflow:"hidden"}}>
                    <div onClick={()=>setOpen(isOpen?null:s.key)} style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:9,height:9,borderRadius:"50%",background:p.border,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                          <span style={{fontSize:12,fontWeight:500,color:"#333"}}>{s.name}</span>
                          <span style={{background:p.bg,border:`1.5px solid ${p.border}`,color:p.text,borderRadius:20,padding:"1px 8px",fontSize:10}}>{s.weight}% wt</span>
                        </div>
                        <div style={{display:"flex",height:4,borderRadius:3,overflow:"hidden",maxWidth:180}}>
                          {[0,1,2,3].map(l=>{const cnt=s.ratings.filter(r=>r===l).length;return<div key={l} style={{flex:cnt||0.01,background:LEVELS[l].color}}/>;},)}
                        </div>
                      </div>
                      <span style={{fontSize:12,fontWeight:600,color:p.text}}>{sc}%</span>
                      <span style={{color:p.border,fontSize:15,transform:isOpen?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
                    </div>
                    {isOpen&&(
                      <div style={{borderTop:`1.5px solid ${p.bg}`,padding:"10px 16px 14px"}}>
                        <div style={{fontSize:10,color:"#bbb",marginBottom:8}}>tap a level to rate — tap again to undo</div>
                        {s.chapters.map((ch,idx)=>{
                          const rating=s.ratings[idx];
                          return(
                            <div key={idx} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #FAF0F5"}}>
                              <span style={{fontSize:11,color:"#555",flex:1,lineHeight:1.4}}>{idx+1}. {ch}</span>
                              <div style={{display:"flex",gap:4}}>
                                {LEVELS.map(l=>(
                                  <button key={l.id} onClick={()=>updateRating(s.key,idx,l.id)} title={l.label}
                                    style={{width:26,height:26,borderRadius:7,border:`1.5px solid ${rating===l.id?l.color:"#eee"}`,background:rating===l.id?l.bg:"transparent",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
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

          {tab==="weakest" && (
            <div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                {ranked.map((s,i)=>{const p=PALETTE[s.key];const sc=subjectScore(s);return(
                  <span key={s.key} style={{background:i===0?"#FDE8E8":p.bg,border:`1.5px solid ${i===0?"#F4A7A7":p.border}`,color:i===0?"#C05454":p.text,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:i===0?600:400}}>
                    {i===0?"⚠ ":""}{s.abbr} {sc}%
                  </span>
                );})}
              </div>
              <div style={{background:wP.bg,border:`1.5px solid ${wP.border}`,borderRadius:16,padding:"20px",marginBottom:12}}>
                <div style={{fontSize:9,color:"#C05454",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:5}}>⚠ needs most attention</div>
                <div style={{fontSize:22,fontWeight:600,color:wP.text,marginBottom:3}}>{weak.name}</div>
                <div style={{fontSize:11,color:wP.text,opacity:0.7,marginBottom:16}}>exam weight: {weak.weight}% · {weak.chapters.length} chapters</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                  {LEVELS.map(l=>{const cnt=weak.ratings.filter(r=>r===l.id).length;return(
                    <div key={l.id} style={{background:"#fff",borderRadius:10,padding:"10px",border:`1.5px solid ${l.color}`,textAlign:"center"}}>
                      <div style={{fontSize:18,marginBottom:3}}>{l.emoji}</div>
                      <div style={{fontSize:16,fontWeight:600,color:l.text}}>{cnt}</div>
                      <div style={{fontSize:9,color:"#bbb",marginTop:1}}>{l.label}</div>
                    </div>
                  );})}
                </div>
                <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:14}}>
                  {[0,1,2,3].map(l=>{const cnt=weak.ratings.filter(r=>r===l).length;return<div key={l} style={{flex:cnt||0.01,background:LEVELS[l].color}}/>;},)}
                </div>
                <div style={{background:"#fff",borderRadius:10,padding:"12px 14px",border:`1.5px solid ${wP.border}`}}>
                  <div style={{fontSize:10,color:wP.text,fontWeight:600,marginBottom:6}}>action plan for skyfer</div>
                  <div style={{fontSize:11,color:"#555",lineHeight:1.8}}>
                    {weakLeft} chapters still need ⭐ exam ready in {weak.name}.{weak.weight>=10?` High weight (${weak.weight}%) — high impact on score.`:""} Aim for <strong style={{color:wP.text}}>{Math.ceil(weakLeft/weeksLeft)} chapters/week</strong> to be ready by Jul 19.
                  </div>
                </div>
              </div>
              <div style={card()}>
                <div style={{fontSize:10,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>all subjects ranked</div>
                {ranked.map((s,i)=>{const p=PALETTE[s.key];const sc=subjectScore(s);const er=s.ratings.filter(r=>r===3).length;return(
                  <div key={s.key} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:16,textAlign:"right",fontSize:10,color:i===0?"#C05454":"#ccc"}}>{i+1}</div>
                    <div style={{width:60,fontSize:10,color:"#555"}}>{s.abbr}</div>
                    <div style={{flex:1,height:6,background:"#F5EEF8",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${sc}%`,background:i===0?"#F4A7A7":p.border,borderRadius:3}}/>
                    </div>
                    <div style={{width:32,textAlign:"right",fontSize:10,fontFamily:"monospace",color:i===0?"#C05454":"#aaa"}}>{sc}%</div>
                    <div style={{width:42,fontSize:9,color:"#ccc",textAlign:"right"}}>{s.weight}% wt</div>
                    <div style={{width:46,fontSize:9,color:"#9E9830",textAlign:"right"}}>⭐{er}/{s.chapters.length}</div>
                  </div>
                );})}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR — News ── */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#fff",border:"1.5px solid #F4E8F0",borderRadius:14,padding:"16px",position:"sticky",top:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:10,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:500}}>finance news</div>
              <span style={{fontSize:9,color:"#bbb"}}>{now.toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {FINANCE_NEWS.map((n,i)=>{
                const tc=TAG_COLORS[n.tag]||{bg:"#F5EEF8",text:"#888"};
                return(
                  <div key={i} style={{paddingBottom:10,borderBottom:i<FINANCE_NEWS.length-1?"1px solid #FAF0F5":"none"}}>
                    <div style={{fontSize:11,color:"#333",lineHeight:1.5,marginBottom:5,fontWeight:500}}>{n.title}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:9,background:tc.bg,color:tc.text,borderRadius:8,padding:"2px 7px"}}>{n.tag}</span>
                      <span style={{fontSize:9,color:"#bbb"}}>{n.src}</span>
                      <span style={{fontSize:9,color:"#ddd"}}>·</span>
                      <span style={{fontSize:9,color:"#bbb"}}>{n.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:10,fontSize:9,color:"#ddd",textAlign:"center"}}>headlines refresh daily · connect to live feed for real-time news</div>
          </div>
        </div>
      </div>
    </div>
  );
}
