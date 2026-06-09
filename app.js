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
const TKEY='blunt_v7_templates';

// ── V7: STATE ─────────────────────────────────────────────────────────
let diffBaseId=null;

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
function openModal(){document.getElementById('modalBackdrop').classList.add('open');document.body.style.overflow='hidden';document.getElementById('helpBtn').classList.remove('pulse');localStorage.setItem('blunt_seen_v6','1')}
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
  const idx=selectedModes.indexOf(id);
  if(idx!==-1){if(selectedModes.length>1)selectedModes.splice(idx,1)}
  else if(selectedModes.length<2){selectedModes.push(id)}
  else{selectedModes[1]=id}
  renderCards();
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
    {label:'No vague language',   ok:vagueRatio<0.04}
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
━━━ TECHNIQUE STACK SELECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Read the task above. Diagnose which challenge types are present.
Self-select a compatible stack. Only include techniques genuinely
warranted — unused techniques dilute focus and waste tokens.

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
  ✗ CoT + ToT                           (ToT runs CoT on each branch — redundant)
  ✗ MECE + Analogical as co-primaries   (competing focus: exhaustive vs. singular transfer)
  ✗ Adversarial + Analogical as co-primaries (incompatible baseline assumptions)
  ✗ Socratic + MECE                     (Socratic questions the frame; MECE assumes it)
  ✗ Step-Back + First Principles        (both abstract but in incompatible directions)
  ✗ Analogical + First Principles       (Analogical imports assumptions; FP strips them)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;}

