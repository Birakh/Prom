// ── DATA ─────────────────────────────────────────────────────────────
const FRAMEWORKS=[
  {name:'Chain-of-Thought (CoT)',      when:'Sequential deduction, debugging, math, step-by-step implementation.',                  avoid:'Problems with multiple viable solutions — convergence too early kills alternatives.'},
  {name:'Tree-of-Thought (ToT)',        when:'Multiple viable branches. Explore, evaluate, prune, then converge.',                    avoid:'Simple linear problems where branching adds overhead without insight.'},
  {name:'First Principles',             when:'Problems with wrong assumptions baked in. Strip everything. Rebuild from ground truth.',  avoid:'Well-trodden domains where established patterns are reliable and fast.'},
  {name:'Step-Back Prompting',          when:'Over-specified or tunnel-vision problems. Abstract the goal first, then solve it.',       avoid:'Tactical well-scoped problems where abstraction adds nothing.'},
  {name:'Adversarial / Pre-mortem',     when:'Plans, strategies, business cases. Assume it fails. Work backward to why.',              avoid:'Creative tasks where adversarial framing kills generative momentum.'},
  {name:'Analogical Reasoning',         when:'Novel problems in familiar domains. Find a well-solved analog. Transfer the insight.',    avoid:'Research requiring primary evidence — pattern transfer is not a substitute.'},
  {name:'MECE Decomposition',           when:'Complex domains needing full coverage. Mutually exclusive, collectively exhaustive.',     avoid:'Creative or persuasive work — exhaustive coverage is not the same as effective.'},
  {name:'Socratic Drilling',            when:'Vague or poorly-defined problems. Question every assumption with "why" until bedrock.',   avoid:'Well-defined time-sensitive tasks where interrogation slows execution.'},
  {name:'Chain of Verification (CoVe)', when:'Any output with verifiable factual claims. Applied as the VERIFY layer.',               avoid:'Pure creative or brainstorming tasks with no factual claims to verify.'},
  {name:'Interview Phase',              when:'Critical context is missing from the brief. Applied as a prerequisite layer.',           avoid:'Well-specified tasks where the brief already contains sufficient context.'}
];

const MODES=[
  {id:'youtube',    icon:'🎬', name:'YouTube Strategist',   desc:'Sequential scripting with anti-generic guardrails',
   helper:'Best for video scripts where you want to keep your voice. Forces sequential building — payoffs → setups → hooks — so you can course-correct before getting a generic blob.',
   fwTags:['Step-Back','Analogical','ToT'],   stack:{p:'Step-Back',s:'Analogical',v:'—'},
   skillName:'youtube-script-architect',      skillDesc:'Blunt YouTube strategist that builds scripts sequentially without sycophancy.'},
  {id:'allpurpose', icon:'🧠', name:'All-Purpose Expert',   desc:'Bento-Box architecture for any complex task',
   helper:'Best for complex workflows. Strictly separates imperative instructions from raw data — prevents hallucination and context confusion.',
   fwTags:['ToT','First Principles','CoT'],   stack:{p:'varies with task',s:'varies',v:'CoVe if claims present'},
   skillName:'bento-box-architect',           skillDesc:'Elite prompt architect for hallucination-free Bento-Box structured prompts.'},
  {id:'code',       icon:'⚙️', name:'Code Architect',       desc:'Engineering decisions, zero tolerance for vague specs',
   helper:'Best for coding and architecture. Forces the AI to nail down your stack, constraints, and edge cases before touching a single line of code.',
   fwTags:['First Principles','ToT','CoVe'],  stack:{p:'First Principles',s:'Tree-of-Thought',v:'CoVe'},
   skillName:'code-architect',               skillDesc:'Blunt software architect for rigorous, production-grade technical solutions.'},
  {id:'business',   icon:'📊', name:'Business Strategist',  desc:"Devil's advocate framework for strategy and planning",
   helper:"Best for business plans and competitive analysis. Forces assumption audits, constructs counter-arguments, and exposes blind spots — no cheerleading.",
   fwTags:['Adversarial','MECE','CoVe'],      stack:{p:'Adversarial',s:'MECE',v:'CoVe'},
   skillName:'business-strategist',          skillDesc:"Blunt McKinsey-style strategist for pressure-testing plans and exposing weaknesses."},
  {id:'research',   icon:'🔬', name:'Research Analyst',     desc:'Structured deep-dive with hallucination control',
   helper:'Best for research needing accuracy. Forces Core Claims → Evidence → Caveats hierarchy with 4-level confidence tags on every claim.',
   fwTags:['MECE','Socratic','CoVe'],         stack:{p:'MECE',s:'Socratic Drilling',v:'CoVe'},
   skillName:'research-analyst',             skillDesc:'Blunt research analyst for structured, hallucination-free deep-dives.'},
  {id:'marketing',  icon:'🎯', name:'Marketing Copywriter', desc:'Conversion-first copy with anti-fluff enforcement',
   helper:'Best for ads, landing pages, and email. Bans buzzwords by name, enforces audience psychology, delivers two copy variants with explicit persuasion mechanics.',
   fwTags:['Analogical','Step-Back','Adversarial'], stack:{p:'Analogical',s:'Step-Back + Adversarial',v:'—'},
   skillName:'marketing-copywriter',         skillDesc:'Blunt direct-response copywriter for high-impact, fluff-free marketing copy.'}
];

// V6: 8 recommended dual-mode combinations
const USEFUL_PAIRS=[
  {ids:['code','business'],    icon:'⚙️📊', label:'Technical Co-Founder',    desc:'Architecture + strategy in one session'},
  {ids:['code','research'],    icon:'⚙️🔬', label:'Technical Deep-Dive',      desc:'Implementation + evidence-based analysis'},
  {ids:['business','marketing'],icon:'📊🎯',label:'Go-to-Market',             desc:'Strategy + conversion copy'},
  {ids:['youtube','marketing'], icon:'🎬🎯', label:'Content Creator',          desc:'Script + promotional copy'},
  {ids:['research','business'], icon:'🔬📊', label:'Market Intelligence',      desc:'Deep research → strategic output'},
  {ids:['code','allpurpose'],   icon:'⚙️🧠', label:'Dev Prompt Builder',       desc:'Code task + custom prompt architecture'},
  {ids:['business','allpurpose'],icon:'📊🧠',label:'Strategy Prompt Builder',  desc:'Business analysis + structured prompt'},
  {ids:['research','marketing'],icon:'🔬🎯', label:'Evidence-Based Copy',      desc:'Research findings → persuasive copy'}
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
  4:{da:'treat every assumption as guilty until proven innocent — lead with failure modes before any upside',audit:'assume the idea is flawed — find the evidence first, then evaluate',cove:'treat SPECULATIVE as UNKNOWN (remove or rewrite). LIKELY requires explicit justification. Only VERIFIED passes.',tone:'lead with what is broken. Assume incompleteness.'},
  5:{da:'assume the entire approach fails. Prove why before considering any path to success.',audit:'maximum adversarial — assign a worst-case scenario to every assumption before evaluating it',cove:'treat SPECULATIVE as UNKNOWN. LIKELY requires primary source justification. When in doubt, remove.',tone:'assume failure is the default state. Every claim must prove itself.'}
};


// ── V7: TEMPLATE STARTERS ────────────────────────────────────────────
const STARTER_TEMPLATES=[
  {id:'_yt',  modeId:'youtube',    name:'YouTube script',
   brief:'Script for my [Xk] subscriber channel targeting [demographic, age range].\nTopic: [topic].\nUnique angle: [differentiator — what makes this different from existing videos].\nLength: [X] minutes. Hook within [X] seconds.\nTone: [conversational / educational / story-driven].'},
  {id:'_code',modeId:'code',       name:'Code task',
   brief:'Build [what] using [stack and versions].\nTarget users: [who and their context].\nConstraints: [what to avoid or limit].\nPerformance requirement: [if any].\nDone = [specific definition of done with measurable criteria].'},
  {id:'_biz', modeId:'business',   name:'Business validation',
   brief:'Validating [idea] for [specific market].\nCompeting with [named competitors].\nProposed differentiator: [what exactly].\nBudget/runway: [amount].\nKey question to answer: [the one thing that determines go/no-go].'},
  {id:'_res', modeId:'research',   name:'Research brief',
   brief:'Deep research on [topic].\nPurpose: [what this informs or decides].\nRequired depth: [surface / thorough / exhaustive].\nAcceptable sources: [academic / industry / any].\nOutput format: [structure you need].\nKey open questions: [what you most need answered].'},
  {id:'_mkt', modeId:'marketing',  name:'Marketing copy',
   brief:'Copy for [channel: ad / email / landing page] targeting [audience with emotional context].\nGoal: [single desired action].\n#1 objection to overcome: [specific objection].\nTone: [direct / conversational / urgent].\nConstraint: [word limit or brand rules if any].'},
  {id:'_ap',  modeId:'allpurpose', name:'Complex task',
   brief:'Task: [exactly what needs to be done].\nContext: [relevant background].\nConstraints: [limits, requirements, what to avoid].\nOutput format: [how you want the result structured].\nDone when: [specific completion criteria].'}
];
const TKEY='blunt_v18_templates';

// ── V7: STATE ─────────────────────────────────────────────────────────
let diffBaseId=null;


// ── V9: MODE-SPECIFIC DEFAULT BLUNTNESS ──────────────────────────────
const MODE_BLUNTNESS={youtube:3,allpurpose:4,code:3,business:4,research:3,marketing:3};

// ── V9: DEFAULTS KEY ──────────────────────────────────────────────────
const DKEY='blunt_v18_defaults';
let _defTimer=null;

// V6: multi-mode state (1 or 2 selected)
let selectedModes=['youtube'];
let expertiseLevel='advanced';
let outputLen='detailed';
let briefTimer=null;

// ── HELPERS ───────────────────────────────────────────────────────────
function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function isRecommendedPair(a,b){return USEFUL_PAIRS.some(p=>(p.ids[0]===a&&p.ids[1]===b)||(p.ids[0]===b&&p.ids[1]===a))}
function isActivePair(ids){return selectedModes.length===2&&((selectedModes[0]===ids[0]&&selectedModes[1]===ids[1])||(selectedModes[0]===ids[1]&&selectedModes[1]===ids[0]))}

