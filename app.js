// ── DATA ────────────────────────────────────────────────────────────────
const FRAMEWORKS=[
  {name:'Chain-of-Thought (CoT)',      when:'Sequential deduction, debugging, math, step-by-step implementation.',                  avoid:'Problems with multiple viable solutions — convergence too early kills alternatives.'},
  {name:'Tree-of-Thought (ToT)',        when:'Multiple viable branches. Explore, evaluate, prune, then converge.',                    avoid:'Simple linear problems where branching adds overhead without insight.'},
  {name:'First Principles',             when:'Problems with wrong assumptions baked in. Strip everything. Rebuild from ground truth.',  avoid:'Well-trodden domains where established patterns are reliable and fast.'},
  {name:'Step-Back Prompting',          when:'Over-specified or tunnel-vision problems. Abstract the goal first, then solve it.',       avoid:'Tactical well-scoped problems where abstraction adds nothing.'},
  {name:'Adversarial / Pre-mortem',     when:'Plans, strategies, business cases. Assume it fails. Work backward to why.',              avoid:'Creative tasks where adversarial framing kills generative momentum.'},
  {name:'Analogical Reasoning',         when:'Novel problems in familiar domains. Find a well-solved analog. Transfer the insight.',    avoid:'Research requiring primary evidence — pattern transfer is not a substitute.'},
  {name:'MECE Decomposition',           when:'Complex domains needing full coverage. Mutually exclusive, collectively exhaustive.',     avoid:'Creative or persuasive work — exhaustive coverage ≠ effective communication.'},
  {name:'Socratic Drilling',            when:'Vague or poorly-defined problems. Question every assumption with "why" until bedrock.',   avoid:'Well-defined time-sensitive tasks where interrogation slows execution.'},
  {name:'Chain of Verification (CoVe)', when:'Any output with verifiable factual claims. Applied as the VERIFY layer.',               avoid:'Pure creative or brainstorming tasks with no factual claims to verify.'},
  {name:'Interview Phase',              when:'Critical context is missing from the brief. Applied as a prerequisite layer.',           avoid:'Well-specified tasks where the brief already contains sufficient context.'}
];

const MODES=[
  {id:'youtube',icon:'🎬',name:'YouTube Strategist',desc:'Sequential scripting with anti-generic guardrails',
   helper:'Best for video scripts where you want to keep your voice. Forces sequential building — payoffs → setups → hooks — so you can course-correct before getting a generic blob.',
   fwTags:['Step-Back','Analogical','ToT'],stack:{p:'Step-Back',s:'Analogical',v:'—'},
   skillName:'youtube-script-architect',skillDesc:'Blunt YouTube strategist that builds scripts sequentially without sycophancy.'},
  {id:'allpurpose',icon:'🧠',name:'All-Purpose Expert',desc:'Bento-Box architecture for any complex task',
   helper:'Best for complex workflows. Strictly separates imperative instructions from raw data — prevents hallucination and context confusion.',
   fwTags:['ToT','First Principles','CoT'],stack:{p:'varies with task',s:'varies',v:'CoVe if claims present'},
   skillName:'bento-box-architect',skillDesc:'Elite prompt architect for hallucination-free Bento-Box structured prompts.'},
  {id:'code',icon:'⚙️',name:'Code Architect',desc:'Engineering decisions, zero tolerance for vague specs',
   helper:'Best for coding and architecture. Forces the AI to nail down your stack, constraints, and edge cases before touching a single line of code.',
   fwTags:['First Principles','ToT','CoVe'],stack:{p:'First Principles',s:'Tree-of-Thought',v:'CoVe'},
   skillName:'code-architect',skillDesc:'Blunt software architect for rigorous, production-grade technical solutions.'},
  {id:'business',icon:'📊',name:'Business Strategist',desc:"Devil's advocate framework for strategy and planning",
   helper:"Best for business plans and competitive analysis. Forces assumption audits, constructs counter-arguments, and exposes blind spots — no cheerleading.",
   fwTags:['Adversarial','MECE','CoVe'],stack:{p:'Adversarial',s:'MECE',v:'CoVe'},
   skillName:'business-strategist',skillDesc:"Blunt McKinsey-style strategist for pressure-testing plans and exposing weaknesses."},
  {id:'research',icon:'🔬',name:'Research Analyst',desc:'Structured deep-dive with hallucination control',
   helper:'Best for research needing accuracy. Forces Core Claims → Evidence → Caveats hierarchy with 4-level confidence tags on every claim.',
   fwTags:['MECE','Socratic','CoVe'],stack:{p:'MECE',s:'Socratic Drilling',v:'CoVe'},
   skillName:'research-analyst',skillDesc:'Blunt research analyst for structured, hallucination-free deep-dives.'},
  {id:'marketing',icon:'🎯',name:'Marketing Copywriter',desc:'Conversion-first copy with anti-fluff enforcement',
   helper:'Best for ads, landing pages, and email. Bans buzzwords by name, enforces audience psychology, delivers two copy variants with explicit persuasion mechanics.',
   fwTags:['Analogical','Step-Back','Adversarial'],stack:{p:'Analogical',s:'Step-Back + Adversarial',v:'—'},
   skillName:'marketing-copywriter',skillDesc:'Blunt direct-response copywriter for high-impact, fluff-free marketing copy.'}
];