function buildOutputStructure(modeId,n){
  const m=BLUNTNESS_MODS[n];
  const s={
    youtube:`OUTPUT STRUCTURE:
1. Draft a structured outline with payoffs (core viewer value) for my approval. No full script yet.
   ${n>=3?'Identify the weakest payoffs first and explain specifically why they will fail to engage.':'Flag payoffs that may not resonate with the target audience.'}
2. Get my explicit approval on the payoffs before proceeding.
3. After approval — sequential expansion only: setups → tension arcs → hook → CTA. One section at a time.`,
    allpurpose:`OUTPUT STRUCTURE:
1. Generate the final task prompt using Bento-Box architecture.
   Imperative actions → <actions> XML tags. Raw data and context → <context> XML tags. Strictly separated.
2. Justify every structural decision.
   ${n>=4?'Challenge your own architecture before presenting — identify the most likely failure point first.':''}`,
    code:`OUTPUT STRUCTURE:
1. Architecture outline first: modules, data flow, dependencies, failure points. Flag every trade-off explicitly.
   ${n>=3?'Assume the first architecture you think of is wrong. Prove why the chosen approach survives over alternatives.':'Await my approval before writing any code.'}
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
BANNED WORDS — auto-fail: "game-changing","revolutionary","innovative","world-class","seamless","robust","leverage","synergy", any adjective not backed by a specific fact.
1. Audience deconstruction: primary pain, secondary gains, biggest objection, emotional state at point of contact.
2. Copy architecture for my approval before writing.
   ${n>=3?'Assume your first proposed structure will not convert. Prove why it will before presenting it.':''}
3. Dual variants: Variant A + Variant B with different angle/hook. For each: list every persuasion principle applied and why.`
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
━━━ STACK AUDIT — REQUIRED AFTER YOUR OUTPUT ━━━━━━━━━━━━━━━━━━━━━

Before finalising your response, audit your own work:

For each declared technique:
  PRIMARY:   Did you apply it? Cite one specific place in your output where it appears.
  SECONDARY: Did you apply it? Cite where — or explain why it was not needed.
  VERIFY:    Did you apply CoVe or conduct the Interview? Are all claims tagged?

DRIFT ASSESSMENT:
  Executed declared stack as stated       → STACK INTACT
  Partially or fully skipped a layer      → STATE DRIFT: what changed and why

End every response with exactly one line:
  AUDIT: STACK INTACT
  or
  AUDIT: DRIFT — [specific description of what drifted and why]

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

// ── MAIN PROMPT BUILDER ───────────────────────────────────────────────
function buildPrompt(modeIds,rawIdea,persona,audience,bluntness,expertise,outLen){
  const isDual=modeIds.length===2;
  const m1=MODES.find(x=>x.id===modeIds[0]);
  const m2=isDual?MODES.find(x=>x.id===modeIds[1]):null;

  const pLine=persona?`You are specifically acting as: ${persona}.`:'';
  const aLine=audience?`\nAll output must be calibrated for this target audience: ${audience}.`:'';

  const roles={youtube:'a blunt, expert YouTube Content Strategist and Script Architect',allpurpose:'a blunt, elite-level AI Prompt Architect and Domain Expert',code:'a blunt, elite-level Software Architect and Senior Engineer',business:"a blunt, McKinsey-level Business Strategist and Devil's Advocate",research:'a blunt, expert Research Analyst and Epistemic Critic',marketing:'a blunt, conversion-obsessed Direct Response Copywriter'};
  const goals={youtube:'transform my raw video idea into a sequentially structured, high-retention YouTube script.',allpurpose:'transform my raw idea into a rigorous Bento-Box task prompt with strictly separated instructions and data.',code:'transform my technical task into a clean, production-grade engineering solution.',business:'pressure-test my idea, expose strategic weaknesses, and produce a rigorous strategic analysis.',research:'produce a structured, deeply accurate deep-dive with a clear information hierarchy and confidence-rated claims.',marketing:'produce high-impact, fluff-free marketing copy that is ruthlessly audience-focused and conversion-driven.'};
  const ctxLabels={youtube:'My raw video idea',allpurpose:'My raw idea/task',code:'My technical task/problem',business:'My business idea/question',research:'My research topic/question',marketing:'My copy task'};

  const roleStr=isDual?`${roles[modeIds[0]]} for Phase 1, transitioning to ${roles[modeIds[1]]} for Phase 2`:roles[modeIds[0]];
  const goalStr=isDual?`complete a structured two-phase session: Phase 1 as ${m1.name}, Phase 2 as ${m2.name}.`:goals[modeIds[0]];
  const ctxLabel=isDual?'My task/brief (applies to both phases)':ctxLabels[modeIds[0]];
  const outputStructure=isDual?buildDualOutputStructure(modeIds,bluntness):buildOutputStructure(modeIds[0],bluntness);

  const body=`Act as ${roleStr}. ${pLine} Your goal is to ${goalStr}${aLine}

${buildAntiSyco(bluntness)}${buildNegativeSpace()}${buildPushback()}${buildExpertise(expertise)}${buildOutputLength(outLen)}${ctxLabel}:
<context>
${rawIdea}
</context>
${buildTechStack(bluntness)}
${outputStructure}
${buildStackAudit()}
${buildClosing()}`;

  return body.replace(/\n{3,}/g,'\n\n').trim();
}

// ── GENERATE ──────────────────────────────────────────────────────────
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

  let body=buildPrompt(selectedModes,rawIdea,persona,audience,bluntness,expertiseLevel,outputLen);
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
  sec.style.display='block';sec.classList.remove('reveal');void sec.offsetWidth;sec.classList.add('reveal');
  setTimeout(()=>sec.scrollIntoView({behavior:'smooth',block:'start'}),80);
  saveHistory(selectedModes,rawIdea,body,bluntness,expertiseLevel,outputLen);
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
const HKEY='blunt_v6_history';

function saveHistory(modeIds,idea,prompt,bluntness,expertise,outLen){
  let h=loadHistory();
  const m1=MODES.find(x=>x.id===modeIds[0]);
  const m2=modeIds.length===2?MODES.find(x=>x.id===modeIds[1]):null;
  h.unshift({id:Date.now(),
    modeIds:modeIds.slice(),
    modeName:m2?`${m1.name} + ${m2.name}`:m1.name,
    idea:idea.substring(0,120),prompt,bluntness,expertise,outLen,note:'',rating:0,used:false,
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

function filterHistory(q){
  const h=loadHistory();const ql=q.toLowerCase();
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

// ── INIT ──────────────────────────────────────────────────────────────
renderCards();
renderHistory();
renderFwList();
if(!localStorage.getItem('blunt_seen_v6'))document.getElementById('helpBtn').classList.add('pulse');
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeModal();
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter')generate();
});