// ── MODAL ─────────────────────────────────────────────────────────────
function openModal(){document.getElementById('modalBackdrop').classList.add('open');document.body.style.overflow='hidden';document.getElementById('helpBtn').classList.remove('pulse');localStorage.setItem('blunt_seen_v18','1')}
function closeModal(){document.getElementById('modalBackdrop').classList.remove('open');document.body.style.overflow=''}
function closeModalOnBg(e){if(e.target===document.getElementById('modalBackdrop'))closeModal()}
function switchTab(id){document.querySelectorAll('.modal-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));document.querySelectorAll('.modal-pane').forEach(p=>p.classList.toggle('active',p.id===`pane-${id}`))}
function renderFwList(){document.getElementById('fwList').innerHTML=FRAMEWORKS.map(f=>`<div class="fw-entry"><div class="fw-name">${f.name}</div><div class="fw-when"><strong>Best for:</strong> ${f.when}</div><div class="fw-avoid"><strong>Avoid when:</strong> ${f.avoid}</div></div>`).join('')}

// ── CARDS + PAIRS ─────────────────────────────────────────────────────
function renderCards(){
  document.getElementById('modeGrid').innerHTML=MODES.map(m=>{
    const selIdx=selectedModes.indexOf(m.id);
    const isSelected=selIdx!==-1;
    const badge=selIdx===0?'1':selIdx===1?'2':'';
    const isPair=selectedModes.length===1&&selectedModes[0]!==m.id&&isRecommendedPair(selectedModes[0],m.id);
    return `<div class="mode-card ${isSelected?'active':''}" onclick="pickMode('${m.id}')">
      <div class="card-num">${badge}</div>
      <div class="card-icon">${m.icon}</div>
      <div class="card-name">${m.name}</div>
      <div class="card-desc">${m.desc}</div>
      <div class="card-fws">${m.fwTags.map(t=>`<span class="fw-tag">${t}</span>`).join('')}</div>
      ${isPair?'<div class="pair-badge">✦ pairs well</div>':''}
    </div>`;
  }).join('');

  if(selectedModes.length===1){
    const m=MODES.find(x=>x.id===selectedModes[0]);
    document.getElementById('helperBox').innerHTML=`<strong>${m.icon} ${m.name}:</strong> ${m.helper}`;
    document.getElementById('stackPreview').innerHTML=`<span class="sp-lbl">Typical stack —</span><span class="sp-badge sp-p">PRIMARY: ${m.stack.p}</span><span class="sp-badge sp-s">SECONDARY: ${m.stack.s}</span><span class="sp-badge sp-v">VERIFY: ${m.stack.v}</span>`;
  } else {
    const m1=MODES.find(x=>x.id===selectedModes[0]);
    const m2=MODES.find(x=>x.id===selectedModes[1]);
    const pair=USEFUL_PAIRS.find(p=>isActivePair(p.ids));
    document.getElementById('helperBox').innerHTML=`<strong>${m1.icon} ${m1.name} + ${m2.icon} ${m2.name}${pair?` — ${pair.label}`:''}</strong><br><span style="opacity:.8">${pair?pair.desc:'Two-phase session. Phase 1 completes before Phase 2 begins.'}</span>`;
    document.getElementById('stackPreview').innerHTML=`<span class="sp-badge sp-p">Phase 1: ${m1.name}</span><span class="sp-lbl">→</span><span class="sp-badge sp-s">Phase 2: ${m2.name}</span><span class="sp-badge sp-v">stack: auto-selected for both</span>`;
  }
  renderPairs();
}

function pickMode(id){
  const prev=selectedModes[0];
  const idx=selectedModes.indexOf(id);
  if(idx!==-1){if(selectedModes.length>1)selectedModes.splice(idx,1)}
  else if(selectedModes.length<2){selectedModes.push(id)}
  else{selectedModes[1]=id}
  // V9: mode-specific default bluntness on primary mode change
  if(selectedModes[0]!==prev&&MODE_BLUNTNESS[selectedModes[0]]){
    document.getElementById('bluntSlider').value=MODE_BLUNTNESS[selectedModes[0]];
    syncBluntness();
  }
  renderCards();
  renderCalibrationInsights();
  scheduleDefaultsSave();
}

function renderPairs(){
  document.getElementById('pairsRow').innerHTML=
    `<span class="pairs-lbl">Popular dual-mode:</span>`+
    USEFUL_PAIRS.map(p=>`<button class="pair-chip${isActivePair(p.ids)?' active':''}" onclick="selectPair('${p.ids[0]}','${p.ids[1]}')">${p.icon} ${p.label}</button>`).join('');
}

function selectPair(a,b){selectedModes=[a,b];renderCards()}

// ── BRIEF SCORER V2 ───────────────────────────────────────────────────
const VAGUE_WORDS=['something','interesting','stuff','things','nice','great','cool','awesome','amazing','better','good','some','etc','maybe','perhaps','kind of','sort of','a bit','very','really','whatever','general'];

function analyzeBrief(text){
  const scorer=document.getElementById('briefScorer');
  const words=text.trim().split(/\s+/).filter(w=>w.length>1);
  const t=text.toLowerCase();
  if(!t.trim()){scorer.classList.remove('vis');return}
  scorer.classList.add('vis');

  if(words.length<15){
    scorer.innerHTML=`<span class="bs-lbl">Brief quality:</span><span class="bs-pill ng">○ Too short — add audience, goal, and constraints</span>`;
    return;
  }

  const vagueFound=VAGUE_WORDS.filter(w=>t.includes(w));
  const vagueRatio=vagueFound.length/words.length;

  const signals=[
    {label:'Audience defined',    ok:/\bfor\b|audience|users|viewers|readers|customers|clients|developer|founder|team\b|people who/.test(t)},
    {label:'Constraints present', ok:/\bmust\b|cannot|can't|should not|avoid\b|\bonly\b|never\b|limit\b|budget|deadline|requirement|constraint/.test(t)},
    {label:'Goal stated',         ok:/\bwant to\b|\bgoal\b|achieve|result|outcome|success|target|objective|increase|reduce|improve|solve|need to|trying to/.test(t)},
    {label:'Specifics included',  ok:/\d+/.test(text)||(t.split(' ').length>20)},
    {label:'No vague language',   ok:vagueRatio<0.04},
    {label:'Measurable goal',     ok:/\d[\d,.]*\s*(%|k|m|x|\$)|from .+ to |increase|decrease|reduce|double|triple|within \d|in \d+ month/.test(t)}
  ];

  const pills=signals.map(s=>`<span class="bs-pill ${s.ok?'ok':'ng'}">${s.ok?'●':'○'} ${s.label}</span>`).join('');
  const vw=vagueFound.length>0?`<span class="bs-pill ng">⚠ Vague: "${vagueFound.slice(0,3).join('", "')}"</span>`:'';
  scorer.innerHTML=`<span class="bs-lbl">Brief quality:</span>${pills}${vw}`;
}

// ── CONTROLS ──────────────────────────────────────────────────────────
document.getElementById('rawIdea').addEventListener('input',function(){
  const l=this.value.length;document.getElementById('charCount').textContent=l+' chars · ~'+estimateTokens(this.value)+' tokens';
  clearTimeout(briefTimer);briefTimer=setTimeout(()=>analyzeBrief(this.value),250);
});

document.getElementById('minimalIdea').addEventListener('input',function(){
  const l=this.value.length;
  document.getElementById('minimalCharCount').textContent=l+' chars · ~'+estimateTokens(this.value)+' tokens';
});
function toggleAdv(){document.getElementById('advBtn').classList.toggle('open');document.getElementById('advPanel').classList.toggle('vis')}

// ── V14: QUICK / FULL MODE ───────────────────────────────────────────
const UIKEY='blunt_v18_uimode';

function setUIMode(mode){
  const isQuick=mode==='quick';
  document.body.classList.toggle('quick-mode',isQuick);
  document.getElementById('msQuick').classList.toggle('active',isQuick);
  document.getElementById('msFull').classList.toggle('active',!isQuick);
  try{localStorage.setItem(UIKEY,mode)}catch(e){}
}

function loadUIMode(){
  let mode='quick';
  try{const saved=localStorage.getItem(UIKEY);if(saved==='full'||saved==='quick')mode=saved;}catch(e){}
  setUIMode(mode);
}

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
* BRIEF SYCOPHANCY: Challenge the framing of the brief itself if the underlying premise is flawed. Do not answer a wrong question correctly. If a better question exists beneath the one asked, state it first.
* SCOPE: Answer only what was asked. If you identify an important adjacent question, flag it as ADJACENT QUESTION: [question] — do not answer it unless instructed.

`;}

function buildNegativeSpace(){
  return `DO NOT PRODUCE:
* Unsolicited alternatives to your chosen approach or technique stack
* Hedging language: "it depends", "there are many ways to", "you could argue"
* End-of-section summaries of what you just did
* Motivational or encouraging framing around ordinary tasks
* Unprompted caveats that soften every recommendation
* More than one technique per stack layer

`;}

function buildPushback(){
  return `PUSHBACK PROTOCOL:
If the user challenges your technique selection, analysis, or output:
* Defend your position with specific evidence from their brief.
* Only reverse if their counter-argument identifies a genuine factual error or new information you lacked.
* State explicitly: "Adjusting because [specific reason]" OR "Holding position because [specific reason]."
* Capitulation without a substantive reason is a sycophancy failure — treat it as such.

`;}

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
    brief:'TARGET LENGTH: Brief — under 300 words per section. Prioritise directness over completeness.',
    detailed:'TARGET LENGTH: Detailed — 300–800 words per section. Cover all key points with appropriate depth.',
    full:'TARGET LENGTH: Full Coverage — 800+ words per section. No shortcuts, no omissions, complete treatment.'
  };
  return `${map[len]}\n\n`;
}

function buildTechStack(n){
  const m=BLUNTNESS_MODS[n];
  return `
━━━ TECHNIQUE SELECTION — DECISION TREE ━━━━━━━━━━━━━━━━━━━━━━

Follow in strict order. Stop at first YES.

PREREQUISITES:
  Critical context missing? YES → Interview Phase first. Stop here.
  Output has verifiable factual claims? YES → CoVe is mandatory VERIFY layer.
    [VERIFIED] Include as-is. [LIKELY] Include with hedge.
    [SPECULATIVE] Flag explicitly or rewrite. [UNKNOWN] Remove entirely.
    Bluntness threshold: ${m.cove}

PRIMARY — first YES is your choice:
  Plan, strategy, or prediction that could fail?    → Adversarial / Pre-mortem
  Brief contains assumptions probably wrong?        → First Principles
  Task vague or poorly scoped after careful reading? → Socratic Drilling
  Task needs exhaustive complete domain coverage?   → MECE Decomposition
  Well-solved analog exists in a different field?   → Analogical Reasoning
  Multiple viable solution paths worth comparing?   → Tree-of-Thought
  Default (clear task, one path, nothing above):    → Chain-of-Thought

SECONDARY — only if a genuine gap remains:
  Name the specific gap in one sentence before adding a secondary.
  Cannot name it precisely? Do not add one.

CONFLICTS — never combine:
  ✗ CoT+ToT  ✗ MECE+Analogical (co-primary)  ✗ Adversarial+Analogical (co-primary)
  ✗ Socratic+MECE  ✗ Step-Back+First Principles  ✗ Analogical+First Principles

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;}

function buildOutputStructure(modeId,n){
  const m=BLUNTNESS_MODS[n];
  const s={
    youtube:`OUTPUT STRUCTURE:
1. Draft outline with payoffs first — no full script yet.
   ${n>=3?'Flag the weakest payoff and explain exactly why it will fail to retain viewers.':'Flag payoffs that may not resonate with the target audience.'}
PAYOFF CONSTRAINT: Each payoff = [viewer transformation] not [topic covered].
   Transformation test: "viewer learns X" is a topic. "Viewer can now do X they could not before" is a transformation.
   Uniqueness test: swap topic for a competitor topic — does payoff still work? If yes — too generic.
2. Get my explicit approval on payoffs before proceeding to full script.
3. Sequential expansion after approval: setups → tension → hook → CTA. One section at a time.`,

    allpurpose:`OUTPUT STRUCTURE:
1. ACTUAL TASK: [what is really being asked — precise, no padding]
   QUALITY TEST: [how will we both know if the output is good?]
   SCOPE BOUNDARY: [what is explicitly not in this response]
2. Bento-Box prompt: actions → <actions> tags | data/context → <context> tags. Strictly separated.
3. Justify every structural decision.
   ${n>=4?'Challenge your own structure first — name the most likely failure point before presenting.':''}`,

    code:`OUTPUT STRUCTURE:
1. Architecture outline. No code until approved.
COMPONENT CONSTRAINT: [Name] — [single responsibility] — [specific failure mode under named condition]
   Single responsibility rule: if you write "and" in a responsibility — split the component.
   Failure mode rule: "may fail under load" is unacceptable.
     Required: "fails when [specific condition] because [specific mechanism]"
   Trade-off rule: state what you are giving up with this approach — not only what you gain.
2. My approval required before writing any code.
3. Implementation: clean, commented, production-ready.
   Business logic → <logic> | Config/data → <context>. Include error handling and testing strategy.`,

    business:`OUTPUT STRUCTURE:
1. Assumption audit: every assumption rated High/Medium/Low. Directive: ${m.audit}
2. Devil's advocate: ${m.da}
3. CONSTRAINED FINAL OUTPUT:
SITUATION: 2–4 sentences. Present tense. Observable facts only.
   Banned: "seems","appears","suggests","may","might"
   Test: could a neutral third party verify every sentence from public information?
COMPLICATION: 1–3 sentences. Name the specific mechanism of failure — not the category.
   Banned: "various challenges","competitive pressures","market dynamics"
RESOLUTION: One recommendation. No hedging. Take a position.
   Banned: "consider","you might want to","one option would be"
PRIORITY ACTIONS: Each must include a measurable 30-day success signal.
   The signal must be falsifiable — two people reading it agree whether it occurred.
KILL CONDITION: One sentence specific enough that two people agree whether it has triggered.`,

    research:`OUTPUT STRUCTURE:
1. Scope definition: in/out of scope, key open questions. Await approval.
2. FINDINGS — CONSTRAINED FORMAT:
   Each finding: [Claim] | [Evidence] | [VERIFIED/LIKELY/SPECULATIVE] | [Caveat]
   Required: at least one LIKELY and one SPECULATIVE finding in final output.
   All-VERIFIED report is statistically implausible — flag and revise before presenting.
   CONTRADICTIONS: list every source conflict. Do not resolve — document it.
   "Source A says X. Source B says Y. Unresolved." is the correct format.
3. Synthesis: label clearly — established fact / expert consensus / contested claim throughout.`,

    marketing:`OUTPUT STRUCTURE:
BANNED: "game-changing","revolutionary","innovative","world-class","seamless","robust","leverage","synergy"
SPECIFICITY TEST (every claim): replace product name with competitor — still true? If yes — rewrite.
HEADLINE CONSTRAINT: must contain a specific number, named outcome, or named objection.
   "Transform your business" fails. "Get your first paying customer in 14 days" passes.
CTA CONSTRAINT: one action, one reason. No more.
1. Audience deconstruction: primary pain, secondary gains, #1 objection, emotional state at contact.
2. Copy architecture for approval before writing.
   ${n>=3?'Assume first structure will not convert. Prove why it will before presenting.':''}
3. Dual variants: A + B different angles. For each: list every persuasion principle applied and why.`
  };
  return s[modeId];
}

// V6: dual mode output structure
function buildDualOutputStructure(modeIds,n){
  const m1=MODES.find(x=>x.id===modeIds[0]);
  const m2=MODES.find(x=>x.id===modeIds[1]);
  return `DUAL MODE — Phase 1: ${m1.icon} ${m1.name.toUpperCase()} → Phase 2: ${m2.icon} ${m2.name.toUpperCase()}

Select a technique stack that is coherent across BOTH phases.
Declare one PRIMARY and one stack — not separate stacks per phase.

━━━ PHASE 1: ${m1.icon} ${m1.name} ━━━
${buildOutputStructure(modeIds[0],n)}

PHASE HANDOFF:
State "Phase 1 complete — [one sentence summary of output]."
Do not begin Phase 2 until I explicitly confirm.

━━━ PHASE 2: ${m2.icon} ${m2.name} ━━━
${buildOutputStructure(modeIds[1],n)}`;
}

// V6: stack audit block
function buildStackAudit(){
  return `
━━━ STACK AUDIT — REQUIRED AT END OF EVERY RESPONSE ━━━━━━━━━━

TECHNIQUE APPLIED: [exact name — not the category, the specific technique]
WHERE: [specific section or paragraph of your response where it visibly appears]
EXECUTION QUALITY: 1–5
WEAKNESS: [the one specific thing that would have made this execution stronger]
DRIFT: YES / NO
IF DRIFT: [what changed from your declaration and the precise reason]
CONFIDENCE REVIEW: [list each HIGH confidence claim — state why each is warranted]
  All-HIGH response requires explicit justification. Unearned HIGH = hallucination.

End with exactly one line:
  AUDIT: STACK INTACT
  or
  AUDIT: DRIFT — [description]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;}

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
full stack declaration is complete. End all future responses with the
AUDIT line declared above.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;}

function buildGroundingRequirement(){
  return `GROUNDING REQUIREMENT:
Every causal claim requires the specific mechanism.
"X causes Y" is NOT acceptable. "X causes Y because [mechanism]" IS required.
A mechanism-free causal claim is tagged [SPECULATIVE] regardless of how confident it sounds.
Applies to analysis, recommendations, and strategic reasoning — not only factual claims.

`;}

function buildIntentInterpretation(){
  return `INTENT INTERPRETATION (state this before your first substantive paragraph):
INTERPRETED INTENT: [what you believe the user actually needs — not just what they asked]
If what they asked and what they actually need differ, state the difference explicitly.
Confirm which question you are answering and why.
Do not answer a wrong question correctly — that is worse than not answering.

`;}

function buildContradictionDetection(){
  return `CONTRADICTION DETECTION:
If the brief contains requirements that cannot be simultaneously satisfied
(fast + cheap + high quality | novel + proven | broad + focused):
List each contradiction explicitly BEFORE proceeding.
State which constraint you are prioritising and why.
Silent contradiction resolution is not acceptable.

`;}

function buildSelfConsistency(){
  return `━━━ SELF-CONSISTENCY CHECK — HIGH RIGOR MODE ━━━━━━━━━━━━━━

Before presenting your final answer, internally generate THREE independent
attempts at the core conclusion/recommendation, using genuinely different
starting angles (e.g. different primary assumptions, different weighting
of constraints). Do not show all three — this is internal work.

Compare the three attempts:
  All three agree on the core conclusion → present it. Confidence: HIGH.
  Two of three agree → present the majority view. State explicitly that
    one attempt diverged and summarise the divergent reasoning in one sentence.
  All three diverge → do NOT pick one arbitrarily. State this directly:
    "My three independent attempts did not converge — here is why, and
    here is the question that would resolve which is correct."

This check exists because a single pass can sound confident while being
wrong. Three independent passes that agree are stronger evidence than one
confident-sounding pass.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;}

function buildAdversarialCounterPass(){
  return `━━━ MANDATORY ADVERSARIAL COUNTER-PASS — HIGH RIGOR MODE ━━

This runs regardless of which technique you selected above. It is not
optional and not conditional on the technique you chose.

After producing your conclusion, switch role explicitly: become a hostile
reviewer whose job is to find the strongest reason your own conclusion is
wrong. Do not strawman your own argument — attack its actual weakest point.

COUNTER-PASS OUTPUT:
STRONGEST OBJECTION: [the single best argument against your own conclusion]
DOES IT SURVIVE: YES / NO / PARTIALLY
IF NO OR PARTIALLY: [state explicitly how your conclusion changes]
IF YES: [state explicitly why the objection fails — not just that it does]

A conclusion that cannot survive its own author's best attack on it should
not be presented with HIGH confidence. Adjust your CONFIDENCE CALIBRATION
rating below based on the outcome of this counter-pass.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;}

function buildConfidenceCalibration(){
  return `CONFIDENCE CALIBRATION:
For every recommendation, conclusion, or strategic position in this response:
CONFIDENCE: HIGH / MEDIUM / LOW
REASON NOT HIGHER: [the specific assumption or evidence gap preventing HIGH confidence]
A response where all ratings are HIGH requires explicit justification.
Unearned HIGH confidence is indistinguishable from hallucination — flag and revise.

`;}

// ── MAIN PROMPT BUILDER ───────────────────────────────────────────────
function buildAntiSycoLean(n){
  return `RULES: ${BLUNTNESS_RULES[n]}
BANNED openers: "Great","Certainly!","Absolutely!","Of course!"
First sentence = your most critical observation.

`;}

function buildStackAuditLean(){
  return `
End your response with exactly one line:
  AUDIT: STACK INTACT
  or
  AUDIT: DRIFT — [one sentence]
`;}

function buildClosingLean(){
  return `
Reply first with: ROLE (1 sentence) + PRIMARY technique chosen + your first action.
No preamble.
`;}

function buildPrompt(modeIds,rawIdea,persona,audience,bluntness,expertise,outLen,leanMode,useBackstory,highRigor){
  const isDual=modeIds.length===2;
  const m1=MODES.find(x=>x.id===modeIds[0]);
  const m2=isDual?MODES.find(x=>x.id===modeIds[1]):null;

  const pLine=persona?`You are specifically acting as: ${persona}.`:'';
  const aLine=audience?`\nAll output must be calibrated for this target audience: ${audience}.`:'';

  const roles={youtube:'a blunt content strategist who has studied why 200+ video ideas failed to retain viewers — the pattern is always the same: creators made videos they wanted to make, not videos the viewer actually needed',allpurpose:'a blunt prompt architect who has diagnosed the failure modes of 1,000+ AI-generated outputs and knows exactly where generic templates produce generic, hallucinated, or structurally wrong results',code:'a blunt senior engineer who has inherited 30+ codebases written by people who prioritised shipping over correctness, and spent years unwinding the architectural failures that resulted',business:'a blunt senior strategist who has watched 40+ early-stage companies fail specifically because they misjudged their competitive moat, overestimated market size, or misread customer willingness to pay',research:'a blunt research analyst who has been burned by confident-sounding hallucinations enough times to treat every unverified claim as potentially false until a primary source confirms it',marketing:'a blunt direct-response copywriter who has tested enough campaigns to know the gap between a 0.5% and 3% conversion rate is almost never the headline — it is whether the copy names the readers real, specific, uncomfortable objection'};
  const rolesPlain={youtube:'a blunt YouTube content strategist',allpurpose:'a blunt AI prompt architect',code:'a blunt senior software engineer',business:'a blunt senior business strategist',research:'a blunt research analyst',marketing:'a blunt direct-response copywriter'};
  const activeRoles=(useBackstory===false)?rolesPlain:roles;

  const goals={youtube:'transform my raw video idea into a sequentially structured, high-retention YouTube script.',allpurpose:'transform my raw idea into a rigorous Bento-Box task prompt with strictly separated instructions and data.',code:'transform my technical task into a clean, production-grade engineering solution.',business:'pressure-test my idea, expose strategic weaknesses, and produce a rigorous strategic analysis.',research:'produce a structured, deeply accurate deep-dive with a clear information hierarchy and confidence-rated claims.',marketing:'produce high-impact, fluff-free marketing copy that is ruthlessly audience-focused and conversion-driven.'};
  const ctxLabels={youtube:'My raw video idea',allpurpose:'My raw idea/task',code:'My technical task/problem',business:'My business idea/question',research:'My research topic/question',marketing:'My copy task'};

  const roleStr=isDual?`${activeRoles[modeIds[0]]} for Phase 1, transitioning to ${activeRoles[modeIds[1]]} for Phase 2`:activeRoles[modeIds[0]];
  const goalStr=isDual?`complete a structured two-phase session: Phase 1 as ${m1.name}, Phase 2 as ${m2.name}.`:goals[modeIds[0]];
  const ctxLabel=isDual?'My task/brief (applies to both phases)':ctxLabels[modeIds[0]];
  const outputStructure=isDual?buildDualOutputStructure(modeIds,bluntness):buildOutputStructure(modeIds[0],bluntness);

  let body;
  if(leanMode){
    body=`Act as ${roleStr}. ${pLine} Your goal is to ${goalStr}${aLine}

${buildAntiSycoLean(bluntness)}${ctxLabel}:
<context>
${rawIdea}
</context>
${buildTechStack(bluntness)}
${outputStructure}
${buildStackAuditLean()}
${buildClosingLean()}`;
  } else {
    const rigorBlock=highRigor?(buildSelfConsistency()+buildAdversarialCounterPass()):'';
    body=`Act as ${roleStr}. ${pLine} Your goal is to ${goalStr}${aLine}

${buildAntiSyco(bluntness)}${buildNegativeSpace()}${buildPushback()}${buildGroundingRequirement()}${buildExpertise(expertise)}${buildOutputLength(outLen)}${ctxLabel}:
<context>
${rawIdea}
</context>

${buildIntentInterpretation()}${buildContradictionDetection()}${buildTechStack(bluntness)}
${outputStructure}
${rigorBlock}${buildConfidenceCalibration()}${buildStackAudit()}
${buildClosing()}`;
  }

  return body.replace(/\n{3,}/g,'\n\n').trim();
}

// ── GENERATE ──────────────────────────────────────────────────────────
// ── V16: MINIMAL MODE ────────────────────────────────────────────────
const PMKEY='blunt_v18_pathmode';

function buildMinimalPrompt(rawIdea){
  return `Be direct and specific. Do not open with agreement, validation, or filler ("Great question!","Certainly!","I'd be happy to help"). Your first sentence should be the single most useful thing you can tell me — not a preamble.

Avoid generic phrasing that could apply to any similar request — be concrete to this exact situation. If you're uncertain about something, say so plainly instead of hedging throughout the response.

My request:
${rawIdea}`;
}

function setPathMode(mode){
  const isMinimal=mode==='minimal';
  document.getElementById('pathMinimal').classList.toggle('active',isMinimal);
  document.getElementById('pathDeep').classList.toggle('active',!isMinimal);
  document.getElementById('minimalSection').style.display=isMinimal?'block':'none';
  document.getElementById('deepFlow').style.display=isMinimal?'none':'block';
  try{localStorage.setItem(PMKEY,mode)}catch(e){}
  if(isMinimal){
    setTimeout(()=>document.getElementById('minimalIdea').focus(),50);
  }
}

function loadPathMode(){
  let mode='minimal';
  try{const saved=localStorage.getItem(PMKEY);if(saved==='deep'||saved==='minimal')mode=saved;}catch(e){}
  setPathMode(mode);
}

function generateMinimal(){
  const rawIdea=document.getElementById('minimalIdea').value.trim();
  if(!rawIdea){
    const ta=document.getElementById('minimalIdea');
    ta.classList.add('shake');setTimeout(()=>ta.classList.remove('shake'),400);
    ta.focus();return;
  }
  const body=buildMinimalPrompt(rawIdea);
  const words=body.trim().split(/\s+/).length;
  const tokens=estimateTokens(body);

  document.getElementById('minimalOutMeta').innerHTML=
    `<span class="otag mode">⚡ Minimal</span><span class="otag">${words} words · ${tokenLabel(tokens)}</span><span class="otag">${new Date().toLocaleTimeString()}</span>`;
  document.getElementById('minimalOutputTA').value=body;
  const sec=document.getElementById('minimalOutputSection');
  sec.classList.add('vis');
  sec.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function copyMinimalPrompt(){
  const text=document.getElementById('minimalOutputTA').value;
  navigator.clipboard.writeText(text).then(()=>{
    const btn=document.getElementById('minimalCopyBtn');
    const orig=btn.textContent;
    btn.textContent='✓ Copied!';
    setTimeout(()=>btn.textContent=orig,2000);
  });
}

function clearMinimalOutput(){
  document.getElementById('minimalOutputSection').classList.remove('vis');
  document.getElementById('minimalOutputTA').value='';
  document.getElementById('minimalIdea').value='';
  document.getElementById('minimalCharCount').textContent='0 chars';
}

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
  const leanMode =(document.getElementById('tLean')||{checked:false}).checked;
  const useBackstory=(document.getElementById('tBackstory')||{checked:true}).checked;
  const highRigor=(document.getElementById('tHighRigor')||{checked:false}).checked;

  let body=buildPrompt(selectedModes,rawIdea,persona,audience,bluntness,expertiseLevel,outputLen,leanMode,useBackstory,highRigor);
  if(skillMd){
    const m=MODES.find(x=>x.id===selectedModes[0]);
    const suffix=selectedModes.length===2?`-x-${selectedModes[1]}`:'';
    body=`---\nname: ${m.skillName}${suffix}\ndescription: ${m.skillDesc}\nlicense: Apache-2.0\nversion: "1.0"\n---\n\n${body}`;
  }

  document.getElementById('outputTA').value=body;

  const words=body.trim().split(/\s+/).length;
  const tokens=estimateTokens(body);
  const m1=MODES.find(x=>x.id===selectedModes[0]);
  const modeLabel=selectedModes.length===2?`${m1.icon}+${MODES.find(x=>x.id===selectedModes[1]).icon} Dual Mode`:`${m1.icon} ${m1.name}`;

  document.getElementById('outMeta').innerHTML=`
    <span class="otag mode">${modeLabel}</span>
    <span class="otag auto">⬡ stack: auto-selected</span>
    <span class="otag">Bluntness: ${BLUNTNESS_LABELS[bluntness-1]}</span>
    <span class="otag">${expertiseLevel} · ${outputLen}</span>
    <span class="otag">${words} words · ${tokenLabel(tokens)}</span>
    <span class="otag">${new Date().toLocaleTimeString()}</span>`;

  const sec=document.getElementById('outputSection');
  document.getElementById('expertSection').style.display='block';
  sec.style.display='block';sec.classList.remove('reveal');void sec.offsetWidth;sec.classList.add('reveal');
  const ab=document.getElementById('appliedBadge');if(ab){ab.classList.remove('vis');}
  setTimeout(()=>sec.scrollIntoView({behavior:'smooth',block:'start'}),80);
  saveHistory(selectedModes,rawIdea,body,bluntness,expertiseLevel,outputLen,getCurrentTaskName());
  const cs=document.getElementById('captureSection');if(cs)cs.style.display='block';
  saveDefaults();
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
  const m=MODES.find(x=>x.id===selectedModes[0]);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
  a.download=`${m.skillName}-prompt.${ext}`;a.click();URL.revokeObjectURL(a.href);
}
function clearOutput(){document.getElementById('outputSection').style.display='none';document.getElementById('outputTA').value=''}

// ── HISTORY + NOTES ───────────────────────────────────────────────────
const HKEY='blunt_v18_history';

function saveHistory(modeIds,idea,prompt,bluntness,expertise,outLen,taskName){
  let h=loadHistory();
  const m1=MODES.find(x=>x.id===modeIds[0]);
  const m2=modeIds.length===2?MODES.find(x=>x.id===modeIds[1]):null;
  h.unshift({id:Date.now(),
    modeIds:modeIds.slice(),
    modeName:m2?`${m1.name} + ${m2.name}`:m1.name,
    idea:idea.substring(0,120),prompt,bluntness,expertise,outLen,note:'',rating:0,used:false,taskName:taskName||'',
    time:new Date().toLocaleString()});
  if(h.length>15)h=h.slice(0,15);
  try{localStorage.setItem(HKEY,JSON.stringify(h))}catch(e){}
  renderHistory();
}

function saveNote(id,text){
  let h=loadHistory();
  const e=h.find(x=>x.id===id);
  if(e){e.note=text;try{localStorage.setItem(HKEY,JSON.stringify(h))}catch(err){}}
}

function loadHistory(){try{return JSON.parse(localStorage.getItem(HKEY))||[]}catch{return[]}}

function renderHistoryItems(h){
  const list=document.getElementById('histList');
  if(!h.length){list.innerHTML='<div class="hist-empty">No entries match.</div>';return}
  list.innerHTML=h.map(e=>`
    <div class="hist-entry">
      <div class="hist-item" onclick="restoreHistory(${e.id})">
        <div class="hist-content">
          <div class="hist-mode">${e.modeName}</div>
          <div class="hist-idea">${escapeHtml(e.idea)}${e.idea.length>=120?'…':''}</div>
          <div class="hist-meta">
            <span class="hist-badge">${BLUNTNESS_LABELS[(e.bluntness||4)-1]}</span>
            <span class="hist-badge">${e.expertise||'advanced'}</span>
            <span class="hist-badge">${e.outLen||'detailed'}</span>
            ${e.taskName?`<span class="hist-task">📁 ${escapeHtml(e.taskName)}</span>`:''}
          </div>
        </div>
        <div class="hist-right">
          <div class="hist-time">${e.time}</div>
          <button class="hist-del" onclick="delHistory(event,${e.id})">✕</button>
        </div>
      </div>
      <div class="hist-bottom-row" onclick="event.stopPropagation()">
        <div class="hist-stars">${[1,2,3,4,5].map(s=>`<span class="star ${(e.rating||0)>=s?'on':''}" onclick="setRating(${e.id},${s})">★</span>`).join('')}</div>
        <button class="used-btn${e.used?' on':''}" onclick="toggleUsed(${e.id})">${e.used?'✓ Used':'Mark used'}</button>
        <button class="diff-btn${diffBaseId===e.id?' active':diffBaseId?' compare':''}" onclick="${diffBaseId&&diffBaseId!==e.id?`openDiff(${diffBaseId},${e.id})`:`startDiff(${e.id})`}">${diffBaseId===e.id?'⇄ Cancel':diffBaseId?'Compare →':'⇄ Diff'}</button>
      </div>
      <div class="hist-note-row" onclick="event.stopPropagation()">
        <textarea class="hist-note-ta" placeholder="Notes: what worked, what to improve next time..."
          onblur="saveNote(${e.id},this.value)">${escapeHtml(e.note||'')}</textarea>
      </div>
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

// ── V13: STATISTICAL SELF-CALIBRATION ───────────────────────────────────
function computeCalibrationInsights(modeId){
  const h=loadHistory().filter(e=>e.rating>0&&e.modeIds&&e.modeIds.length===1&&e.modeIds[0]===modeId);
  if(h.length<1)return null;

  function groupBy(key){
    const groups={};
    h.forEach(e=>{
      const k=e[key]!==undefined&&e[key]!==null?e[key]:'unknown';
      if(!groups[k])groups[k]=[];
      groups[k].push(e.rating);
    });
    return Object.entries(groups).map(([k,ratings])=>({
      key:k,
      avg:ratings.reduce((a,c)=>a+c,0)/ratings.length,
      count:ratings.length
    })).sort((a,b)=>b.avg-a.avg||b.count-a.count);
  }

  const bluntnessStats=groupBy('bluntness');
  const expertiseStats=groupBy('expertise');

  return{
    totalRated:h.length,
    provisional:h.length<3,
    bestBluntness:bluntnessStats[0],
    bluntnessStats,
    bestExpertise:expertiseStats[0],
    expertiseStats
  };
}

function renderCalibrationInsights(){
  const panel=document.getElementById('insightsPanel');
  if(!panel)return;
  if(selectedModes.length!==1){panel.style.display='none';return}

  const insights=computeCalibrationInsights(selectedModes[0]);
  if(!insights){panel.style.display='none';return}

  const mode=MODES.find(m=>m.id===selectedModes[0]);
  const bb=insights.bestBluntness;
  const be=insights.bestExpertise;
  const needed=3-insights.totalRated;

  panel.style.display='block';

  if(insights.provisional){
    panel.innerHTML=`
      <div class="insights-head">📊 Calibration Data — ${mode.name} <span class="insights-provisional-tag">PROVISIONAL</span></div>
      <div class="insights-body">
        Based on <strong>${insights.totalRated}</strong> rated session${insights.totalRated!==1?'s':''} so far — not yet a reliable pattern, but here's what you've got:<br>
        Highest-rated bluntness: <strong>${BLUNTNESS_LABELS[bb.key-1]||bb.key}</strong> (${bb.avg.toFixed(1)}★)<br>
        Highest-rated expertise: <strong>${be.key}</strong> (${be.avg.toFixed(1)}★)<br>
        Rate ${needed} more session${needed!==1?'s':''} in this mode for a pattern worth trusting.
      </div>
      <button class="abtn insights-apply" onclick="applyCalibrationInsights(${bb.key},'${be.key}')">Try These Settings Anyway</button>
    `;
  } else {
    panel.innerHTML=`
      <div class="insights-head">📊 Your Calibration Data — ${mode.name}</div>
      <div class="insights-body">
        Based on <strong>${insights.totalRated}</strong> rated session${insights.totalRated!==1?'s':''} for this mode:<br>
        Highest-rated bluntness: <strong>${BLUNTNESS_LABELS[bb.key-1]||bb.key}</strong> (avg ${bb.avg.toFixed(1)}★ over ${bb.count} session${bb.count!==1?'s':''})<br>
        Highest-rated expertise: <strong>${be.key}</strong> (avg ${be.avg.toFixed(1)}★ over ${be.count} session${be.count!==1?'s':''})
      </div>
      <button class="abtn ok insights-apply" onclick="applyCalibrationInsights(${bb.key},'${be.key}')">✓ Apply These Settings</button>
    `;
  }
}

function applyCalibrationInsights(bluntness,expertise){
  document.getElementById('bluntSlider').value=bluntness;
  syncBluntness();
  setExpertise(expertise);
  const panel=document.getElementById('insightsPanel');
  if(panel){
    const btn=panel.querySelector('.insights-apply');
    if(btn){const orig=btn.textContent;btn.textContent='✓ Applied!';setTimeout(()=>btn.textContent=orig,1800);}
  }
  scheduleDefaultsSave();
}


function filterHistory(q){
  const h=loadHistory();const ql=q.toLowerCase();
  renderHistoryItems(ql?h.filter(e=>e.modeName.toLowerCase().includes(ql)||e.idea.toLowerCase().includes(ql)||(e.taskName&&e.taskName.toLowerCase().includes(ql))):h);
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

function clearHistory(){
  try{localStorage.removeItem(HKEY)}catch(e){}
  document.getElementById('histSection').style.display='none';
}


// ── V7: TOKEN COUNTER ─────────────────────────────────────────────────
function estimateTokens(text){return Math.ceil(text.length/3.5)}
function tokenClass(t){return t<1000?'tok-ok':t<2000?'tok-warn':t<3000?'tok-high':'tok-over'}
function tokenLabel(t){
  const cls=tokenClass(t);
  const warn=t>=3000?' ⚠':'';
  return `<span class="${cls}">~${t.toLocaleString()} tokens${warn}</span>`;
}

// ── V7: RATING + USED ─────────────────────────────────────────────────
function setRating(id,stars){
  let h=loadHistory();
  const e=h.find(x=>x.id===id);
  if(!e)return;
  e.rating=e.rating===stars?0:stars; // clicking same star deselects
  try{localStorage.setItem(HKEY,JSON.stringify(h))}catch(err){}
  renderHistory();
  renderCalibrationInsights();
}
function toggleUsed(id){
  let h=loadHistory();
  const e=h.find(x=>x.id===id);
  if(!e)return;
  e.used=!e.used;
  try{localStorage.setItem(HKEY,JSON.stringify(h))}catch(err){}
  renderHistory();
}

// ── V7: TEMPLATES ─────────────────────────────────────────────────────
function loadStoredTemplates(){try{return JSON.parse(localStorage.getItem(TKEY))||[]}catch{return[]}}
function saveStoredTemplates(t){try{localStorage.setItem(TKEY,JSON.stringify(t))}catch(e){}}

function toggleTemplates(){
  document.getElementById('tmplBtn').classList.toggle('open');
  const p=document.getElementById('tmplPanel');
  p.classList.toggle('vis');
  if(p.classList.contains('vis')){
    renderTemplates();
    const n=loadStoredTemplates().length;
    document.getElementById('tmplCount').textContent=n>0?n+' saved':'';
  }
}

// Global template cache — avoids JSON.stringify in onclick attributes
const _TC={};

function renderTemplates(){
  const stored=loadStoredTemplates();
  // Rebuild cache with current starters + saved
  Object.keys(_TC).forEach(k=>delete _TC[k]);
  STARTER_TEMPLATES.forEach(t=>{_TC[String(t.id)]=t});
  stored.forEach(t=>{_TC[String(t.id)]=t});

  document.getElementById('tmplStarters').innerHTML=STARTER_TEMPLATES.map(t=>`
    <div class="tmpl-item">
      <span class="tmpl-icon">${MODES.find(m=>m.id===t.modeId)?.icon||'🧠'}</span>
      <span class="tmpl-name">${t.name}</span>
      <button class="tmpl-load" onclick="applyTemplateById('${t.id}')">Load</button>
    </div>`).join('');

  const savedEl=document.getElementById('tmplSaved');
  if(!stored.length){
    savedEl.innerHTML='<div class="tmpl-empty">No saved templates yet. Write a brief and click Save.</div>';
  } else {
    savedEl.innerHTML=stored.map(t=>`
      <div class="tmpl-item">
        <span class="tmpl-icon">${t.modeIds.map(id=>MODES.find(m=>m.id===id)?.icon||'🧠').join('')}</span>
        <span class="tmpl-name">${escapeHtml(t.name)}</span>
        <button class="tmpl-load" onclick="applyTemplateById('${t.id}')">Load</button>
        <button class="tmpl-del" onclick="deleteTemplate(${t.id})">✕</button>
      </div>`).join('');
  }
}

function applyTemplateById(id){
  const t=_TC[String(id)];
  if(!t)return;
  applyTemplate(t.brief, t.modeId?[t.modeId]:t.modeIds);
}

function applyTemplate(brief,modeIds){
  document.getElementById('rawIdea').value=brief;
  document.getElementById('charCount').textContent=brief.length+' chars · ~'+estimateTokens(brief)+' tokens';
  analyzeBrief(brief);
  selectedModes=modeIds.slice();
  renderCards();
  // Close panel
  document.getElementById('tmplBtn').classList.remove('open');
  document.getElementById('tmplPanel').classList.remove('vis');
  document.getElementById('rawIdea').focus();
}

function saveCurrentTemplate(){
  const brief=document.getElementById('rawIdea').value.trim();
  const name=document.getElementById('tmplName').value.trim();
  if(!brief){alert('Write a brief first.');return}
  if(!name){document.getElementById('tmplName').focus();return}
  const stored=loadStoredTemplates();
  stored.unshift({id:Date.now(),name,modeIds:selectedModes.slice(),brief,created:new Date().toLocaleString()});
  saveStoredTemplates(stored);
  document.getElementById('tmplName').value='';
  renderTemplates();
  // Flash confirmation
  const btn=document.getElementById('tmplSaveBtn');
  btn.textContent='✓ Saved!';
  setTimeout(()=>btn.textContent='Save brief',1500);
}

function deleteTemplate(id){
  const stored=loadStoredTemplates().filter(t=>t.id!==id);
  saveStoredTemplates(stored);
  renderTemplates();
}

// ── V7: DIFF ──────────────────────────────────────────────────────────
function startDiff(id){
  diffBaseId=diffBaseId===id?null:id;
  renderHistory();
}

// ── V17: EXPERT LAYER BEFORE/AFTER DIFF ─────────────────────────────────
const _elDiffCache={before:'',after:''};

function showExpertLayerDiffFromCache(){
  if(!_elDiffCache.before||!_elDiffCache.after)return;
  showExpertLayerDiff(_elDiffCache.before,_elDiffCache.after);
}

function showExpertLayerDiff(beforeText,afterText){
  const linesA=beforeText.split('\n');
  const linesB=afterText.split('\n');
  const diff=lcsLines(linesA,linesB);
  const added=diff.filter(l=>l.type==='add').length;
  const removed=diff.filter(l=>l.type==='rem').length;
  const same=diff.filter(l=>l.type==='same').length;

  document.getElementById('diffMeta').innerHTML=`
    <div class="diff-entry-info">
      <div class="diff-entry-lbl a">Before — base prompt</div>
      <div class="diff-entry-mode">Without Expert Layer</div>
    </div>
    <div style="color:var(--td);align-self:center;font-size:1.2rem">→</div>
    <div class="diff-entry-info">
      <div class="diff-entry-lbl b">After — with Expert Layer</div>
      <div class="diff-entry-mode">Your additions applied</div>
    </div>`;

  document.getElementById('diffStats').innerHTML=`
    <span class="ds-tag ds-add">+${added} lines added</span>
    <span class="ds-tag ds-rem">−${removed} lines removed</span>
    <span class="ds-tag ds-same">${same} unchanged</span>
    <span class="ds-tag ds-same">This is what your Expert Layer additions actually changed</span>`;

  document.getElementById('diffView').innerHTML=renderDiffHtml(diff);
  document.getElementById('diffBackdrop').classList.add('open');
  document.body.style.overflow='hidden';
}

function openDiff(idA,idB){
  const h=loadHistory();
  const eA=h.find(x=>x.id===idA);
  const eB=h.find(x=>x.id===idB);
  if(!eA||!eB)return;

  const linesA=eA.prompt.split('\n');
  const linesB=eB.prompt.split('\n');
  const diff=lcsLines(linesA,linesB);
  const added=diff.filter(l=>l.type==='add').length;
  const removed=diff.filter(l=>l.type==='rem').length;
  const same=diff.filter(l=>l.type==='same').length;

  document.getElementById('diffMeta').innerHTML=`
    <div class="diff-entry-info">
      <div class="diff-entry-lbl a">A — Earlier</div>
      <div class="diff-entry-mode">${eA.modeName}</div>
      <div class="diff-entry-time">${eA.time}</div>
    </div>
    <div style="color:var(--td);align-self:center;font-size:1.2rem">→</div>
    <div class="diff-entry-info">
      <div class="diff-entry-lbl b">B — Later</div>
      <div class="diff-entry-mode">${eB.modeName}</div>
      <div class="diff-entry-time">${eB.time}</div>
    </div>`;

  document.getElementById('diffStats').innerHTML=`
    <span class="ds-tag ds-add">+${added} lines added</span>
    <span class="ds-tag ds-rem">−${removed} lines removed</span>
    <span class="ds-tag ds-same">${same} unchanged</span>
    <span class="ds-tag ds-same">${Math.round((added+removed)*100/Math.max(linesA.length,1))}% changed</span>`;

  document.getElementById('diffView').innerHTML=renderDiffHtml(diff);
  document.getElementById('diffBackdrop').classList.add('open');
  document.body.style.overflow='hidden';
  diffBaseId=null;
  renderHistory();
}

function lcsLines(a,b){
  const m=a.length,n=b.length;
  // Guard for very large diffs
  if(m*n>400000){
    // Fallback: show whole A as removed, whole B as added
    return [...a.map(t=>({type:'rem',text:t})),...b.map(t=>({type:'add',text:t}))];
  }
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
    if(a[i-1]===b[j-1])dp[i][j]=dp[i-1][j-1]+1;
    else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);
  }
  const result=[];let i=m,j=n;
  while(i>0||j>0){
    if(i>0&&j>0&&a[i-1]===b[j-1]){result.unshift({type:'same',text:a[i-1]});i--;j--;}
    else if(j>0&&(i===0||dp[i][j-1]>=dp[i-1][j])){result.unshift({type:'add',text:b[j-1]});j--;}
    else{result.unshift({type:'rem',text:a[i-1]});i--;}
  }
  return result;
}

function renderDiffHtml(diff){
  let html='',buf=[],h=t=>`${t}`.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  function flushBuf(){
    if(!buf.length)return;
    if(buf.length<=4){buf.forEach(t=>{html+=`<div class="dl ds-line">${h(t)}</div>`});}
    else{
      html+=`<div class="dl ds-line">${h(buf[0])}</div>`;
      html+=`<div class="dl ds-line">${h(buf[1])}</div>`;
      html+=`<div class="dl df">··· ${buf.length-4} unchanged lines ···</div>`;
      html+=`<div class="dl ds-line">${h(buf[buf.length-2])}</div>`;
      html+=`<div class="dl ds-line">${h(buf[buf.length-1])}</div>`;
    }
    buf=[];
  }
  diff.forEach(line=>{
    if(line.type==='same'){buf.push(line.text);}
    else{
      flushBuf();
      if(line.type==='add')html+=`<div class="dl da"><span class="dp">+</span>${h(line.text)}</div>`;
      else html+=`<div class="dl dr"><span class="dp">−</span>${h(line.text)}</div>`;
    }
  });
  flushBuf();
  return html||'<div class="dl ds-line" style="color:var(--td);text-align:center;padding:1rem">No differences found.</div>';
}

function closeDiff(){document.getElementById('diffBackdrop').classList.remove('open');document.body.style.overflow='';}
function closeDiffOnBg(e){if(e.target===document.getElementById('diffBackdrop'))closeDiff();}


// ── V8: EXPERT LAYER ─────────────────────────────────────────────────
const TECHNIQUES_LIST=[
  {v:'',     l:'Auto-select — AI chooses based on your brief (recommended for new tasks)'},
  {v:'Chain-of-Thought (CoT)',    l:'Chain-of-Thought — sequential deduction, debugging, step-by-step logic'},
  {v:'Tree-of-Thought (ToT)',     l:'Tree-of-Thought — explore multiple solutions, evaluate, prune, converge'},
  {v:'First Principles',          l:'First Principles — strip wrong assumptions, rebuild from ground truth'},
  {v:'Step-Back Prompting',       l:'Step-Back — abstract the problem first, then solve the specific'},
  {v:'Adversarial / Pre-mortem',  l:'Adversarial — assume it fails, work backward to why'},
  {v:'Analogical Reasoning',      l:'Analogical — find a solved analog elsewhere, transfer the insight'},
  {v:'MECE Decomposition',        l:'MECE — exhaustive, non-overlapping breakdown of the domain'},
  {v:'Socratic Drilling',         l:'Socratic Drilling — question every assumption until bedrock'}
];

const MODEL_CALIBRATIONS={
  claude:`MODEL CALIBRATION — Claude Opus 4.8 / Sonnet 4.6 (Anthropic):
* Keep your acknowledgment reply to 2–3 sentences maximum.
* Do not use markdown headers (##, ###) in conversational replies.
* Do not open any response with an apology, caveat, or disclaimer.
* Do not add "I should note..." or "It's worth mentioning..." qualifiers.
* [Note: this calibration is reasoned, not independently measured for this prompt set.]`,
  gpt55:`MODEL CALIBRATION — GPT-5.5 (OpenAI):
* GPT-5.5 has documented improvements in plan calibration — it is built to be less likely than predecessors to proceed confidently with a flawed plan. If you flag a weakness in your own plan, treat that flag as reliable signal, not as reflexive hedging.
* Built for long-horizon agentic, multi-step work — maintain full context across all steps rather than summarising earlier steps away.
* Do not add markdown headers unless explicitly requested.
* Do not ask clarifying questions beyond what the Interview Phase calls for.
* [Note: behavioural tendencies above are from public model documentation, not independently tested against this prompt set.]`,
  gemini31:`MODEL CALIBRATION — Gemini 3.1 Pro (Google):
* Independent testing has measured a meaningfully higher hallucination rate for this model than comparable models. Apply CoVe at a STRICTER threshold than default: treat LIKELY claims as SPECULATIVE, and SPECULATIVE as UNKNOWN, unless a specific source is cited.
* All constraints in this prompt apply to EVERY turn, not just the first reply — do not reset to default behaviour after the first exchange.
* Maximum output length is lower than Claude/GPT competitors — if a section risks truncation, front-load the highest-value content.
* [Note: hallucination-rate finding is from third-party benchmarking, not testing of this specific prompt set.]`
};

function toggleExpertLayer(){
  const panel=document.getElementById('expertPanel');
  panel.classList.toggle('vis');
  document.getElementById('expertExpandBtn').textContent=
    panel.classList.contains('vis')?'▲ Collapse':'▼ Expand';
}

function toggleHowto(ev,id){
  ev.stopPropagation();
  const box=document.getElementById(id);
  const btn=ev.currentTarget;
  box.classList.toggle('vis');
  btn.textContent=box.classList.contains('vis')?'Hide':'How to';
}

function updateExpertScore(){
  const t  =document.getElementById('forcedTechnique').value;
  const g  =(document.getElementById('goodExample').value||'').trim();
  const b  =(document.getElementById('badExample').value||'').trim();
  const dr =(document.getElementById('domainRules').value||'').trim();
  const m  =document.getElementById('modelSelect').value;

  let score=13.0;
  if(t)            score+=1.0;
  if(g.length>30)  score+=1.5;
  const gb=(document.getElementById('goodExBrief')||{value:''}).value.trim();
  if(g.length>30&&gb.length>20)score+=0.5;
  if(b.length>30)  score+=0.5;
  if(dr.length>10) score+=1.0;
  if(m&&m!=='other')score+=1.0;
  score=Math.min(score,18.0);

  const el=document.getElementById('scoreLive');
  if(el)el.textContent=Number.isInteger(score)?score:score.toFixed(1);

  const gc=document.getElementById('goodExChars');
  const bc=document.getElementById('badExChars');
  const dc=document.getElementById('domainChars');
  if(gc)gc.textContent=g.length+' chars';
  if(bc)bc.textContent=b.length+' chars';
  if(dc)dc.textContent=dr.length+' chars';
}

function applyExpertLayer(){
  const prompt=document.getElementById('outputTA').value.trim();
  if(!prompt){alert('Generate a prompt first, then apply the expert layer.');return}

  const t  =document.getElementById('forcedTechnique').value;
  const g  =(document.getElementById('goodExample').value||'').trim();
  const b  =(document.getElementById('badExample').value||'').trim();
  const dr =(document.getElementById('domainRules').value||'').trim();
  const m  =document.getElementById('modelSelect').value;

  if(!t&&!g&&!b&&!dr&&(!m||m==='other')){
    alert('Fill in at least one expert layer field before applying.');return;
  }

  const layers=[];

  if(t){layers.push(
`TECHNIQUE OVERRIDE — supersedes the self-selection instructions above:
Use ONLY: ${t}
Do not consider other techniques. Do not justify this choice in your stack declaration.
In your ROLE line, write: "Using forced technique: ${t}"`);}

  const gb2=(document.getElementById('goodExBrief')||{value:''}).value.trim();
  if(g&&gb2){layers.push(`EXAMPLE INPUT → OUTPUT PAIR:\nBrief that produced it:\n<example_brief>\n${gb2}\n</example_brief>\n\nIdeal response:\n<good_example>\n${g}\n</good_example>\nMatch quality, depth, register — not content.`);}
  else if(g){layers.push(
`EXAMPLE OF IDEAL OUTPUT — study this before responding:
Match its quality, depth, structure, and language register.
<good_example>
${g}
</good_example>`);}

  if(b){layers.push(
`EXAMPLE OF OUTPUT TO AVOID:
Identify what makes this poor and actively avoid those patterns.
<bad_example>
${b}
</bad_example>`);}

  if(dr){layers.push(
`ADDITIONAL DOMAIN-SPECIFIC RULES:
${dr}`);}

  if(m&&m!=='other'&&MODEL_CALIBRATIONS[m]){
    layers.push(MODEL_CALIBRATIONS[m]);
  }

  const block=`\n━━━ EXPERT LAYER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${layers.join('\n\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  const MARKER='━━━ YOUR FIRST REPLY';
  const updated=prompt.includes(MARKER)
    ?prompt.replace(MARKER,block.trim()+'\n\n'+MARKER)
    :prompt+'\n'+block;

  document.getElementById('outputTA').value=updated;

  const tokens=estimateTokens(updated);
  _elDiffCache.before=prompt;
  _elDiffCache.after=updated;
  const badge=document.getElementById('appliedBadge');
  badge.innerHTML=`✓ ${layers.length} addition${layers.length!==1?'s':''} injected · ~${tokens.toLocaleString()} tokens &nbsp;<a href="#" class="diff-link" onclick="showExpertLayerDiffFromCache();return false;">See exactly what changed →</a>`;
  badge.classList.add('vis');

  document.getElementById('outputTA').scrollIntoView({behavior:'smooth',block:'start'});
}


// ── V9: DEFAULTS ──────────────────────────────────────────────────────
function saveDefaults(){
  const d={
    persona:  document.getElementById('personaInput').value.trim(),
    audience: document.getElementById('audienceInput').value.trim(),
    bluntness:parseInt(document.getElementById('bluntSlider').value),
    expertise:expertiseLevel,
    outputLen:outputLen,
    modes:    selectedModes.slice(),
    model:    (document.getElementById('modelSelect')||{value:'other'}).value,
    domainRules:(document.getElementById('domainRules')||{value:''}).value.trim(),
    forcedTechnique:(document.getElementById('forcedTechnique')||{value:''}).value,
    taskName:(document.getElementById('taskName')||{value:''}).value.trim(),
    leanMode:(document.getElementById('tLean')||{checked:false}).checked,
    useBackstory:(document.getElementById('tBackstory')||{checked:true}).checked,
    highRigor:(document.getElementById('tHighRigor')||{checked:false}).checked
  };
  try{localStorage.setItem(DKEY,JSON.stringify(d))}catch(e){}
  const ind=document.getElementById('saveIndicator');
  if(ind){ind.textContent='✓ Settings saved';ind.classList.add('vis');clearTimeout(_defTimer);_defTimer=setTimeout(()=>ind.classList.remove('vis'),1800)}
}

function loadDefaults(){
  try{
    const d=JSON.parse(localStorage.getItem(DKEY));
    if(!d)return;
    if(d.persona)  document.getElementById('personaInput').value=d.persona;
    if(d.audience) document.getElementById('audienceInput').value=d.audience;
    if(d.bluntness){document.getElementById('bluntSlider').value=d.bluntness;syncBluntness()}
    if(d.expertise)setExpertise(d.expertise);
    if(d.outputLen)setOutputLen(d.outputLen);
    if(d.modes&&d.modes.length){
      const valid=d.modes.filter(id=>MODES.some(m=>m.id===id));
      if(valid.length){selectedModes=valid;renderCards()}
    }
    if(d.taskName){const tn=document.getElementById('taskName');if(tn)tn.value=d.taskName}
    if(typeof d.leanMode==='boolean'){const lm=document.getElementById('tLean');if(lm)lm.checked=d.leanMode}
    if(typeof d.useBackstory==='boolean'){const ub=document.getElementById('tBackstory');if(ub)ub.checked=d.useBackstory}
    if(typeof d.highRigor==='boolean'){const hr=document.getElementById('tHighRigor');if(hr)hr.checked=d.highRigor}
    // Expert layer fields load after DOM is ready
    setTimeout(()=>{
      if(d.model){const ms=document.getElementById('modelSelect');if(ms){ms.value=d.model;updateExpertScore()}}
      if(d.domainRules){const dr=document.getElementById('domainRules');if(dr){dr.value=d.domainRules;updateExpertScore()}}
      if(d.forcedTechnique){const ft=document.getElementById('forcedTechnique');if(ft){ft.value=d.forcedTechnique;updateExpertScore()}}
    },150);
  }catch(e){}
}

function clearDefaults(){
  try{localStorage.removeItem(DKEY)}catch(e){}
  document.getElementById('personaInput').value='';
  document.getElementById('audienceInput').value='';
  document.getElementById('bluntSlider').value=4;syncBluntness();
  setExpertise('advanced');setOutputLen('detailed');
  selectedModes=['youtube'];renderCards();
  const tn=document.getElementById('taskName');if(tn)tn.value='';
  const ind=document.getElementById('saveIndicator');
  if(ind){ind.textContent='Settings cleared';ind.classList.add('vis');clearTimeout(_defTimer);_defTimer=setTimeout(()=>ind.classList.remove('vis'),1800)}
}

function scheduleDefaultsSave(){clearTimeout(_defTimer);_defTimer=setTimeout(saveDefaults,900)}

// ── V9: TASK ──────────────────────────────────────────────────────────
function getCurrentTaskName(){return(document.getElementById('taskName')||{value:''}).value.trim()}

// ── V9: RESPONSE CAPTURE ─────────────────────────────────────────────
function scoreParagraph(p){
  const HEDGES=['might','could','perhaps','generally','often','sometimes','may','possibly','arguably','tend to','in some cases','it depends','various factors','several'];
  const GENERIC=['it is important','you should consider','there are many','in conclusion','to summarize','overall,','in general','as mentioned','needless to say'];
  const SIGNALS=['specifically','because','therefore','however','instead','unlike','compared to','the reason','this means','as a result','in practice','for example','for instance'];
  const words=p.split(/\s+/).filter(w=>w.length>1);
  let s=0;
  if(words.length>=20)s+=10;
  if(words.length>=40)s+=15;
  if(words.length>220)s-=15;
  (p.match(/\d[\d,.]*%?/g)||[]).forEach(()=>s+=6);
  (p.match(/(?<![.\n]\s*)[A-Z][a-z]{3,}/g)||[]).forEach(()=>s+=2);
  HEDGES.forEach(h=>{if(p.toLowerCase().includes(h))s-=8});
  GENERIC.forEach(g=>{if(p.toLowerCase().includes(g))s-=12});
  SIGNALS.forEach(sg=>{if(p.toLowerCase().includes(sg))s+=6});
  if(p.includes('`'))s+=20;
  return s;
}

function extractBestParagraphs(text){
  const paras=text.split(/\n\n+/).map(p=>p.trim()).filter(p=>p.length>40);
  if(!paras.length)return text.trim();
  const scored=paras.map(p=>({text:p,score:scoreParagraph(p)}));
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,Math.min(3,scored.length)).map(s=>s.text).join('\n\n');
}

function extractBest(){
  const text=document.getElementById('responseTA').value.trim();
  if(!text){alert('Paste the AI response first.');return}
  const best=extractBestParagraphs(text);
  document.getElementById('extractTA').value=best;
  document.getElementById('extractPreview').style.display='block';
  document.getElementById('extractTA').scrollIntoView({behavior:'smooth',block:'center'});
}

function applyExtractedExample(){
  const text=document.getElementById('extractTA').value.trim();
  if(!text)return;
  const ge=document.getElementById('goodExample');
  if(ge){
    ge.value=text;updateExpertScore();
    const panel=document.getElementById('expertPanel');
    if(panel&&!panel.classList.contains('vis'))toggleExpertLayer();
    ge.scrollIntoView({behavior:'smooth',block:'center'});
  }
  discardExtract();
}

function useAsGoodExample(){
  const text=document.getElementById('responseTA').value.trim();
  if(!text){alert('Paste the AI response first.');return}
  const ge=document.getElementById('goodExample');
  if(ge){
    ge.value=text;updateExpertScore();
    const panel=document.getElementById('expertPanel');
    if(panel&&!panel.classList.contains('vis'))toggleExpertLayer();
    ge.scrollIntoView({behavior:'smooth',block:'center'});
  }
}

function discardExtract(){
  document.getElementById('extractPreview').style.display='none';
  document.getElementById('extractTA').value='';
}

// ── V13: BLIND CRITIQUE GENERATOR ──────────────────────────────────────
function buildBlindCritique(responseText){
  return `Act as a ruthless, domain-agnostic quality auditor. You have ZERO knowledge of how the following output was generated — what techniques, personas, or instructions were used to produce it. Judge it purely on its own merits, as a cold read with no context.

<output_to_audit>
${responseText}
</output_to_audit>

AUDIT — answer each with zero charity:

1. GENERICITY TEST: Could this be given as a response to a different but similar request, with only nouns swapped, and still sound complete? YES/NO + the specific evidence.
2. UNSUPPORTED CLAIMS: List every claim presented as fact with no stated evidence, source, or mechanism.
3. HEDGE DENSITY: Count instances of hedging language ("it depends","may vary","in some cases","generally"). State the count. High density signals low conviction.
4. SPECIFICITY SCORE (1–10): How specific vs generic is this content, independent of topic familiarity?
5. STRUCTURAL COMPLIANCE: Does this follow a clear, identifiable structure, or does it ramble?
6. ONE-SENTENCE TEST: Summarise this response's unique value in one sentence that would NOT also apply to a mediocre answer on the same topic. If you cannot, say so explicitly.

VERDICT:
QUALITY SCORE: [1–20 — use the full range, do not cluster around 12–15 out of politeness]
HIGHEST-LEVERAGE FIX: [the single change that would improve this the most]
RED FLAGS: [anything that reads as hallucinated, fabricated, or unjustifiably confident]

Do not soften this for politeness. A score of 20 should be rare. A score under 10 is an honest reading, not an insult.`;
}

function generateBlindCritique(){
  const text=document.getElementById('responseTA').value.trim();
  if(!text){alert('Paste the AI response first.');return}
  const critique=buildBlindCritique(text);
  document.getElementById('critiqueTA').value=critique;
  document.getElementById('critiquePreview').style.display='block';
  document.getElementById('critiqueTA').scrollIntoView({behavior:'smooth',block:'center'});
}

function copyCritique(){
  const text=document.getElementById('critiqueTA').value;
  navigator.clipboard.writeText(text).then(()=>{
    const btns=document.querySelectorAll('.critique-preview .abtn.ok');
    const btn=btns[btns.length-1]||event.target;
    if(btn){const orig=btn.textContent;btn.textContent='✓ Copied!';setTimeout(()=>btn.textContent=orig,2000);}
  });
}

function discardCritique(){
  document.getElementById('critiquePreview').style.display='none';
  document.getElementById('critiqueTA').value='';
}

// ── V15: CLIENT-SIDE CAUSAL CLAIM CHECKER ───────────────────────────────
const CAUSAL_PATTERNS=/\b(causes?|leads? to|results? in|drives?|driven by|is (?:the reason|why)|stems? from|due to)\b/i;
const MECHANISM_SIGNAL=/\bbecause\b/i;

function splitSentences(text){
  // Simple sentence splitter — good enough for a heuristic flag, not a parser.
  // Deliberately avoids regex lookbehind/lookahead for older-Safari compatibility.
  const normalized=text.replace(/\n+/g,' ');
  const withMarkers=normalized.replace(/([.!?])\s+(?=[A-Z0-9])/g,'$1\u0000');
  return withMarkers.split('\u0000')
    .map(s=>s.trim())
    .filter(s=>s.length>10);
}

function findUngroundedCausalClaims(text){
  const sentences=splitSentences(text);
  const flagged=[];
  sentences.forEach(s=>{
    if(CAUSAL_PATTERNS.test(s)&&!MECHANISM_SIGNAL.test(s)){
      flagged.push(s);
    }
  });
  return flagged;
}

function checkCausalClaims(){
  const text=document.getElementById('responseTA').value.trim();
  if(!text){alert('Paste the AI response first.');return}

  const flagged=findUngroundedCausalClaims(text);
  const summaryEl=document.getElementById('causalSummary');
  const listEl=document.getElementById('causalList');

  if(flagged.length===0){
    summaryEl.textContent='✓ No ungrounded causal claims detected — every causal-sounding sentence found included "because" or similar mechanism language.';
    listEl.innerHTML='';
  } else {
    summaryEl.textContent=`⚠ ${flagged.length} sentence${flagged.length!==1?'s':''} use causal language ("causes","leads to","drives", etc.) without stating a mechanism. This is a heuristic flag, not a definitive verdict — review each one:`;
    listEl.innerHTML=flagged.map((s,i)=>`<div class="causal-item"><span class="causal-num">${i+1}</span><span class="causal-text">${escapeHtml(s)}</span></div>`).join('');
  }

  document.getElementById('causalPreview').style.display='block';
  document.getElementById('causalPreview').scrollIntoView({behavior:'smooth',block:'center'});
}

function discardCausal(){
  document.getElementById('causalPreview').style.display='none';
  document.getElementById('causalList').innerHTML='';
  document.getElementById('causalSummary').textContent='';
}




// ── V10: PROMPT CHAINING ─────────────────────────────────────────────

function buildAntiSycoCompact(n){
  return `ANTI-SYCOPHANCY: ${BLUNTNESS_RULES[n]}
BANNED openers: "Great","Certainly!","Absolutely!","Of course!","Fascinating","Excellent point"
First sentence = your most critical observation — not a preamble.
DO NOT: hedge ("it depends","you could argue"), summarise what you just did, add motivational framing.
PUSHBACK PROTOCOL: If challenged, defend with specific evidence or state explicitly why you are adjusting.
BRIEF SYCOPHANCY: If the brief's premise is flawed, say so before answering.
SCOPE: Answer only what was asked. Flag adjacent questions — do not answer them.
`;
}

function buildChainSteps(modeId,brief,persona,audience,bluntness){
  const ant=buildAntiSycoCompact(bluntness);
  const pLine=persona?`You are specifically acting as: ${persona}. `:'';
  const aLine=audience?`\nCalibrate all output for: ${audience}.`:'';
  const ctx=`<context>\n${brief}\n</context>`;
  const PREV=n=>`\n[PASTE STEP ${n} OUTPUT HERE — replace this entire line with the AI's full response]`;

  const chains={
    business:[
      {title:'Brief Analysis',handoff:'Run this. Copy the full AI response — you need it for Step 2.',
       prompt:`Act as a blunt senior strategic analyst. ${pLine}Your ONLY task in this step: analyse and structure the brief. Do not recommend, conclude, or solve yet.${aLine}\n${ant}\nBrief:\n${ctx}\n\nProduce ONLY this structure:\n\nCORE REQUEST: [what they actually want, stripped of noise — 1–2 sentences]\nHIDDEN ASSUMPTIONS: [every assumption embedded in the brief — market, competition, execution, timing, budget]\nTHE REAL QUESTION: [the single question that determines whether to proceed]\nCRITICAL UNKNOWNS: [what you would need to know before any analysis is valid]\nINITIAL RISK SIGNAL: HIGH / MEDIUM / LOW — one specific reason\n\nDo not recommend. Do not analyse yet. Only structure.`},

      {title:'Assumption Audit',handoff:'Run this. Copy the full response — you need it for Steps 3 and 4.',
       prompt:`You are continuing a structured strategic analysis. You have structured the brief. Now audit every assumption.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 1 output:\n<step1>${PREV(1)}\n</step1>\n\nYour ONLY task: for every assumption in Step 1, plus any you identify now:\n\nASSUMPTION: [state precisely]\nCATEGORY: Market / Customer / Competition / Execution / Timing / Financial\nRISK LEVEL: HIGH / MEDIUM / LOW\nSPECIFIC FAILURE MECHANISM: [exactly how this assumption could be wrong — concrete, not generic]\nVALIDATION EVIDENCE NEEDED: [the specific data that would make this assumption safe]\n\nRank HIGH-risk assumptions first. Do not summarise. Do not recommend.`},

      {title:"Adversarial Challenge",handoff:'Run this. Copy the full response — you need it for Step 4.',
       prompt:`You are continuing a structured strategic analysis. You have the brief structure and assumption audit. Now pressure-test every HIGH-risk assumption.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 2 — Assumption Audit:\n<step2>${PREV(2)}\n</step2>\n\nFor every HIGH-risk assumption:\n\nASSUMPTION: [restate]\nFAILURE MODE: [exact mechanism by which this assumption causes the plan to fail]\nSTRONGEST EVIDENCE AGAINST IT: [specific — name competitors, cite analogous failures, reference market data]\nMINIMUM PROOF NEEDED: [the precise evidence required to de-risk this before proceeding]\n\nDo not soften. Your job is finding the failure mode, not evaluating the whole plan.`},

      {title:'Strategic Output',handoff:'This is your final deliverable.',
       prompt:`You are completing a structured strategic analysis.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 2 — Assumption Audit:\n<step2_output>${PREV(2)}\n</step2_output>\n\nStep 3 — Adversarial Challenge:\n<step3_output>${PREV(3)}\n</step3_output>\n\nProduce the final output:\n\nSITUATION: [what is objectively true based on the analysis — no spin]\nCOMPLICATION: [the real problem the brief doesn't acknowledge — be direct]\nRESOLUTION: [your recommendation — take a position, do not hedge]\n\nPRIORITY ACTIONS (ranked by leverage, not urgency):\n1. [action] — why first, what it unblocks\n2. [action] — what depends on action 1\n3. [action] — timeline and success signal\n\nKILL CONDITION: [the single signal that means the plan should stop — be specific]\n\nAUDIT: STACK INTACT or DRIFT — [brief note]`}
    ],

    code:[
      {title:'Requirements Analysis',handoff:'Run this. Copy the full response — you need it for Step 2.',
       prompt:`Act as a blunt senior software architect. ${pLine}Your ONLY task: analyse and clarify requirements. Do not design, architect, or implement yet.${aLine}\n${ant}\nBrief:\n${ctx}\n\nProduce ONLY:\n\nCORE TASK: [exactly what needs to be built — precise]\nEXPLICIT CONSTRAINTS: [constraints stated in the brief]\nIMPLICIT CONSTRAINTS: [constraints not stated but required by the context]\nAMBIGUITIES: [what is unclear and must be resolved before architecture]\nRISK SIGNALS: [technical risks visible in the brief — scalability, security, integration, performance]\nDEFINITION OF DONE: [precise, testable completion criteria — propose one if not in brief]`},

      {title:'Architecture Design',handoff:'Run this. Copy the full response — you need it for Step 3.',
       prompt:`You are continuing a structured engineering task. Requirements are clarified. Now design the architecture.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 1 — Requirements:\n<step1>${PREV(1)}\n</step1>\n\nProduce ONLY:\n\nCHOSEN APPROACH: [architecture pattern + specific rationale for THIS task]\nALTERNATIVES REJECTED: [what else you considered and exactly why you ruled it out]\nCOMPONENTS: [each module/layer with its single responsibility]\nDATA FLOW: [how data moves through the system, step by step]\nDEPENDENCIES: [external libs, APIs, services — with maintenance and risk notes]\nFAILURE POINTS: [where this architecture breaks and under what conditions]\nTRADE-OFFS: [what you are giving up with this approach]\n\nDo not implement. Architecture first.`},

      {title:'Implementation',handoff:'Run this. Copy the full response — you need it for Step 4.',
       prompt:`You are continuing a structured engineering task. Requirements and architecture are defined.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 1 — Requirements:\n<step1>${PREV(1)}\n</step1>\n\nStep 2 — Architecture:\n<step2>${PREV(2)}\n</step2>\n\nImplement following the Step 2 architecture exactly:\n• Clean, commented, production-ready code\n• Handle every failure point from Step 2\n• Business logic → <logic> tags | Config and data → <context> tags\n• Inline comments for non-obvious decisions\n\nIf you find a problem with the Step 2 architecture, flag it explicitly BEFORE writing code.`},

      {title:'Testing + Edge Cases',handoff:'This is your final deliverable.',
       prompt:`You are completing a structured engineering task. Implementation is done. Now produce the full testing strategy.\n${ant}\nStep 3 — Implementation:\n<step3>${PREV(3)}\n</step3>\n\nProduce:\n\nUNIT TESTS: [test cases per function — happy path + every failure path]\nINTEGRATION TESTS: [component boundary failures]\nEDGE CASES: [inputs or states the Step 3 implementation does not handle correctly]\nSECURITY CONSIDERATIONS: [specific vulnerabilities in this implementation]\nPERFORMANCE BOTTLENECKS: [where this slows at scale and why]\nTOP 3 IMPROVEMENTS: [what you would change with more time, ranked by impact]\n\nAUDIT: STACK INTACT or DRIFT — [brief note]`}
    ],

    research:[
      {title:'Scope Definition',handoff:'Run this. Copy the full response — you need it for Step 2.',
       prompt:`Act as a blunt research analyst. ${pLine}Your ONLY task: define the research scope and key questions. Do not begin researching yet.${aLine}\n${ant}\nBrief:\n${ctx}\n\nProduce ONLY:\n\nCENTRAL RESEARCH QUESTION: [the single question this research must answer]\nIN SCOPE: [topics, time periods, geographies, source types that are included]\nOUT OF SCOPE: [explicitly excluded — and why]\nKEY SUB-QUESTIONS: [4–6 specific questions that must be answered to address the main question]\nEVIDENCE STANDARDS: [what sources are acceptable and at what confidence level]\nOUTPUT FORMAT: [what the final research output should look like]\nFAILURE MODES: [how this research could mislead rather than inform]`},

      {title:'Evidence Mapping',handoff:'Run this. Copy the full response — you need it for Step 3.',
       prompt:`You are continuing a structured research task. Scope is defined. Now map the evidence landscape.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 1 — Scope:\n<step1>${PREV(1)}\n</step1>\n\nFor each sub-question from Step 1:\n\nSUB-QUESTION: [restate]\nEVIDENCE EXISTS: YES / PARTIAL / NO\nSTRONGEST SOURCE TYPES: [academic / industry reports / primary data / expert consensus]\nCONTESTED AREAS: [where experts or sources disagree, and the nature of the disagreement]\nGAPS: [what is unknown, unstudied, or unpublished]\nCONFIDENCE LEVEL: HIGH / MEDIUM / LOW — specific reason`},

      {title:'Analysis + Synthesis',handoff:'Run this. Copy the full response — you need it for Step 4.',
       prompt:`You are continuing a structured research task. Evidence landscape is mapped. Now analyse and synthesise.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 2 — Evidence Map:\n<step2>${PREV(2)}\n</step2>\n\nFor each sub-question, synthesise:\n\nCORE CLAIMS: [what the evidence shows — tag each with confidence]\n[VERIFIED] — sourced, high confidence\n[LIKELY] — reasonable inference\n[SPECULATIVE] — plausible, unconfirmed\n[UNKNOWN] — cannot verify, do not include\n\nCONTRADICTIONS: [where evidence conflicts — do not resolve artificially]\nCAVEATS: [conditions under which findings do not hold]`},

      {title:'Final Research Output',handoff:'This is your final deliverable.',
       prompt:`You are completing a structured research task.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 3 — Analysis:\n<step3>${PREV(3)}\n</step3>\n\nProduce the final report:\n\nEXECUTIVE SUMMARY: [3–4 sentences — the most important finding and its implication]\n\nFINDINGS BY SUB-QUESTION:\n[For each: verified claims with evidence, then likely claims with reasoning, then gaps]\n\nWHAT WE KNOW CONFIDENTLY: [VERIFIED findings]\nWHAT WE THINK IS TRUE: [LIKELY findings]\nWHAT WE DON'T KNOW: [gaps and unknowns — do not omit these]\n\nIMPLICATIONS: [what these findings mean for the original question]\nRECOMMENDED NEXT STEPS: [what to do with this information]\n\nAUDIT: STACK INTACT or DRIFT — [brief note]`}
    ],

    youtube:[
      {title:'Angle + Audience Analysis',handoff:'Run this. Copy the full response — you need it for Step 2.',
       prompt:`Act as a blunt YouTube content strategist. ${pLine}Your ONLY task: analyse the brief and find the sharpest possible angle. Do not write any script yet.${aLine}\n${ant}\nBrief:\n${ctx}\n\nProduce ONLY:\n\nTARGET VIEWER: [specific person — not a demographic, a specific viewer profile]\nTHEIR CURRENT STATE: [what they know, believe, or feel before watching]\nWHAT ALREADY EXISTS: [the most-watched videos on this topic and their angle]\nTHE GAP: [what those videos don't say that your viewer needs to hear]\nUNIQUE ANGLE: [the single angle that differentiates this video — precise]\nSCROLL-STOP SIGNAL: [why this viewer pauses their feed for THIS video specifically]\nRISK: [why this angle could fail to retain viewers]`},

      {title:'Payoffs + Outline',handoff:'Run this and get my approval before Step 3.',
       prompt:`You are continuing a structured scripting task. Angle and audience are defined.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 1 — Angle Analysis:\n<step1>${PREV(1)}\n</step1>\n\nProduce the outline with payoffs ONLY — no full script:\n\nCORE PAYOFFS (the value the viewer gets — list 3–5):\n[Payoff 1]: [what the viewer learns or feels — specific]\n[Payoff 2]: ...\n\nOUTLINE:\n[Section 1 — Hook]: [what creates immediate tension or curiosity]\n[Section 2 — Setup]: [context that makes the payoffs land]\n[Section 3 — Payoff delivery]: [how each payoff is revealed]\n[Section 4 — CTA]: [what you want them to do, and why they'll do it]\n\nWEAKEST PAYOFF: [which one is most likely to be skipped and why]`},

      {title:'Script Structure + Setups',handoff:'Run this. Copy the full response — you need it for Step 4.',
       prompt:`You are continuing a structured scripting task. Outline and payoffs are approved.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 2 — Outline:\n<step2>${PREV(2)}\n</step2>\n\nNow build the setups — the content that makes the payoffs earn their weight:\n\nFor each section in the outline:\nSECTION: [name]\nSETUP: [the content, argument, or story that leads to the payoff — write the actual script lines]\nTENSION MECHANISM: [what creates forward momentum — question, contradiction, or stakes]\nPACING NOTE: [fast / slow — and why]`},

      {title:'Hook + Intro + CTA',handoff:'This is your final deliverable.',
       prompt:`You are completing a structured scripting task.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 3 — Script structure:\n<step3>${PREV(3)}\n</step3>\n\nNow write the three hardest parts:\n\nHOOK (first 30 seconds — write word for word):\n[exact script — must create an immediate reason to keep watching]\n\nOPENING LINE OPTIONS (give 3 alternatives):\n1. [opening line]\n2. [opening line]\n3. [opening line]\n\nCTA (write word for word — 2 versions: subtle and direct):\nSubtle: [script]\nDirect: [script]\n\nWHY THE HOOK WORKS: [which psychological mechanism it uses and why it fits this viewer]\n\nAUDIT: STACK INTACT or DRIFT — [brief note]`}
    ],

    marketing:[
      {title:'Audience + Objection Analysis',handoff:'Run this. Copy the full response — you need it for Step 2.',
       prompt:`Act as a blunt direct-response copywriter. ${pLine}Your ONLY task: deconstruct the audience. Do not write any copy yet.${aLine}\n${ant}\nBrief:\n${ctx}\n\nProduce ONLY:\n\nSPECIFIC READER PROFILE: [not a demographic — a specific person in a specific moment]\nEMOTIONAL STATE AT POINT OF CONTACT: [what they are feeling when they encounter this copy]\nPRIMARY PAIN: [the thing keeping them up at night — specific, not generic]\nSECONDARY GAIN: [what they want to feel after buying/acting]\n#1 OBJECTION: [the single biggest reason they won't act — specific]\n#2 OBJECTION: [second biggest]\nTRUST GAP: [why they don't believe the claim yet]\nCOMPETITOR THEY'VE ALREADY TRIED: [or what they're currently doing instead]`},

      {title:'Copy Architecture',handoff:'Get my approval on this structure before Step 3.',
       prompt:`You are continuing a structured copywriting task. Audience analysis is done.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 1 — Audience Analysis:\n<step1>${PREV(1)}\n</step1>\n\nDesign the copy architecture ONLY — no full copy yet:\n\nHOOK MECHANISM: [which psychological trigger — curiosity gap / fear / social proof / specificity]\nHOOK DRAFT: [one sentence — the exact opening]\n\nSTRUCTURE:\n[Section 1]: [purpose + 1-sentence description]\n[Section 2]: [purpose + 1-sentence description]\n[Section 3]: [purpose + 1-sentence description]\n[CTA]: [desired action + urgency mechanism]\n\nOBJECTION HANDLING: [where each objection from Step 1 is addressed]\nBANNED WORDS IN THIS COPY: "game-changing","revolutionary","seamless","robust","leverage","synergy"\nWHY THIS STRUCTURE WORKS: [the persuasion logic in 2–3 sentences]`},

      {title:'Variant A — Primary Copy',handoff:'Run this. Copy the full response — you need it to write Variant B.',
       prompt:`You are continuing a structured copywriting task. Architecture is approved.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 2 — Architecture:\n<step2>${PREV(2)}\n</step2>\n\nWrite Variant A — the primary copy, following the approved architecture exactly:\n\n[Write the full copy]\n\nAfter the copy:\nPERSUASION MAP:\n- [Element]: [which persuasion principle] — [why it works for this specific reader]\n[repeat for each key element]\n\nWEAKEST LINE: [the one line most likely to lose the reader and why]`},

      {title:'Variant B — Alternative Angle',handoff:'This is your final deliverable.',
       prompt:`You are completing a structured copywriting task.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 3 — Variant A:\n<step3>${PREV(3)}\n</step3>\n\nWrite Variant B — a different angle and hook from Variant A:\n\nANGLE DIFFERENCE: [one sentence — what is fundamentally different about this approach]\n\n[Write the full Variant B copy]\n\nCOMPARISON:\nVariant A is stronger when: [specific condition]\nVariant B is stronger when: [specific condition]\nTest this first: [the element with the highest variance — most likely to outperform or underperform]\n\nAUDIT: STACK INTACT or DRIFT — [brief note]`}
    ],

    allpurpose:[
      {title:'Task Analysis',handoff:'Run this. Copy the full response — you need it for Step 2.',
       prompt:`Act as a blunt expert analyst. ${pLine}Your ONLY task: analyse what is actually being asked and what a high-quality answer requires. Do not produce the answer yet.${aLine}\n${ant}\nBrief:\n${ctx}\n\nProduce ONLY:\n\nACTUAL TASK: [what is really being asked — strip ambiguity]\nOUTPUT FORMAT REQUIRED: [what the final answer should look like to be maximally useful]\nQUALITY CRITERIA: [what makes a response good vs generic for this specific task]\nHIDDEN COMPLEXITY: [the parts of this task that are harder than they appear]\nCRITICAL CONSTRAINTS: [what the response must not do, assume, or ignore]\nTECHNIQUE: [which reasoning approach best fits this task and why]`},

      {title:'Draft Response',handoff:'Run this. Copy the full response — you need it for Step 3.',
       prompt:`You are continuing a structured task. The task has been analysed. Now produce the response.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 1 — Task Analysis:\n<step1>${PREV(1)}\n</step1>\n\nProduce the full response following the quality criteria and output format from Step 1 exactly.\nApply the technique identified in Step 1 explicitly — name each step as you execute it.\n\nAfter your response:\nSELF-ASSESSMENT:\n- Weakest section: [which part and why]\n- Biggest assumption made: [what you assumed that could be wrong]\n- What's missing: [what a better answer would include]`},

      {title:'Review + Refine',handoff:'This is your final deliverable.',
       prompt:`You are completing a structured task.\n${ant}\nOriginal brief:\n${ctx}\n\nStep 2 — Draft:\n<step2>${PREV(2)}\n</step2>\n\nReview the draft against the original brief and the self-assessment. Produce a refined final version:\n\nCHANGES MADE: [list what you changed from the draft and why]\nFINAL RESPONSE:\n[Write the refined final response]\n\nCONFIDENCE: HIGH / MEDIUM / LOW — specific reason\nWHAT WOULD IMPROVE THIS FURTHER: [the one thing a domain expert would add]\n\nAUDIT: STACK INTACT or DRIFT — [brief note]`}
    ]
  };

  return chains[modeId]||chains.allpurpose;
}


// ── V11: PER-STEP LENGTH DIRECTIVES ──────────────────────────────────
const STEP_LENGTHS={
  business:  ['Under 200 words','300–500 words','300–500 words','500–800 words'],
  code:      ['Under 250 words','300–600 words','Full implementation — as long as needed','300–500 words'],
  research:  ['Under 200 words','300–500 words','400–600 words','600–900 words'],
  youtube:   ['Under 200 words','Outline only — 300–400 words','Full script sections','200–400 words'],
  marketing: ['Under 200 words','Architecture only — 200–350 words','Full copy — as long as needed','Full copy — as long as needed'],
  allpurpose:['Under 200 words','As long as the task requires','Focused on changes + final — 300–500 words']
};
function addLengthDirectives(modeId,steps){
  const lens=STEP_LENGTHS[modeId]||[];
  return steps.map((s,i)=>({...s,prompt:lens[i]?`TARGET LENGTH FOR THIS STEP: ${lens[i]}\n\n`+s.prompt:s.prompt}));
}

// ── V11: AUTO-INJECT CHAIN HANDOFFS ──────────────────────────────────
const _injectTimers={};
function injectResponse(stepIdx,text){
  if(!text.trim())return;
  const placeholder=`[PASTE STEP ${stepIdx+1} OUTPUT HERE — replace this entire line]`;
  let injectedInto=[];
  for(let i=stepIdx+1;i<_chainSteps.length;i++){
    const ta=document.getElementById('cta'+i);
    if(!ta||!ta.value.includes(placeholder))continue;
    ta.value=ta.value.split(placeholder).join(text.trim());
    injectedInto.push(i+1);
    ta.style.transition='border-color .4s';
    ta.style.borderColor='var(--grn)';
    setTimeout(()=>{ta.style.borderColor='';},2500);
  }
  const st=document.getElementById('cis'+stepIdx);
  if(st)st.textContent=injectedInto.length?`✓ Auto-injected into Step ${injectedInto.join(' + Step ')}`:'';
}
function scheduleInject(stepIdx){
  clearTimeout(_injectTimers[stepIdx]);
  _injectTimers[stepIdx]=setTimeout(()=>{
    const ta=document.getElementById('cr'+stepIdx);
    if(ta&&ta.value.trim())injectResponse(stepIdx,ta.value.trim());
  },350);
}

// ── V11: EXPERT LAYER → CHAIN ─────────────────────────────────────────
function injectExpertLayerIntoChain(){
  const tech=(document.getElementById('forcedTechnique')||{value:''}).value.trim();
  const goodR=(document.getElementById('goodExample')||{value:''}).value.trim();
  const goodB=(document.getElementById('goodExBrief')||{value:''}).value.trim();
  const bad  =(document.getElementById('badExample')||{value:''}).value.trim();
  const dr   =(document.getElementById('domainRules')||{value:''}).value.trim();
  const model=(document.getElementById('modelSelect')||{value:'other'}).value;
  if(!tech&&!goodR&&!bad&&!dr&&(!model||model==='other'))return 0;
  let modified=0;
  const n=_chainSteps.length;

  // Domain rules + model calibration → every step
  const global=[];
  if(dr)global.push(`DOMAIN RULES:\n${dr}`);
  if(model&&model!=='other'&&MODEL_CALIBRATIONS[model])global.push(MODEL_CALIBRATIONS[model]);
  if(global.length){
    for(let i=0;i<n;i++){
      const ta=document.getElementById('cta'+i);
      if(!ta)continue;
      const block='\n'+global.join('\n\n')+'\n';
      ta.value=ta.value.replace('TARGET LENGTH',block.trim()+'\n\nTARGET LENGTH');
      modified++;
    }
  }

  // Forced technique → Step 1
  if(tech){
    const ta=document.getElementById('cta0');
    if(ta){ta.value=`TECHNIQUE OVERRIDE: Use ONLY ${tech}. Do not select another technique.\n\n`+ta.value;modified++;}
  }

  // Examples → final step only
  const lastTa=document.getElementById('cta'+(n-1));
  if(lastTa&&(goodR||bad)){
    let ex='\n━━━ FEW-SHOT EXAMPLES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    if(goodR){
      ex+=goodB
        ?`EXAMPLE INPUT → OUTPUT PAIR:\nBrief:\n<example_brief>\n${goodB}\n</example_brief>\n\nIdeal response:\n<good_example>\n${goodR}\n</good_example>\nMatch quality, depth, and register — not the content.\n\n`
        :`IDEAL OUTPUT EXAMPLE — match quality, depth, structure:\n<good_example>\n${goodR}\n</good_example>\n\n`;
    }
    if(bad)ex+=`AVOID THIS OUTPUT PATTERN:\n<bad_example>\n${bad}\n</bad_example>\n\n`;
    ex+='━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    const AUDIT='AUDIT: STACK INTACT';
    lastTa.value=lastTa.value.includes(AUDIT)
      ?lastTa.value.replace(AUDIT,ex+AUDIT)
      :lastTa.value+'\n'+ex;
    modified++;
  }
  return modified;
}