const BLUNTNESS_LABELS=['Diplomatic','Direct','No-Filter','Brutal','Savage'];
const BLUNTNESS_RULES={
  1:'Be honest but tactful. Frame every critique constructively.',
  2:'Be direct. Skip pleasantries. Identify weaknesses clearly without softening.',
  3:'Be blunt. No padding unless earned. Flag every weakness immediately.',
  4:'Be a hostile editor. Assume the brief is flawed. Lead with what is wrong before anything else.',
  5:'Apply maximum adversarial pressure. Treat every assumption as wrong until proven otherwise. Do not soften a single critique.'
};
const BLUNTNESS_MODS={
  1:{da:'note potential weaknesses constructively for High-risk assumptions',audit:'flag genuinely problematic assumptions with clear reasoning',cove:'flag only UNKNOWN claims for removal; include all others as-is',tone:'be thorough and constructive'},
  2:{da:'construct a direct counter-argument for each High-risk assumption without softening',audit:'rate all assumptions critically; surface every High-risk one',cove:'flag SPECULATIVE and UNKNOWN for removal; include LIKELY with an explicit light hedge',tone:'be direct and specific; clarity over comfort'},
  3:{da:'build the strongest possible counter-argument for every Medium+ risk assumption',audit:'challenge every assumption — default to skepticism, not charity',cove:'flag LIKELY with hedge, SPECULATIVE explicitly to user, UNKNOWN remove entirely; only VERIFIED passes without comment',tone:'lead with problems before solutions'},
  4:{da:'treat every assumption as guilty until proven innocent — lead with failure modes before any upside',audit:'assume the idea is flawed — find the evidence first, then evaluate',cove:'treat SPECULATIVE as UNKNOWN (remove or rewrite). LIKELY requires explicit justification to include. Only VERIFIED passes.',tone:'lead with what is broken. Assume incompleteness.'},
  5:{da:'assume the entire approach fails. Prove why before considering any path to success.',audit:'maximum adversarial — assign a worst-case scenario to every assumption before evaluating it',cove:'treat SPECULATIVE as UNKNOWN. LIKELY requires primary source justification. When in doubt, remove.',tone:'assume failure is the default state. Every claim must prove itself.'}
};

let selectedMode='youtube';
let expertiseLevel='advanced';
let outputLen='detailed';
let briefTimer=null;

