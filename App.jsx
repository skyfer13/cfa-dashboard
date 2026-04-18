import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const PALETTE = {
  ethics:   { bg: "#FDE8F0", border: "#F4A7C3", text: "#C0547A", dot: "#F4A7C3" },
  quant:    { bg: "#E8F0FD", border: "#A7C3F4", text: "#5474C0", dot: "#A7C3F4" },
  econ:     { bg: "#E8FDF0", border: "#A7F4C3", text: "#2D9C6A", dot: "#A7F4C3" },
  fsa:      { bg: "#FDF4E8", border: "#F4CFA7", text: "#C07830", dot: "#F4CFA7" },
  corp:     { bg: "#F0E8FD", border: "#C3A7F4", text: "#7054C0", dot: "#C3A7F4" },
  equity:   { bg: "#FDFDE8", border: "#F4F0A7", text: "#9E9830", dot: "#F4F0A7" },
  fi:       { bg: "#E8FDFD", border: "#A7EEF4", text: "#2B9BAA", dot: "#A7EEF4" },
  deriv:    { bg: "#FDE8E8", border: "#F4A7A7", text: "#C05454", dot: "#F4A7A7" },
  alt:      { bg: "#F0FDE8", border: "#C3F4A7", text: "#5AA030", dot: "#C3F4A7" },
  port:     { bg: "#FDE8F8", border: "#F4A7E8", text: "#B84CAA", dot: "#F4A7E8" },
};

const SUBJECTS = [
  { key:"ethics",  name:"Ethical & Professional Standards", abbr:"Ethics",   target:40, logged:28, weight:15,
    chapters:["Ethics and Trust","Code of Ethics","Standards I–VII","GIPS Introduction","Ethics Application","Trade Allocation"], done:[0,1,2,3] },
  { key:"quant",   name:"Quantitative Methods",              abbr:"Quant",    target:35, logged:20, weight:8,
    chapters:["Rates & Returns","Time Value of Money","Statistical Measures","Probability Trees","Portfolio Mathematics","Simulation Methods","Estimation & Inference","Hypothesis Testing","Non-Parametric Tests","Simple Linear Regression","Big Data Techniques"], done:[0,1,2,3] },
  { key:"econ",    name:"Economics",                         abbr:"Econ",     target:30, logged:30, weight:8,
    chapters:["Firm & Market Structures","Business Cycles","Fiscal Policy","Monetary Policy","Geopolitics","International Trade","Capital Flows & FX","Exchange Rate Calculations"], done:[0,1,2,3,4,5,6,7] },
  { key:"fsa",     name:"Financial Statement Analysis",      abbr:"FSA",      target:55, logged:38, weight:13,
    chapters:["Intro to FSA","Income Statements","Balance Sheets","Cash Flows I","Cash Flows II","Inventories","Long-Term Assets","Liabilities & Equity","Income Taxes","Reporting Quality","Analysis Techniques","Financial Modeling","Quality Evaluation"], done:[0,1,2,3,4,5,6,7] },
  { key:"corp",    name:"Corporate Issuers",                 abbr:"Corp",     target:20, logged:12, weight:9,
    chapters:["Organizational Forms","Investors & Stakeholders","Corporate Governance","Working Capital","Capital Investments","Capital Structure","Business Models"], done:[0,1,2] },
  { key:"equity",  name:"Equity Investments",                abbr:"Equity",   target:45, logged:22, weight:11,
    chapters:["Market Organization","Security Indexes","Market Efficiency","Equity Securities","Company Analysis: Past","Industry Analysis","Company Forecasting","Equity Valuation"], done:[0,1,2] },
  { key:"fi",      name:"Fixed Income",                      abbr:"Fixed Inc",target:45, logged:18, weight:11,
    chapters:["Instrument Features","Cash Flows & Types","Issuance & Trading","Corporate FI Markets","Government FI Markets","FI Valuation","Yield Measures (Fixed)","Yield Measures (Float)","Term Structure","Interest Rate Risk","Credit Risk","Govt Credit Analysis","Corp Credit Analysis","Securitization"], done:[0,1,2] },
  { key:"deriv",   name:"Derivatives",                       abbr:"Deriv",    target:25, logged:8,  weight:6,
    chapters:["Derivative Features","Forward & Contingent Claims","Benefits & Risks","Arbitrage & Cost of Carry","Forward Pricing","Futures Pricing","Swap Pricing","Option Pricing","Put–Call Parity"], done:[0] },
  { key:"alt",     name:"Alternative Investments",           abbr:"Alt Inv",  target:20, logged:14, weight:7,
    chapters:["Features & Methods","Performance & Returns","Private Capital","Real Estate & Infrastructure","Natural Resources","Hedge Funds","Digital Assets"], done:[0,1,2] },
  { key:"port",    name:"Portfolio Management",              abbr:"Portfolio",target:30, logged:10, weight:12,
    chapters:["Risk & Return I","Risk & Return II","Portfolio Overview","Behavioral Biases","Risk Management","Technical Analysis","Introduction to Trading"], done:[0,1] },
];