// ── CHAIN UI ──────────────────────────────────────────────────────────
let _chainSteps=[];
let _chainMode='';

function generateChain(){
  const rawIdea=document.getElementById('rawIdea').value.trim();
  if(!rawIdea){
    const ta=document.getElementById('rawIdea');
    ta.classList.add('shake');setTimeout(()=>ta.classList.remove('shake'),400);
    ta.focus();return;
  }
  const persona  =document.getElementById('personaInput').value.trim();
  const audience =document.getElementById('audienceInput').value.trim();
  const bluntness=parseInt(document.getElementById('bluntSlider').value);
  const modeId   =selectedModes[0];

  _chainMode=modeId;
  _chainSteps=addLengthDirectives(modeId,buildChainSteps(modeId,rawIdea,persona,audience,bluntness));
  if(_chainSteps.length>0){
    _chainSteps[0]={..._chainSteps[0],
      prompt:_chainSteps[0].prompt+'\n\nBefore producing the above, state in one sentence:\nINTERPRETED INTENT: [what you believe the user actually needs vs what they literally asked]\nIf these differ, state the difference and confirm which you are answering.'
    };
  }

  renderChain();
  const sec=document.getElementById('chainSection');
  sec.style.display='block';
  sec.classList.remove('reveal');void sec.offsetWidth;sec.classList.add('reveal');
  setTimeout(()=>sec.scrollIntoView({behavior:'smooth',block:'start'}),80);
  saveDefaults();
}

