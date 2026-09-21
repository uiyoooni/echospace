const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const DATA={
 forest:[
  ["🌲","소나무","producer"],["🌳","참나무","producer"],["🌱","풀","producer"],["🐿️","다람쥐","consumer"],
  ["🐛","애벌레","consumer"],["🦉","부엉이","consumer"],["🦌","사슴","consumer"],["🍄","버섯","decomposer"],
  ["🪱","지렁이","decomposer"],["☀️","햇빛","abiotic"],["💧","물","abiotic"],["🪨","돌","abiotic"]
 ],
 river:[
  ["🌿","수초","producer"],["🌱","조류","producer"],["🐟","물고기","consumer"],["🦆","오리","consumer"],
  ["🐸","개구리","consumer"],["🦦","수달","consumer"],["🪱","지렁이","decomposer"],["🍄","버섯","decomposer"],
  ["☀️","햇빛","abiotic"],["💧","물","abiotic"],["🪨","돌","abiotic"],["🌡️","온도","abiotic"]
 ],
 ocean:[
  ["🌊","해조류","producer"],["🦠","식물플랑크톤","producer"],["🐟","작은 물고기","consumer"],["🐠","물고기","consumer"],
  ["🐙","문어","consumer"],["🦈","상어","consumer"],["🦀","게","consumer"],["🦐","새우","consumer"],
  ["🪱","해양 분해자","decomposer"],["☀️","햇빛","abiotic"],["🌊","바닷물","abiotic"],["🪨","해저 바위","abiotic"]
 ]};
const ROLE={producer:"생산자",consumer:"소비자",decomposer:"분해자"};
const state={step:1,eco:null,selected:[],biotic:{},roles:{},relations:[],placed:[],selectedPalette:null,sceneDraw:[]};

function emojiFor(name){return DATA[state.eco]?.find(x=>x[1]===name)?.[0]||"•"}
function organisms(){return DATA[state.eco].filter(x=>x[2]!=="abiotic")}
function go(step){
 state.step=step; $$(".screen").forEach((x,i)=>x.classList.toggle("active",i===step-1));
 $("#stepText").textContent=`${step} / 7`;
 $("#prevBtn").style.visibility=step===1?"hidden":"visible";
 $("#nextBtn").style.display=step===7?"none":"block";
 if(step===2)renderOrganisms();
 if(step===3)renderBiotic();
 if(step===4)renderRoles();
 if(step===5)renderFood();
 if(step===6)renderScene();
 if(step===7)renderSummary();
 window.scrollTo({top:0,behavior:"smooth"});
}
function renderOrganisms(){
 $("#organismGrid").innerHTML=organisms().map(x=>`<button class="organism ${state.selected.includes(x[1])?"selected":""}" data-name="${x[1]}"><span class="emoji">${x[0]}</span><b>${x[1]}</b></button>`).join("");
 $("#selectedCount").textContent=`${state.selected.length}개 선택`;
}
function renderBiotic(){
 const all=[...DATA[state.eco]];
 $("#bioticList").innerHTML=all.filter(x=>x[2]!=="abiotic" || state.selected.includes(x[1])).map(x=>{
  const name=x[1], val=state.biotic[name];
  return `<div class="class-row"><div class="item-label"><span>${x[0]}</span>${name}</div><div class="options">
  <button class="opt ${val==="biotic"?"active":""}" data-biotic="${name}:biotic">생물</button>
  <button class="opt ${val==="abiotic"?"active":""}" data-biotic="${name}:abiotic">무생물</button></div></div>`}).join("");
}
function renderRoles(){
 const names=state.selected.filter(n=>state.biotic[n]==="biotic");
 $("#roleList").innerHTML=names.map(name=>`<div class="class-row"><div class="item-label"><span>${emojiFor(name)}</span>${name}</div><div class="options">
 ${Object.entries(ROLE).map(([k,v])=>`<button class="opt ${state.roles[name]===k?"active":""}" data-role="${name}:${k}">${v}</button>`).join("")}</div></div>`).join("") || `<p>앞 단계에서 생물로 분류한 생물이 없습니다.</p>`;
}
function renderFood(){
 const names=state.selected.filter(n=>state.biotic[n]==="biotic");
 $("#foodList").innerHTML=names.map(name=>`<button class="organism ${state._foodFrom===name?"selected":""}" data-food="${name}"><span class="emoji">${emojiFor(name)}</span><b>${name}</b></button>`).join("");
 $("#relationList").innerHTML=state.relations.map((r,i)=>`<div class="relation"><span>${emojiFor(r[0])} ${r[0]} → ${emojiFor(r[1])} ${r[1]}</span><button class="remove" data-remove="${i}">삭제</button></div>`).join("");
}
function renderScene(){
 const items=[...DATA[state.eco]];
 $("#palette").innerHTML=items.map((x,i)=>`<button class="palette-item ${state.selectedPalette===i?"active":""}" data-palette="${i}"><span class="emoji">${x[0]}</span>${x[1]}</button>`).join("");
 const layer=$("#placedLayer"); layer.innerHTML="";
 state.placed.forEach(p=>{
  const el=document.createElement("div"); el.className="placed"; el.textContent=p.emoji;
  el.style.left=(p.x*100)+"%";el.style.top=(p.y*100)+"%";layer.appendChild(el);
 });
 const c=$("#sceneCanvas"), ctx=c.getContext("2d"), rect=c.getBoundingClientRect(), dpr=devicePixelRatio||1;
 c.width=rect.width*dpr;c.height=rect.height*dpr;ctx.scale(dpr,dpr);
 ctx.strokeStyle="#4d9b63";ctx.lineWidth=2;ctx.lineCap="round";
 state.sceneDraw.forEach(line=>{ctx.beginPath();line.forEach((p,i)=>i?ctx.lineTo(p.x*rect.width,p.y*rect.height):ctx.moveTo(p.x*rect.width,p.y*rect.height));ctx.stroke()});
}
function renderSummary(){
 const bio=Object.entries(state.biotic).filter(([_,v])=>v==="biotic").map(([n])=>n);
 const roles=Object.entries(state.roles).map(([n,v])=>`${n}: ${ROLE[v]}`);
 $("#summary").innerHTML=`<b>생태계:</b> ${state.eco==="forest"?"숲":state.eco==="river"?"강":"바다"}<br>
 <b>고른 생물:</b> ${state.selected.join(", ")||"없음"}<br>
 <b>생물:</b> ${bio.join(", ")||"없음"}<br>
 <b>역할:</b> ${roles.join(" / ")||"아직 분류하지 않음"}<br>
 <b>먹이 관계:</b> ${state.relations.length}개<br>
 <b>생태계 구성:</b> ${state.placed.length}개 배치`;
}