// ── MODAL ────────────────────────────────────────────────────────────
function openModal(){document.getElementById('modalBackdrop').classList.add('open');document.body.style.overflow='hidden';document.getElementById('helpBtn').classList.remove('pulse');localStorage.setItem('blunt_seen_v5','1')}
function closeModal(){document.getElementById('modalBackdrop').classList.remove('open');document.body.style.overflow=''}
function closeModalOnBg(e){if(e.target===document.getElementById('modalBackdrop'))closeModal()}
function switchTab(id){document.querySelectorAll('.modal-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));document.querySelectorAll('.modal-pane').forEach(p=>p.classList.toggle('active',p.id===`pane-${id}`))}
function renderFwList(){document.getElementById('fwList').innerHTML=FRAMEWORKS.map(f=>`<div class="fw-entry"><div class="fw-name">${f.name}</div><div class="fw-when"><strong>Best for:</strong> ${f.when}</div><div class="fw-avoid"><strong>Avoid when:</strong> ${f.avoid}</div></div>`).join('')}

// ── CARDS ────────────────────────────────────────────────────────────
function renderCards(){
  document.getElementById('modeGrid').innerHTML=MODES.map(m=>`
    <div class="mode-card ${m.id===selectedMode?'active':''}" onclick="pickMode('${m.id}')">
      <div class="card-dot"></div>
      <div class="card-icon">${m.icon}</div>
      <div class="card-name">${m.name}</div>
      <div class="card-desc">${m.desc}</div>
      <div class="card-fws">${m.fwTags.map(t=>`<span class="fw-tag">${t}</span>`).join('')}</div>
    </div>`).join('');
  const m=MODES.find(x=>x.id===selectedMode);
  document.getElementById('helperBox').innerHTML=`<strong>${m.icon} ${m.name}:</strong> ${m.helper}`;
  document.getElementById('stackPreview').innerHTML=`
    <span class="sp-lbl">Typical stack —</span>
    <span class="sp-badge sp-p">PRIMARY: ${m.stack.p}</span>
    <span class="sp-badge sp-s">SECONDARY: ${m.stack.s}</span>
    <span class="sp-badge sp-v">VERIFY: ${m.stack.v}</span>`;
}
function pickMode(id){selectedMode=id;renderCards()}

// ── BRIEF SCORER ──────────────────────────────────────────────────────
function analyzeBrief(text){
  const scorer=document.getElementById('briefScorer');
  const t=text.toLowerCase().trim();
  if(!t){scorer.classList.remove('vis');return}
  const signals=[
    {label:'Length',   ok:t.length>40},
    {label:'Audience', ok:/\bfor\b|audience|users|viewers|readers|customers|clients|developer|founder|team\b/.test(t)},
    {label:'Constraints',ok:/\bmust\b|cannot|can't|should not|avoid\b|\bonly\b|never\b|limit\b|budget|deadline|requirement/.test(t)},
    {label:'Goal',     ok:/\bwant\b|\bgoal\b|achieve|result|outcome|success|target|objective|increase|reduce|improve|solve|need to/.test(t)},
    {label:'Specifics',ok:/\d+/.test(text)&&t.split(' ').length>8}
  ];
  scorer.classList.add('vis');
  scorer.innerHTML=`<span class="bs-lbl">Brief signals:</span>`+signals.map(s=>`<span class="bs-pill ${s.ok?'ok':'ng'}">${s.ok?'●':'○'} ${s.label}</span>`).join('');
}

// ── CONTROLS ──────────────────────────────────────────────────────────
document.getElementById('rawIdea').addEventListener('input',function(){
  document.getElementById('charCount').textContent=this.value.length+' chars';
  clearTimeout(briefTimer);
  briefTimer=setTimeout(()=>analyzeBrief(this.value),250);
});
function toggleAdv(){document.getElementById('advBtn').classList.toggle('open');document.getElementById('advPanel').classList.toggle('vis')}
function syncBluntness(){const v=parseInt(document.getElementById('bluntSlider').value);document.getElementById('bluntVal').textContent=BLUNTNESS_LABELS[v-1]}
function setExpertise(v){expertiseLevel=v;document.querySelectorAll('.exp-btn').forEach(b=>b.classList.toggle('active',b.dataset.val===v))}
function setOutputLen(v){outputLen=v;document.querySelectorAll('.len-btn').forEach(b=>b.classList.toggle('active',b.dataset.val===v))}

// ── PROMPT BUILDERS ───────────────────────────────────────────────────
function buildAntiSyco(n){
  return `ANTI-SYCOPHANCY RULES:
* ${BLUNTNESS_RULES[n]}
* NEVER open a response with agreement, validation, or positive affirmation of any kind.
* BANNED opening words: "Great", "Certainly!", "Absolutely!", "Of course!", "Sure!", "Fascinating", "Excellent point"
* Your FIRST sentence must be your most critical observation or your most important question.
* Stay concise. Every word earns its place or gets cut.

`;
}

function buildNegativeSpace(){
  return `DO NOT PRODUCE:
* Unsolicited alternatives to your chosen approach or technique stack
* Hedging language: "it depends", "there are many ways to", "you could argue"
* End-of-section summaries of what you just did
* Motivational or encouraging framing around ordinary tasks
* Unprompted caveats that soften every recommendation
* More than one technique per stack layer

`;
}

function buildPushback(){
  return `PUSHBACK PROTOCOL:
If the user challenges your technique selection, analysis, or output:
* Defend your position with specific evidence from their brief.
* Only reverse if their counter-argument identifies a genuine factual error or new information you lacked.
* State explicitly: "Adjusting because [specific reason]" OR "Holding position because [specific reason]."
* Capitulation without a substantive reason is a sycophancy failure — treat it as such.

`;
}

function buildExpertise(level){
  const map={
    novice:'The user is a beginner. Explain concepts as you introduce them. Avoid unexplained jargon. Use analogies where helpful. Define domain-standard terms on first use.',
    intermediate:'The user has working knowledge. Assume familiarity with core concepts. Explain advanced or domain-specific terms but skip basics.',
    advanced:'The user is experienced. Skip basic explanations. Reference domain-standard patterns directly. Focus on trade-offs and edge cases.',
    expert:'The user is a domain expert. Use technical terminology without definition. Assume deep familiarity. Focus exclusively on nuance, edge cases, and non-obvious insights.'
  };
  return `EXPERTISE CALIBRATION: ${map[level]}\n\n`;
}

function buildOutputLength(len){
  const map={
    brief:'TARGET LENGTH: Brief — under 300 words per section. Prioritize directness over completeness.',
    detailed:'TARGET LENGTH: Detailed — 300–800 words per section. Cover all key points with appropriate depth.',
    full:'TARGET LENGTH: Full Coverage — 800+ words per section. No shortcuts, no omissions, complete treatment.'
  };
  return `${map[len]}\n\n`;
}

function buildTechStack(n){
  const m=BLUNTNESS_MODS[n];
  return `
━━━ TECHNIQUE STACK SELECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Read the task above. Diagnose which challenge types are present.
Self-select a compatible stack. Only include techniques that are
genuinely warranted — unused techniques dilute focus and waste tokens.

CHALLENGE TYPE → TECHNIQUE:
  Assumptions wrong or hidden         → First Principles
  Multiple viable solution paths      → Tree-of-Thought
  Linear problem, one clear path      → Chain-of-Thought
  Problem is over-specified or narrow → Step-Back Prompting
  Plan or strategy that could fail    → Adversarial / Pre-mortem
  Task needs exhaustive full coverage → MECE Decomposition
  A solved analog exists elsewhere    → Analogical Reasoning
  Task is vague or poorly defined     → Socratic Drilling
  Output contains verifiable claims   → CoVe  ← VERIFY layer, always stack last
    If selected, tag each claim:
    [VERIFIED]     Include as-is.
    [LIKELY]       Include with explicit hedge.
    [SPECULATIVE]  Flag explicitly to user or rewrite to remove.
    [UNKNOWN]      Remove entirely — do not rephrase to sound verified.
    Bluntness threshold: ${m.cove}
  Critical context is missing         → Interview Phase  ← prerequisite, always stack first

BUILD YOUR STACK:
  PRIMARY    → 1 technique for the dominant challenge type
  SECONDARY  → 1–2 techniques filling specific remaining gaps (only if needed)
  VERIFY     → CoVe if factual claims present | Interview Phase if context missing | none

CONFLICT RULES — never combine:
  ✗ CoT + ToT                          (ToT runs CoT on each branch — redundant)
  ✗ MECE + Analogical as co-primaries  (competing focus: exhaustive vs. singular transfer)
  ✗ Adversarial + Analogical as co-primaries (incompatible baseline assumptions)
  ✗ Socratic + MECE                    (Socratic questions the frame; MECE assumes the frame is correct)
  ✗ Step-Back + First Principles       (both abstract the problem but in incompatible directions)
  ✗ Analogical + First Principles      (Analogical imports assumptions; First Principles strips them)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

function buildOutputStructure(modeId,n){
  const m=BLUNTNESS_MODS[n];
  const s={
    youtube:`OUTPUT STRUCTURE:
1. Draft a structured outline with payoffs (core viewer value) for my approval. No full script yet.
   ${n>=3?'Identify the weakest payoffs first — explain specifically why they will fail to engage before proposing alternatives.':'Flag payoffs that may not resonate with the target audience.'}
2. Get my explicit approval on the payoffs before proceeding.
3. After approval — sequential expansion only: setups → tension arcs → hook → CTA. One section at a time.`,

    allpurpose:`OUTPUT STRUCTURE:
1. Generate the final task prompt using Bento-Box architecture.
   Imperative actions → <actions> XML tags. Raw data and context → <context> XML tags. Strictly separated.
2. Justify every structural decision.
   ${n>=4?'Challenge your own architecture before presenting it — identify the most likely failure point first.':''}`,

    code:`OUTPUT STRUCTURE:
1. Architecture outline first: modules, data flow, dependencies, failure points. Flag every trade-off explicitly.
   ${n>=3?`Assume the first architecture you think of is wrong. Prove why the chosen approach survives over alternatives before committing.`:'Await my approval before writing any code.'}
2. Get my approval before writing any code.
3. Implementation: clean, commented, production-ready. Business logic → <logic> tags. Config/data → <context> tags. Include error handling and a testing strategy.`,

    business:`OUTPUT STRUCTURE:
1. Assumption audit: every assumption in the idea rated High / Medium / Low risk.
   Directive: ${m.audit}
2. Devil's advocate: ${m.da}
3. Strategic output: Situation → Complication → Resolution with explicit trade-offs and ranked next actions.`,

    research:`OUTPUT STRUCTURE:
1. Scope definition: in scope, out of scope, key open questions. Await my approval.
2. All output: Core Claims → Supporting Evidence → Caveats & Contradictions → Open Questions.
3. Synthesis: clearly distinguish established fact, expert consensus, and contested claims.
   ${n>=3?'Default to skepticism on every claim until the evidence is examined.':''}`,

    marketing:`OUTPUT STRUCTURE:
BANNED WORDS — auto-fail: "game-changing","revolutionary","innovative","world-class","seamless","robust","leverage","synergy", and any adjective not backed by a specific fact.

1. Audience deconstruction: primary pain, secondary gains, biggest objection, emotional state at point of contact.
2. Copy architecture for my approval before writing.
   ${n>=3?'Assume your first proposed structure will not convert. Prove why it will before presenting it.':''}
3. Dual variants: Variant A + Variant B with different angle/hook. For each: list every persuasion principle applied and why.`
  };
  return s[modeId];
}

function buildClosing(){
  return `
━━━ YOUR FIRST REPLY: EXACT STRUCTURE REQUIRED ━━━━━━━━━━━━━━━━━━━━

ROLE:      [Confirm your expert persona — 1 sentence]
PRIMARY:   [Chosen technique — why it fits the dominant challenge]
SECONDARY: [Additional technique(s) + what specific gap each fills — or "none"]
VERIFY:    [CoVe / Interview Phase / none — with reason]
ORDER:     [How you will sequence the stack]
RULED OUT: [What you considered and rejected, and why]

If Interview Phase is in your stack →
QUESTIONS: [3–5 numbered clarifying questions only — nothing else until I respond]

If Interview Phase is NOT in your stack →
BEGIN:     [Start executing the task immediately, following your declared stack]

No preamble. No opinions. No content outside this template until the
full stack declaration is complete.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

function buildPrompt(modeId,rawIdea,persona,audience,bluntness,expertise,outLen){
  const mode=MODES.find(x=>x.id===modeId);
  const pLine=persona ?`You are specifically acting as: ${persona}.`:'';
  const aLine=audience?`\nAll output must be calibrated for this target audience: ${audience}.`:'';
  const roles={youtube:'a blunt, expert YouTube Content Strategist and Script Architect',allpurpose:'a blunt, elite-level AI Prompt Architect and Domain Expert',code:'a blunt, elite-level Software Architect and Senior Engineer',business:"a blunt, McKinsey-level Business Strategist and Devil's Advocate",research:'a blunt, expert Research Analyst and Epistemic Critic',marketing:'a blunt, conversion-obsessed Direct Response Copywriter'};
  const goals={youtube:'transform my raw video idea into a sequentially structured, high-retention YouTube script.',allpurpose:'transform my raw idea into a rigorous Bento-Box task prompt with strictly separated instructions and data.',code:'transform my technical task into a clean, production-grade engineering solution.',business:'pressure-test my idea, expose strategic weaknesses, and produce a rigorous strategic analysis.',research:'produce a structured, deeply accurate deep-dive with a clear information hierarchy and confidence-rated claims.',marketing:'produce high-impact, fluff-free marketing copy that is ruthlessly audience-focused and conversion-driven.'};
  const ctxLabels={youtube:'My raw video idea',allpurpose:'My raw idea/task',code:'My technical task/problem',business:'My business idea/question',research:'My research topic/question',marketing:'My copy task'};

  const body=`Act as ${roles[modeId]}. ${pLine} Your goal is to ${goals[modeId]}${aLine}

${buildAntiSyco(bluntness)}${buildNegativeSpace()}${buildPushback()}${buildExpertise(expertise)}${buildOutputLength(outLen)}${ctxLabels[modeId]}:
<context>
${rawIdea}
</context>
${buildTechStack(bluntness)}
${buildOutputStructure(modeId,bluntness)}
${buildClosing()}`;

  return body.replace(/\n{3,}/g,'\n\n').trim();
}

// ── GENERATE ─────────────────────────────────────────────────────────
function generate(){
  const rawIdea=document.getElementById('rawIdea').value.trim();
  if(!rawIdea){
    const ta=document.getElementById('rawIdea');
    ta.classList.add('shake');setTimeout(()=>ta.classList.remove('shake'),400);
    ta.focus();return;
  }
  const persona  =document.getElementById('personaInput').value.trim();
  const audience =document.getElementById('audienceInput').value.trim();
  const bluntness=parseInt(document.getElementById('bluntSlider').value);
  const skillMd  =document.getElementById('tSkill').checked;

  let body=buildPrompt(selectedMode,rawIdea,persona,audience,bluntness,expertiseLevel,outputLen);
  if(skillMd){const m=MODES.find(x=>x.id===selectedMode);body=`---\nname: ${m.skillName}\ndescription: ${m.skillDesc}\nlicense: Apache-2.0\nversion: "1.0"\n---\n\n${body}`}

  document.getElementById('outputTA').value=body;
  const words=body.trim().split(/\s+/).length;
  const mode=MODES.find(x=>x.id===selectedMode);
  document.getElementById('outMeta').innerHTML=`
    <span class="otag mode">${mode.icon} ${mode.name}</span>
    <span class="otag auto">⬡ stack: auto-selected</span>
    <span class="otag">Bluntness: ${BLUNTNESS_LABELS[bluntness-1]}</span>
    <span class="otag">${expertiseLevel} · ${outputLen}</span>
    <span class="otag">${words} words · ${body.length} chars</span>
    <span class="otag">${new Date().toLocaleTimeString()}</span>`;

  const sec=document.getElementById('outputSection');
  sec.style.display='block';sec.classList.remove('reveal');void sec.offsetWidth;sec.classList.add('reveal');
  setTimeout(()=>sec.scrollIntoView({behavior:'smooth',block:'start'}),80);
  saveHistory(selectedMode,rawIdea,body,bluntness,expertiseLevel,outputLen);
}

// ── OUTPUT ACTIONS ────────────────────────────────────────────────────
function copyPrompt(){
  navigator.clipboard.writeText(document.getElementById('outputTA').value).then(()=>{
    const btn=document.getElementById('copyBtn');btn.textContent='✓ Copied!';
    setTimeout(()=>btn.textContent='⊕ Copy',2000);
  });
}
function dlFile(ext){
  const text=document.getElementById('outputTA').value;
  const mode=MODES.find(x=>x.id===selectedMode);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
  a.download=`${mode.skillName}-prompt.${ext}`;a.click();URL.revokeObjectURL(a.href);
}
function clearOutput(){document.getElementById('outputSection').style.display='none';document.getElementById('outputTA').value=''}

// ── HISTORY ───────────────────────────────────────────────────────────
const HKEY='blunt_v5_history';
function saveHistory(modeId,idea,prompt,bluntness,expertise,outLen){
  let h=loadHistory();
  h.unshift({id:Date.now(),modeId,modeName:MODES.find(x=>x.id===modeId).name,
    idea:idea.substring(0,120),prompt,bluntness,expertise,outLen,time:new Date().toLocaleString()});
  if(h.length>15)h=h.slice(0,15);
  try{localStorage.setItem(HKEY,JSON.stringify(h))}catch(e){}
  renderHistory();
}
function loadHistory(){try{return JSON.parse(localStorage.getItem(HKEY))||[]}catch{return[]}}
function renderHistoryItems(h){
  const list=document.getElementById('histList');
  if(!h.length){list.innerHTML='<div class="hist-empty">No entries match.</div>';return}
  list.innerHTML=h.map(e=>`
    <div class="hist-item" onclick="restoreHistory(${e.id})">
      <div class="hist-content">
        <div class="hist-mode">${e.modeName}</div>
        <div class="hist-idea">${e.idea}${e.idea.length>=120?'…':''}</div>
        <div class="hist-meta">
          <span class="hist-badge">${BLUNTNESS_LABELS[(e.bluntness||4)-1]}</span>
          <span class="hist-badge">${e.expertise||'advanced'}</span>
          <span class="hist-badge">${e.outLen||'detailed'}</span>
        </div>
      </div>
      <div class="hist-time">${e.time}</div>
      <button class="hist-del" onclick="delHistory(event,${e.id})">✕</button>
    </div>`).join('');
}
function renderHistory(){
  const h=loadHistory();
  const sec=document.getElementById('histSection');
  if(!h.length){sec.style.display='none';return}
  sec.style.display='block';
  const q=document.getElementById('histSearch').value.toLowerCase();
  renderHistoryItems(q?h.filter(e=>e.modeName.toLowerCase().includes(q)||e.idea.toLowerCase().includes(q)):h);
}
function filterHistory(q){
  const h=loadHistory();
  const ql=q.toLowerCase();
  renderHistoryItems(ql?h.filter(e=>e.modeName.toLowerCase().includes(ql)||e.idea.toLowerCase().includes(ql)):h);
}
function restoreHistory(id){
  const e=loadHistory().find(x=>x.id===id);if(!e)return;
  document.getElementById('outputTA').value=e.prompt;
  document.getElementById('outputSection').style.display='block';
  document.getElementById('outputSection').scrollIntoView({behavior:'smooth'});
}
function delHistory(ev,id){
  ev.stopPropagation();
  let h=loadHistory().filter(x=>x.id!==id);
  try{localStorage.setItem(HKEY,JSON.stringify(h))}catch(e){}
  renderHistory();
}
function clearHistory(){try{localStorage.removeItem(HKEY)}catch(e){}document.getElementById('histSection').style.display='none'}

// ── INIT ──────────────────────────────────────────────────────────────
renderCards();renderHistory();renderFwList();
if(!localStorage.getItem('blunt_seen_v5'))document.getElementById('helpBtn').classList.add('pulse');
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeModal();
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter')generate();
});