function renderChain(){
  const mode=MODES.find(m=>m.id===_chainMode);
  const n=_chainSteps.length;

  document.getElementById('chainMeta').innerHTML=`
    <span class="otag mode">${mode.icon} ${mode.name}</span>
    <span class="otag">${n} steps</span>
    <span class="otag auto">Est. quality: 16–17 / 20</span>
    <span class="otag">${new Date().toLocaleTimeString()}</span>`;

  document.getElementById('chainSteps').innerHTML=_chainSteps.map((step,i)=>`
    <div class="chain-card">
      <div class="chain-card-head">
        <span class="chain-num">Step ${i+1} of ${n}</span>
        <span class="chain-title">${step.title}</span>
      </div>
      <textarea class="chain-ta" id="cta${i}" rows="14" spellcheck="false">${step.prompt}</textarea>
      <div class="chain-card-foot">
        <div class="chain-actions">
          <button class="abtn ok" onclick="copyChainStep(${i})">⊕ Copy Step ${i+1}</button>
          <button class="abtn" onclick="dlChainStep(${i})">↓ .md</button>
        </div>
        <div class="chain-handoff">${i<n-1?'↓ '+step.handoff:'✓ '+step.handoff}</div>
      </div>
      ${i<n-1?`
      <div class="chain-response-area">
        <div class="chain-response-label">📥 Paste Step ${i+1} response → auto-fills Step ${i+2} placeholder</div>
        <textarea class="chain-response-ta" id="cr${i}" rows="4"
          placeholder="After running Step ${i+1}, paste the AI response here. It automatically replaces the placeholder in Step ${i+2} — no manual find-and-replace needed."
          oninput="scheduleInject(${i})"></textarea>
        <div class="chain-inject-status" id="cis${i}"></div>
      </div>`:''}
    </div>
    ${i<n-1?`<div class="chain-connector"><span>↓ response auto-injects into Step ${i+2}</span></div>`:''}
  `).join('');
  const elApplied=injectExpertLayerIntoChain();
  if(elApplied>0){const meta=document.getElementById('chainMeta');if(meta)meta.insertAdjacentHTML('beforeend','<span class="otag auto">⚡ Expert Layer applied</span>');}
}