document.addEventListener("click",e=>{
 const b=e.target.closest("button"); if(!b)return;
 if(b.matches(".big-choice")){
  state.eco=b.dataset.eco;state.selected=[];state.biotic={};state.roles={};state.relations=[];state.placed=[];go(2);return;
 }
 if(b.matches(".organism[data-name]")){
  const n=b.dataset.name; state.selected=state.selected.includes(n)?state.selected.filter(x=>x!==n):[...state.selected,n];renderOrganisms();return;
 }
 if(b.matches("[data-biotic]")){
  const [n,v]=b.dataset.biotic.split(":");state.biotic[n]=v;renderBiotic();return;
 }
 if(b.matches("[data-role]")){
  const [n,v]=b.dataset.role.split(":");state.roles[n]=v;renderRoles();return;
 }
 if(b.matches("[data-food]")){
  const n=b.dataset.food;
  if(!state._foodFrom){state._foodFrom=n;renderFood();return}
  if(state._foodFrom!==n){
   if(!state.relations.some(r=>r[0]===state._foodFrom&&r[1]===n))state.relations.push([state._foodFrom,n]);
  }
  state._foodFrom=null;renderFood();return;
 }
 if(b.matches("[data-remove]")){state.relations.splice(+b.dataset.remove,1);renderFood();return}
 if(b.matches("[data-palette]")){state.selectedPalette=+b.dataset.palette;renderScene();return}
 if(b.id==="clearScene"){state.placed=[];state.sceneDraw=[];renderScene();return}
 if(b.id==="prevBtn"){if(state.step>1)go(state.step-1);return}
 if(b.id==="nextBtn"){
  if(state.step===2&&state.selected.length<3){alert("생물을 3개 이상 골라 주세요.");return}
  if(state.step===3 && state.selected.some(n=>!state.biotic[n])){alert("모든 생물을 생물/무생물로 분류해 주세요.");return}
  if(state.step===4 && state.selected.some(n=>state.biotic[n]==="biotic"&&!state.roles[n])){alert("생물의 역할을 모두 선택해 주세요.");return}
  if(state.step<7)go(state.step+1);return;
 }
 if(b.id==="submitBtn"){
  const name=$("#studentName").value.trim();if(!name){alert("이름을 입력해 주세요.");return}
  const result={student_name:name,ecosystem:state.eco,selected:state.selected,biotic:state.biotic,roles:state.roles,relations:state.relations,placed:state.placed,created_at:new Date().toISOString()};
  localStorage.setItem("ecosystem-last-submission",JSON.stringify(result));
  alert("제출 완료! 🎉\n현재는 이 태블릿에 저장되었습니다.");
 }
});

// Touch-friendly ecosystem builder: select a material, then TAP a location.
// Also supports finger drawing on the canvas, but never requires drag-and-drop.
$("#sceneCanvas").addEventListener("pointerdown",e=>{
 if(state.step!==6)return;
 const c=e.currentTarget, r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
 if(state.selectedPalette!==null){
   const item=DATA[state.eco][state.selectedPalette];
   state.placed.push({emoji:item[0],name:item[1],x,y});
   state.selectedPalette=null;renderScene();return;
 }
 let drawing=[{x,y}];state.sceneDraw.push(drawing);
 const move=ev=>{const p={x:(ev.clientX-r.left)/r.width,y:(ev.clientY-r.top)/r.height};drawing.push(p);renderScene()};
 const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up)};
 window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);
},{passive:true});

go(1);