const WEEKLY = [
  {w:"Wk1",h:8},{w:"Wk2",h:12},{w:"Wk3",h:7},{w:"Wk4",h:15},
  {w:"Wk5",h:11},{w:"Wk6",h:18},{w:"Wk7",h:14},{w:"Wk8",h:20},
];

const EXAM_DATE  = new Date("2026-08-19");
const READY_DATE = new Date("2026-07-19");
const TODAY      = new Date("2026-04-19");
const daysToReady = Math.max(0, Math.ceil((READY_DATE - TODAY)/(1000*60*60*24)));
const daysToExam  = Math.max(0, Math.ceil((EXAM_DATE  - TODAY)/(1000*60*60*24)));
const weeksLeft   = Math.max(1, Math.ceil(daysToReady/7));
const totalTarget = SUBJECTS.reduce((s,x)=>s+x.target,0);

const TABS = ["overview","hours","chapters","weakest","log"];



const tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#fff",border:"1.5px solid #F4C3DC",borderRadius:10,padding:"8px 14px",fontSize:12,boxShadow:"none"}}>
      <div style={{color:"#C0547A",fontWeight:500,marginBottom:3}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:"#555"}}>{p.name}: <b>{p.value}</b></div>)}
    </div>
  );
};

export default function CFA() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("cfa_progress");
      if (saved) {
        const parsed = JSON.parse(saved);
        return SUBJECTS.map(s => {
          const match = parsed.find(x => x.key === s.key);
          return match ? { ...s, logged: match.logged, done: match.done } : s;
        });
      }
    } catch {}
    return SUBJECTS.map(s => ({ ...s, done: [...s.done] }));
  });
  const saveProgress = (newData) => {
    localStorage.setItem("cfa_progress", JSON.stringify(newData.map(s => ({ key: s.key, logged: s.logged, done: s.done }))));
  };

  const [tab, setTab] = useState("overview");
  const [inp, setInp] = useState({});
  const [open, setOpen] = useState(null);

  const saveJSON = () => {
    const payload = JSON.stringify(data.map(s => ({ key: s.key, logged: s.logged, done: s.done })), null, 2);
    const uri = "data:application/json;charset=utf-8," + encodeURIComponent(payload);
    const a = document.createElement("a");
    a.href = uri; a.download = "cfa_progress.json"; a.click();
  };

  const loadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const saved = JSON.parse(ev.target.result);
        setData(prev => prev.map(s => {
          const match = saved.find(x => x.key === s.key);
          return match ? { ...s, logged: match.logged, done: match.done } : s;
        }));
      } catch { alert("Invalid file — please use a cfa_progress.json file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportToExcel = () => {
    const rows = [];
    rows.push(["CFA Level I - Study Tracker"]);
    rows.push([`Exported: ${new Date().toLocaleDateString()}`]);
    rows.push([]);
    rows.push(["Subject","Exam Weight %","Target Hours","Logged Hours","Hours %","Chapters Done","Total Chapters","Chapters %","Hours Gap","h/wk needed"]);
    data.forEach(s => {
      const hrPct = Math.round((s.logged/s.target)*100);
      const chPct = Math.round((s.done.length/s.chapters.length)*100);
      const gap = Math.max(0, +(s.target-s.logged).toFixed(1));
      rows.push([s.name, s.weight, s.target, s.logged, hrPct+"%", s.done.length, s.chapters.length, chPct+"%", gap, Math.ceil(gap/weeksLeft)]);
    });
    rows.push([]);
    rows.push(["TOTALS","",totalTarget,data.reduce((a,s)=>a+s.logged,0)]);
    rows.push([]);
    rows.push(["--- CHAPTER DETAIL ---"]);
    rows.push(["Subject","#","Chapter","Status"]);
    data.forEach(s => {
      s.chapters.forEach((ch, idx) => {
        rows.push([s.name, idx+1, ch, s.done.includes(idx) ? "Done" : "Pending"]);
      });
    });
    const csv = rows.map(r => r.map(c => `"${String(c??'').replace(/"/g,'""')}"`).join(",")).join("\n");
    const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const a = document.createElement("a");
    a.href = uri; a.download = "cfa_study_tracker.csv"; a.click();
  };

  const totalLogged = data.reduce((s,x)=>s+x.logged,0);
  const pctHrs = Math.round((totalLogged/totalTarget)*100);
  const totalDone = data.reduce((s,x)=>s+x.done.length,0);
  const totalChaps = data.reduce((s,x)=>s+x.chapters.length,0);
  const weightedCov = Math.round(data.reduce((acc,s)=>acc+(s.done.length/s.chapters.length)*s.weight,0));

  const ranked = [...data].sort((a,b)=>{
    const sa=(a.logged/a.target)*0.5+(a.done.length/a.chapters.length)*0.5;
    const sb=(b.logged/b.target)*0.5+(b.done.length/b.chapters.length)*0.5;
    return sa-sb;
  });
  const weak = ranked[0];
  const wP = PALETTE[weak.key];
  const weakHrPct = Math.round((weak.logged/weak.target)*100);
  const weakChPct = Math.round((weak.done.length/weak.chapters.length)*100);
  const weakGap   = +(weak.target-weak.logged).toFixed(1);
  const weakHpw   = Math.ceil(weakGap/weeksLeft);
  const weakLeft  = weak.chapters.length-weak.done.length;

  const logHours = (key) => {
    const h = parseFloat(inp[key]||0);
    if (!h) return;
    setData(prev => {
      const next = prev.map(s=>s.key===key?{...s,logged:Math.min(+(s.logged+h).toFixed(1),s.target)}:s);
      saveProgress(next);
      return next;
    });
    setInp(prev=>({...prev,[key]:""}));
  };

  const toggleChap = (key,idx) => {
    setData(prev => {
      const next = prev.map(s=>{
        if(s.key!==key) return s;
        const done=s.done.includes(idx)?s.done.filter(i=>i!==idx):[...s.done,idx];
        return {...s,done};
      });
      saveProgress(next);
      return next;
    });
  };

  const btnStyle = (active) => ({
    background: active ? "#FDE8F3" : "transparent",
    border: active ? "1.5px solid #F4A7C3" : "1.5px solid #eee",
    color: active ? "#C0547A" : "#999",
    borderRadius: 20,
    padding: "5px 16px",
    fontSize: 12,
    fontWeight: active ? 500 : 400,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  });

  const card = (children, extra={}) => ({
    background:"#fff",
    border:"1.5px solid #F4E8F0",
    borderRadius:14,
    padding:"18px 20px",
    ...extra,
  });

  const pill = (p, label) => (
    <span style={{background:p.bg,border:`1.5px solid ${p.border}`,color:p.text,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:500}}>{label}</span>
  );

  return (
    <div style={{background:"#FDF8FB",minHeight:"100vh",fontFamily:"-apple-system, 'Segoe UI', sans-serif",color:"#333"}}>
      {/* Header */}
      <div style={{background:"#fff",borderBottom:"1.5px solid #F4E0EE",padding:"20px 32px 0"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:12,paddingBottom:16}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.15em",textTransform:"uppercase"}}>CFA Level I · Aug 2026</div>
            <button onClick={exportToExcel} style={{background:"#E8FDF0",border:"1.5px solid #A7F4C3",color:"#2D9C6A",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>↓ export to excel</button>
          </div>
            <h1 style={{margin:0,fontSize:26,fontWeight:600,color:"#2D2030",lineHeight:1}}>
              hey skyfer! <span style={{fontSize:20}}>✦</span>
            </h1>
            <div style={{fontSize:12,color:"#aaa",marginTop:5}}>
              ready by <span style={{color:"#5AA030",fontWeight:500}}>Jul 19</span> ({daysToReady}d) · exam <span style={{color:"#C05454",fontWeight:500}}>Aug 19</span> ({daysToExam}d)
            </div>
          </div>
          <div style={{display:"flex",gap:20}}>
            {[
              {label:"hours logged",val:`${totalLogged}h`,color:"#C0547A"},
              {label:"chapters",val:`${totalDone}/${totalChaps}`,color:"#5474C0"},
              {label:"days to ready",val:daysToReady,color:daysToReady<60?"#C05454":"#2D9C6A"},
            ].map(({label,val,color})=>(
              <div key={label} style={{textAlign:"center",background:"#FDF4F9",borderRadius:12,padding:"10px 18px",border:"1.5px solid #F4E0EE"}}>
                <div style={{fontSize:20,fontWeight:600,color,lineHeight:1}}>{val}</div>
                <div style={{fontSize:10,color:"#bbb",marginTop:4}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={btnStyle(tab===t)}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"20px 32px",maxWidth:1080,boxSizing:"border-box"}}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div>
            {/* Stat row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:16}}>
              {[
                {label:"hours done",val:`${pctHrs}%`,sub:`${totalLogged}/${totalTarget}h`,bg:"#FDE8F3",bc:"#F4A7C3",tc:"#C0547A"},
                {label:"chapters",  val:`${Math.round((totalDone/totalChaps)*100)}%`,sub:`${totalDone} of ${totalChaps}`,bg:"#E8F0FD",bc:"#A7C3F4",tc:"#5474C0"},
                {label:"on track",  val:data.filter(s=>s.logged/s.target>=0.5).length,sub:"of 10 subjects",bg:"#E8FDF0",bc:"#A7F4C3",tc:"#2D9C6A"},
                {label:"exam weight covered",val:`${weightedCov}%`,sub:"weighted",bg:"#F0E8FD",bc:"#C3A7F4",tc:"#7054C0"},
                {label:"weakest",   val:weak.abbr,sub:`${weakHrPct}% hrs · ${weakChPct}% chaps`,bg:"#FDE8E8",bc:"#F4A7A7",tc:"#C05454"},
              ].map(({label,val,sub,bg,bc,tc})=>(
                <div key={label} style={{background:bg,border:`1.5px solid ${bc}`,borderRadius:12,padding:"14px 14px 12px"}}>
                  <div style={{fontSize:10,color:tc,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6,opacity:0.7}}>{label}</div>
                  <div style={{fontSize:22,fontWeight:600,color:tc,lineHeight:1}}>{val}</div>
                  <div style={{fontSize:11,color:tc,marginTop:4,opacity:0.65}}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {/* Weekly bar chart */}
              <div style={card()}>
                <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>weekly study hours</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={WEEKLY} barSize={18}>
                    <XAxis dataKey="w" tick={{fill:"#ccc",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#ccc",fontSize:10}} axisLine={false} tickLine={false} width={20}/>
                    <Tooltip content={tip} cursor={{fill:"#FDE8F308"}}/>
                    <Bar dataKey="h" name="hours" radius={[5,5,0,0]}>
                      {WEEKLY.map((_,i)=><Cell key={i} fill={i===WEEKLY.length-1?"#F4A7C3":"#FAD5E8"}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Progress bars */}
              <div style={card()}>
                <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>hours per subject</div>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {data.map(s=>{
                    const p=PALETTE[s.key];
                    const pct=Math.min(Math.round((s.logged/s.target)*100),100);
                    return(
                      <div key={s.key}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:11,color:"#555"}}>{s.abbr}</span>
                          <span style={{fontSize:11,color:"#bbb",fontFamily:"monospace"}}>{s.logged}/{s.target}h</span>
                        </div>
                        <div style={{height:6,background:"#F5EEF8",borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:p.border,borderRadius:4}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HOURS ── */}
        {tab==="hours" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {/* Bar — chapters done vs remaining */}
            <div style={card()}>
              <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>chapters done vs remaining</div>
              <div style={{fontSize:13,color:"#888",marginBottom:12}}>
                <span style={{fontSize:20,fontWeight:600,color:"#C0547A"}}>{totalDone}</span> / {totalChaps} complete
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart layout="vertical" barSize={12}
                  data={data.map(s=>({name:s.abbr,done:s.done.length,left:s.chapters.length-s.done.length,col:PALETTE[s.key].border}))}>
                  <XAxis type="number" tick={{fill:"#ccc",fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="name" type="category" tick={{fill:"#888",fontSize:11}} axisLine={false} tickLine={false} width={60}/>
                  <Tooltip content={({active,payload,label})=>active&&payload?.length?<div style={{background:"#fff",border:"1.5px solid #F4C3DC",borderRadius:10,padding:"8px 14px",fontSize:12}}><div style={{color:"#C0547A",fontWeight:500,marginBottom:3}}>{label}</div><div style={{color:"#5AA030"}}>done: {payload[0]?.value}</div><div style={{color:"#C05454"}}>left: {payload[1]?.value}</div></div>:null}/>
                  <Bar dataKey="done" stackId="a" name="done" radius={[0,0,0,0]}>
                    {data.map((s,i)=><Cell key={i} fill={PALETTE[s.key].border}/>)}
                  </Bar>
                  <Bar dataKey="left" stackId="a" name="left" fill="#F5EEF8" radius={[0,3,3,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie — exam weightage */}
            <div style={card()}>
              <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>exam weightage</div>
              <div style={{fontSize:13,color:"#888",marginBottom:6}}>
                weighted coverage: <span style={{fontSize:20,fontWeight:600,color:"#7054C0"}}>{weightedCov}%</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.map(s=>({name:s.abbr,value:s.weight,col:PALETTE[s.key].border}))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={44} paddingAngle={2}>
                    {data.map((s,i)=><Cell key={i} fill={PALETTE[s.key].border}/>)}
                  </Pie>
                  <Tooltip content={({active,payload})=>{
                    if(!active||!payload?.length) return null;
                    const d=payload[0].payload;
                    const s=data.find(x=>x.abbr===d.name);
                    return <div style={{background:"#fff",border:"1.5px solid #F4C3DC",borderRadius:10,padding:"8px 14px",fontSize:12}}><div style={{color:PALETTE[s.key].text,fontWeight:500}}>{s.name}</div><div style={{color:"#888"}}>weight: {d.value}%</div><div style={{color:"#888"}}>chapters: {s.done.length}/{s.chapters.length}</div></div>;
                  }}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:"flex",flexWrap:"wrap",gap:"4px 10px",marginTop:6}}>
                {data.map(s=>(
                  <span key={s.key} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#aaa"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:PALETTE[s.key].border,display:"inline-block"}}/>
                    {s.abbr} {s.weight}%
                  </span>
                ))}
              </div>
            </div>

            {/* Hours/week needed */}
            <div style={{...card(),gridColumn:"1/-1"}}>
              <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>hours/week to finish by jul 19</div>
              <div style={{fontSize:12,color:"#bbb",marginBottom:14}}>{weeksLeft} weeks remaining</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10}}>
                {data.map(s=>{
                  const p=PALETTE[s.key];
                  const gap=Math.max(0,+(s.target-s.logged).toFixed(1));
                  const hpw=(gap/weeksLeft).toFixed(1);
                  const done=gap===0;
                  return(
                    <div key={s.key} style={{background:done?"#EAFDF3":p.bg,border:`1.5px solid ${done?"#A7F4C3":p.border}`,borderRadius:10,padding:"10px 12px"}}>
                      <div style={{fontSize:11,color:done?"#2D9C6A":p.text,fontWeight:500}}>{s.abbr}</div>
                      <div style={{fontSize:20,fontWeight:600,color:done?"#2D9C6A":p.text,lineHeight:1.3}}>{done?"✓":hpw+"h/wk"}</div>
                      <div style={{fontSize:10,color:"#bbb",marginTop:2}}>{done?"target met":`${gap}h left`}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── CHAPTERS ── */}
        {tab==="chapters" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {data.map(s=>{
              const p=PALETTE[s.key];
              const pct=Math.round((s.done.length/s.chapters.length)*100);
              const isOpen=open===s.key;
              return(
                <div key={s.key} style={{background:"#fff",border:`1.5px solid ${isOpen?p.border:"#F4E8F0"}`,borderRadius:13,overflow:"hidden"}}>
                  <div onClick={()=>setOpen(isOpen?null:s.key)} style={{padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:p.border,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                        <span style={{fontSize:13,fontWeight:500,color:"#333"}}>{s.name}</span>
                        {pill(p,`${s.weight}% wt`)}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{flex:1,height:5,background:"#F5EEF8",borderRadius:3,overflow:"hidden",maxWidth:200}}>
                          <div style={{height:"100%",width:`${pct}%`,background:p.border,borderRadius:3}}/>
                        </div>
                        <span style={{fontSize:11,color:"#bbb"}}>{s.done.length}/{s.chapters.length} · {pct}%</span>
                      </div>
                    </div>
                    <span style={{color:p.border,fontSize:16,transform:isOpen?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
                  </div>
                  {isOpen && (
                    <div style={{borderTop:`1.5px solid ${p.bg}`,padding:"10px 18px 14px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:6}}>
                      {s.chapters.map((ch,idx)=>{
                        const done=s.done.includes(idx);
                        return(
                          <div key={idx} onClick={()=>toggleChap(s.key,idx)} style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",padding:"6px 8px",borderRadius:8,background:done?p.bg:"transparent"}}>
                            <div style={{width:15,height:15,borderRadius:4,border:`2px solid ${done?p.text:p.border}`,background:done?p.text:"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                              {done&&<span style={{color:"#fff",fontSize:9,fontWeight:700,lineHeight:1}}>✓</span>}
                            </div>
                            <span style={{fontSize:12,color:done?p.text:"#555",textDecoration:done?"line-through":"none",lineHeight:1.5,opacity:done?0.8:1}}>
                              {idx+1}. {ch}
                            </span>
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
            {/* Rank strip */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {ranked.map((s,i)=>{
                const p=PALETTE[s.key];
                const sc=Math.round(((s.logged/s.target)*0.5+(s.done.length/s.chapters.length)*0.5)*100);
                return(
                  <span key={s.key} style={{background:i===0?"#FDE8E8":p.bg,border:`1.5px solid ${i===0?"#F4A7A7":p.border}`,color:i===0?"#C05454":p.text,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:i===0?600:400}}>
                    {i===0?"⚠ ":""}{s.abbr} {sc}%
                  </span>
                );
              })}
            </div>

            {/* Main weak card */}
            <div style={{background:wP.bg,border:`1.5px solid ${wP.border}`,borderRadius:16,padding:"22px",marginBottom:14}}>
              <div style={{fontSize:10,color:"#C05454",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>⚠ needs most attention</div>
              <div style={{fontSize:24,fontWeight:600,color:wP.text,marginBottom:4}}>{weak.name}</div>
              <div style={{fontSize:12,color:wP.text,opacity:0.7,marginBottom:18}}>exam weight: {weak.weight}%</div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
                {[
                  {label:"hours progress",val:`${weakHrPct}%`,sub:`${weak.logged}h / ${weak.target}h`},
                  {label:"chapters done",val:`${weakChPct}%`,sub:`${weak.done.length} / ${weak.chapters.length}`},
                  {label:"hours gap",val:`${weakGap}h`,sub:"still to log"},
                  {label:"need per week",val:`${weakHpw}h/wk`,sub:"to be ready jul 19"},
                ].map(({label,val,sub})=>(
                  <div key={label} style={{background:"#fff",borderRadius:10,padding:"12px 14px",border:`1.5px solid ${wP.border}`}}>
                    <div style={{fontSize:10,color:wP.text,opacity:0.6,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{label}</div>
                    <div style={{fontSize:20,fontWeight:600,color:wP.text}}>{val}</div>
                    <div style={{fontSize:10,color:wP.text,opacity:0.5,marginTop:2}}>{sub}</div>
                  </div>
                ))}
              </div>

              {[
                {label:"hours vs target",pct:weakHrPct},
                {label:"chapters done",pct:weakChPct},
              ].map(({label,pct})=>(
                <div key={label} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:wP.text}}>{label}</span>
                    <span style={{fontSize:12,color:wP.text,fontFamily:"monospace"}}>{pct}%</span>
                  </div>
                  <div style={{height:8,background:"#fff",borderRadius:5,overflow:"hidden",border:`1px solid ${wP.border}`}}>
                    <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:wP.border,borderRadius:5}}/>
                  </div>
                </div>
              ))}

              <div style={{background:"#fff",borderRadius:10,padding:"14px 16px",border:`1.5px solid ${wP.border}`,marginTop:6}}>
                <div style={{fontSize:11,color:wP.text,fontWeight:600,marginBottom:8}}>action plan for skyfer</div>
                <div style={{fontSize:12,color:"#555",lineHeight:1.8}}>
                  Log at least <strong style={{color:wP.text}}>{weakHpw}h/week</strong> on {weak.name} over {weeksLeft} weeks to be ready by Jul 19 — leaving a clean 4-week buffer before Aug 19. Tackle the <strong style={{color:wP.text}}>{weakLeft} remaining chapter{weakLeft!==1?"s":""}</strong> first, then drill practice questions.
                  {weak.weight>=10 && <> High exam weight ({weak.weight}%) means every hour here has outsized impact on your score.</>}
                </div>
              </div>
            </div>

            {/* All subjects ranking */}
            <div style={card()}>
              <div style={{fontSize:11,color:"#C0547A",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>all subjects ranked (50% hrs + 50% chapters)</div>
              {ranked.map((s,i)=>{
                const p=PALETTE[s.key];
                const sc=Math.round(((s.logged/s.target)*0.5+(s.done.length/s.chapters.length)*0.5)*100);
                const gap=Math.max(0,+(s.target-s.logged).toFixed(1));
                return(
                  <div key={s.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                    <div style={{width:18,textAlign:"right",fontSize:11,color:i===0?"#C05454":"#ccc"}}>{i+1}</div>
                    <div style={{width:68,fontSize:11,color:"#555"}}>{s.abbr}</div>
                    <div style={{flex:1,height:7,background:"#F5EEF8",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${sc}%`,background:i===0?"#F4A7A7":p.border,borderRadius:4}}/>
                    </div>
                    <div style={{width:38,textAlign:"right",fontSize:11,fontFamily:"monospace",color:i===0?"#C05454":"#aaa"}}>{sc}%</div>
                    <div style={{width:48,fontSize:10,color:"#ccc",textAlign:"right"}}>{s.weight}% wt</div>
                    <div style={{width:52,fontSize:10,color:gap>0?"#E8A730":"#5AA030",textAlign:"right"}}>{gap>0?`${Math.ceil(gap/weeksLeft)}h/wk`:"done ✓"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LOG ── */}
        {tab==="log" && (
          <div style={{maxWidth:600}}>
            <p style={{fontSize:13,color:"#aaa",marginTop:0,marginBottom:18}}>log study hours for each subject. chapter ticking is in the chapters tab.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {data.map(s=>{
                const p=PALETTE[s.key];
                const pct=Math.min(Math.round((s.logged/s.target)*100),100);
                const gap=Math.max(0,+(s.target-s.logged).toFixed(1));
                return(
                  <div key={s.key} style={{background:"#fff",border:`1.5px solid ${p.border}`,borderRadius:12,padding:"13px 16px",borderLeft:`4px solid ${p.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:"#333"}}>{s.name}</div>
                        <div style={{fontSize:11,color:"#aaa",marginTop:2}}>
                          <span style={{fontFamily:"monospace"}}>{s.logged}h/{s.target}h</span> · {pct}% ·{" "}
                          <span style={{color:p.text}}>{s.done.length}/{s.chapters.length} chapters</span>
                        </div>
                      </div>
                      <div style={{textAlign:"right",fontSize:10}}>
                        <div style={{color:"#ccc"}}>wt: {s.weight}%</div>
                        <div style={{color:gap>0?"#E8A730":"#5AA030",fontWeight:500}}>
                          {gap>0?`${Math.ceil(gap/weeksLeft)}h/wk needed`:"target met ✓"}
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <input type="number" placeholder="hours" value={inp[s.key]||""} onChange={e=>setInp(prev=>({...prev,[s.key]:e.target.value}))}
                        style={{width:72,background:"#FAF5FB",border:`1.5px solid ${p.border}`,borderRadius:8,color:"#333",padding:"6px 10px",fontSize:12,fontFamily:"monospace",outline:"none"}}/>
                      <button onClick={()=>logHours(s.key)} style={{background:p.bg,border:`1.5px solid ${p.border}`,borderRadius:8,color:p.text,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ log</button>
                      <div style={{flex:1,height:5,background:"#F5EEF8",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:pct>=100?"#A7F4C3":p.border,borderRadius:3}}/>
                      </div>
                    </div>
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