function copyChainStep(i){
  const text=document.getElementById('cta'+i).value;
  navigator.clipboard.writeText(text).then(()=>{
    const btn=document.querySelectorAll('.chain-actions .abtn.ok')[i];
    if(btn){btn.textContent='✓ Copied!';setTimeout(()=>btn.textContent='⊕ Copy Step '+(i+1),2000)}
  });
}

function dlChainStep(i){
  const text=document.getElementById('cta'+i).value;
  const mode=MODES.find(m=>m.id===_chainMode);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
  a.download=`${mode.skillName}-chain-step-${i+1}.md`;
  a.click();URL.revokeObjectURL(a.href);
}

// ── V18: SPEC-DRIVEN CHAIN ───────────────────────────────────────────────────
// Loop-engineering-adjacent architecture: chain closes against a verifiable
// success condition rather than just producing output. Every step either
// satisfies the spec or explicitly flags why it doesn't.

let _specChainSteps = [];

function buildSpecChain(task, spec, persona, bluntness){
  const ant = buildAntiSycoCompact(bluntness);
  const pLine = persona ? `You are specifically acting as: ${persona}. ` : '';
  const PREV = n => `[PASTE STEP ${n} OUTPUT HERE — replace this entire line]`;

  return [
    {
      title: 'Spec Interpretation',
      handoff: 'Run this. Copy the full response — you need it for Step 2.',
      prompt: `${pLine}You are a rigorous analyst. Your ONLY job in this step is to interpret a task and its success spec with precision. Do not attempt the task yet.
${ant}
TASK:
<task>
${task}
</task>

SUCCESS SPEC (what "done" looks like):
<spec>
${spec}
</spec>

Produce ONLY this structure:

INTERPRETED TASK: [what is actually being asked — strip ambiguity, be precise]
INTERPRETED SPEC: [what "done" actually means — operationalised, not paraphrased]
SPEC GAPS: [anything in the spec that is ambiguous, unmeasurable, or could be gamed]
HIDDEN ASSUMPTIONS: [assumptions embedded in the task or spec that could cause failure]
FAILURE MODES: [the most likely ways an attempt could satisfy the spec superficially but fail in reality]
MEASURABILITY CHECK: [for each spec condition — can two independent people agree whether it was met? YES / PARTIAL / NO]

Do not attempt the task. Interpretation only.

INTERPRETED INTENT: [in one sentence — what the user actually needs vs what they literally asked]`
    },
    {
      title: 'First Attempt',
      handoff: 'Run this. Copy the full response — you need it for Step 3.',
      prompt: `You are continuing a spec-driven task. The spec has been interpreted. Now produce the first attempt.
${ant}
ORIGINAL TASK:
<task>
${task}
</task>

SUCCESS SPEC:
<spec>
${spec}
</spec>

Step 1 — Spec Interpretation:
<step1>
${PREV(1)}
</step1>

Produce the best attempt at the task you can given the above.

After your attempt, produce:
SELF-AUDIT AGAINST SPEC:
For each condition in the spec:
  CONDITION: [restate exactly]
  MET: YES / PARTIAL / NO
  EVIDENCE: [specific part of your output that satisfies or fails this condition]

WEAKEST POINT: [the single part of your attempt most likely to fail the spec under scrutiny]
CONFIDENCE: HIGH / MEDIUM / LOW — specific reason`
    },
    {
      title: 'Independent Spec Audit',
      handoff: 'Run this. Copy the full response — you need it for Step 4.',
      prompt: `You are a hostile spec auditor. Your job is to find every way the Step 2 attempt fails to satisfy the success spec. You are NOT the person who wrote the attempt. You owe it no loyalty.
${ant}
ORIGINAL TASK:
<task>
${task}
</task>

SUCCESS SPEC:
<spec>
${spec}
</spec>

Step 2 — First Attempt (what you are auditing):
<step2>
${PREV(2)}
</step2>

AUDIT — be specific, not general:

For each condition in the spec:
  CONDITION: [restate exactly]
  VERDICT: PASS / FAIL / PARTIAL
  REASON: [specific evidence from the attempt — quote the relevant section]
  IF FAIL OR PARTIAL: [exactly what would need to change to make this PASS]

OVERALL VERDICT: PASS / FAIL / PARTIAL
CRITICAL FAILURES: [conditions that must be fixed before this output is usable]
MINOR GAPS: [conditions that are close but could be improved]
RECOMMENDATION: ACCEPT AS-IS / REVISE / REJECT AND RESTART`
    },
    {
      title: 'Revised Final Output',
      handoff: 'This is your final deliverable.',
      prompt: `You are completing a spec-driven task. The first attempt has been audited. Now produce the final output, addressing every failure and gap the auditor identified.
${ant}
ORIGINAL TASK:
<task>
${task}
</task>

SUCCESS SPEC:
<spec>
${spec}
</spec>

Step 3 — Spec Audit (what you must address):
<step3>
${PREV(3)}
</step3>

If the Step 3 verdict was ACCEPT AS-IS: state this explicitly, explain why no revision is needed, and present the Step 2 output as the final deliverable.

If the verdict was REVISE or REJECT: produce the revised final output now, fixing every CRITICAL FAILURE and as many MINOR GAPS as possible.

After your output:
FINAL SPEC CHECK:
  For each condition: [condition] → MET / NOT MET + one sentence evidence
  SPEC SATISFIED: YES / NO / PARTIALLY
  REMAINING GAPS: [anything still unmet and why — do not hide failures]

AUDIT: STACK INTACT or DRIFT — [one sentence]`
    }
  ];
}

let _specChainMode = false;

function generateSpecChain(){
  const task = document.getElementById('specTask').value.trim();
  const spec = document.getElementById('specCondition').value.trim();
  if(!task){
    const el = document.getElementById('specTask');
    el.classList.add('shake'); setTimeout(()=>el.classList.remove('shake'),400);
    el.focus(); return;
  }
  if(!spec){
    const el = document.getElementById('specCondition');
    el.classList.add('shake'); setTimeout(()=>el.classList.remove('shake'),400);
    el.focus(); return;
  }

  const persona = document.getElementById('personaInput').value.trim();
  const bluntness = parseInt(document.getElementById('bluntSlider').value);

  _specChainSteps = buildSpecChain(task, spec, persona, bluntness);
  _specChainMode = true;

  renderSpecChain();
  const sec = document.getElementById('specChainSection');
  sec.style.display = 'block';
  sec.classList.remove('reveal'); void sec.offsetWidth; sec.classList.add('reveal');
  setTimeout(()=>sec.scrollIntoView({behavior:'smooth',block:'start'}), 80);
}

function renderSpecChain(){
  const n = _specChainSteps.length;
  document.getElementById('specChainMeta').innerHTML = `
    <span class="otag mode">🔁 Spec-Driven</span>
    <span class="otag">${n} steps</span>
    <span class="otag auto">Loop-engineering pattern</span>
    <span class="otag">${new Date().toLocaleTimeString()}</span>`;

  document.getElementById('specChainSteps').innerHTML = _specChainSteps.map((step,i)=>`
    <div class="chain-card spec-card">
      <div class="chain-card-head">
        <span class="chain-num spec-num">Step ${i+1} of ${n}</span>
        <span class="chain-title">${step.title}</span>
        ${i===2?'<span class="spec-audit-badge">Hostile Auditor</span>':''}
      </div>
      <textarea class="chain-ta" id="sct${i}" rows="14" spellcheck="false">${step.prompt}</textarea>
      <div class="chain-card-foot">
        <div class="chain-actions">
          <button class="abtn ok" onclick="copySpecStep(${i})">⊕ Copy Step ${i+1}</button>
          <button class="abtn" onclick="dlSpecStep(${i})">↓ .md</button>
        </div>
        <div class="chain-handoff">${i<n-1?'↓ '+step.handoff:'✓ '+step.handoff}</div>
      </div>
      ${i<n-1?`
      <div class="chain-response-area">
        <div class="chain-response-label">📥 Paste Step ${i+1} response → auto-fills Step ${i+2} placeholder</div>
        <textarea class="chain-response-ta" id="scr${i}" rows="4"
          placeholder="Paste the AI response here. It automatically replaces the placeholder in Step ${i+2}."
          oninput="scheduleSpecInject(${i})"></textarea>
        <div class="chain-inject-status" id="scis${i}"></div>
      </div>`:''}
    </div>
    ${i<n-1?`<div class="chain-connector"><span>↓ response auto-injects into Step ${i+2}</span></div>`:''}`
  ).join('');
}

function copySpecStep(i){
  const text = document.getElementById('sct'+i).value;
  navigator.clipboard.writeText(text).then(()=>{
    const btns = document.querySelectorAll('.spec-card .chain-actions .abtn.ok');
    if(btns[i]){const orig=btns[i].textContent;btns[i].textContent='✓ Copied!';setTimeout(()=>btns[i].textContent=orig,2000);}
  });
}

function dlSpecStep(i){
  const text = document.getElementById('sct'+i).value;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text],{type:'text/plain'}));
  a.download = `spec-chain-step-${i+1}.md`;
  a.click(); URL.revokeObjectURL(a.href);
}

const _specInjectTimers = {};
function scheduleSpecInject(stepIdx){
  clearTimeout(_specInjectTimers[stepIdx]);
  _specInjectTimers[stepIdx] = setTimeout(()=>{
    const ta = document.getElementById('scr'+stepIdx);
    if(!ta||!ta.value.trim()) return;
    const text = ta.value.trim();
    const placeholder = `[PASTE STEP ${stepIdx+1} OUTPUT HERE — replace this entire line]`;
    let injected = [];
    for(let i=stepIdx+1; i<_specChainSteps.length; i++){
      const next = document.getElementById('sct'+i);
      if(!next||!next.value.includes(placeholder)) continue;
      next.value = next.value.split(placeholder).join(text);
      injected.push(i+1);
      next.style.transition='border-color .4s';
      next.style.borderColor='var(--grn)';
      setTimeout(()=>{next.style.borderColor='';},2500);
    }
    const st = document.getElementById('scis'+stepIdx);
    if(st) st.textContent = injected.length
      ? `✓ Auto-injected into Step ${injected.join(' + Step ')}`
      : '';
  }, 350);
}

function toggleSpecHowto(){
  const b = document.getElementById('specHowtoBody');
  const btn = document.getElementById('specHowtoBtn');
  b.classList.toggle('vis');
  btn.textContent = b.classList.contains('vis') ? '▲ Hide guide' : '▼ What is this?';
}

function toggleChainHowto(){
  const b=document.getElementById('chainHowtoBody');
  const btn=document.getElementById('chainHowtoBtn');
  b.classList.toggle('vis');
  btn.textContent=b.classList.contains('vis')?'▲ Hide instructions':'▼ Show how to use this chain';
}

// ── INIT ──────────────────────────────────────────────────────────────
renderCards();
renderHistory();
renderFwList();
loadDefaults();
renderCalibrationInsights();
loadUIMode();
loadPathMode();
// Auto-save on Advanced Options changes
['personaInput','audienceInput','bluntSlider'].forEach(id=>{
  const el=document.getElementById(id);
  if(el)el.addEventListener('input',scheduleDefaultsSave);
});
if(!localStorage.getItem('blunt_seen_v18'))document.getElementById('helpBtn').classList.add('pulse');
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeModal();
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){document.getElementById('pathMinimal').classList.contains('active')?generateMinimal():generate();}
  if(e.shiftKey&&e.key==='Enter'){e.preventDefault();applyExpertLayer();}
});
