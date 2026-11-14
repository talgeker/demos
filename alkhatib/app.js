(()=>{
const WA='972522231287';
const isM=matchMedia('(max-width:900px)').matches;
const dpr=Math.min(devicePixelRatio||1,2);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
let LANG='he';const LI={he:0,en:1,ar:2};
const tx=a=>a[LI[LANG]]||a[0];

/* ---------- data ---------- */
// [id, img, cat, name[he,en,ar], desc[he,en,ar], hot, orderable]
const M=[
['knafeh','knafeh','k',['כנאפה עם גלידה תורכית','Knafeh with Turkish ice cream','كنافة مع بوظة تركية'],['המנה של הבית. כנאפה עגולה וחמה, ומעליה פרוסה עבה של גלידה תורכית ופיסטוק.','The house plate. A hot round knafeh under a thick slice of Turkish ice cream and pistachio.','طبق البيت. كنافة مدوّرة ساخنة تعلوها شريحة سميكة من البوظة التركية والفستق.'],1,1],
['baklava','baklava-pistachio','b',['בקלאווה מעורבת','Mixed baklava','بقلاوة مشكّلة'],['מבחר מהמגשים של הבוקר: פיסטוק, אגוזים וקשיו. במשקל או במגש.','A pick from the morning trays: pistachio, walnut and cashew. By weight or by tray.','تشكيلة من صواني الصباح: فستق، جوز وكاجو. بالوزن أو بالصينية.'],1,1],
['layali','layali','h',['לילות ביירות','Layali Beirut','ليالي بيروت'],['קרם סולת ומסטיקה, קצפת בזילוף, פיסטוק וניצן ורד.','Semolina and mastic cream, piped cream, pistachio and a rosebud.','كريمة سميد ومستكة، قشطة، فستق وزهرة ورد.'],1,1],
['classic','knafeh-nablusi','k',['כנאפה קלאסית','Classic knafeh','كنافة كلاسيكية'],['בלי גלידה. קדאיף דק ופריך מעל גבינה לבנה נמסה, לא מתוקה מדי.','No ice cream. Thin crisp kadaif over melting white cheese, never too sweet.','بدون بوظة. كنافة رفيعة مقرمشة فوق جبنة بيضاء ذائبة، غير حلوة زيادة.'],0,1],
['malabi','malabi','h',['מלבי עם פרלין אגוזים','Malabi with nut praline','مهلبية مع برالين المكسّرات'],['מלבי סורי רך על בסיס סולת, ומעליו שכבת פרלין אגוזים קראנצ׳ית.','Soft Syrian malabi on a semolina base, topped with a crunchy nut praline.','مهلبية سورية طريّة على قاعدة سميد، تعلوها طبقة برالين مقرمشة.'],0,1],
['pist','pist','b',['בקלאווה פיסטוק','Pistachio baklava','بقلاوة فستق'],['הבקלאווה הירוקה: רולים מלאים פיסטוק עד הקצה.','The green one: rolls packed with pistachio to the edge.','البقلاوة الخضراء: لفائف محشوّة بالفستق حتى آخرها.'],0,1],
['halawet','halawet','h',['חלאוות אל ג׳יבן','Halawet el-jibn','حلاوة الجبن'],['גלילי בצק גבינה רכים במילוי קרם, עם פיסטוק ועלי ורדים.','Soft cheese-dough rolls filled with cream, pistachio and rose petals.','لفائف عجينة الجبن الطريّة محشوّة بالقشطة، مع فستق وورد.'],0,1],
['trilece','trilece','h',['טרילאצ׳ה','Trileçe','تريليتشا'],['עוגת שלושת החלבים הטורקית, עם קרמל מבריק מעל. הילדים לא משאירים פירור.','The Turkish three-milk cake under a glossy caramel top. Kids leave nothing behind.','كعكة الحليب التركية بثلاثة أنواع حليب، يعلوها كراميل لامع.'],0,1],
['madlouka','madlouka','h',['מדלוקה סורית','Syrian madlouka','مدلوقة سورية'],['קרם לבן, פירורי כנאפה, פיסטוק ושקדים וקשיו קלויים.','White cream, knafeh crumb, pistachio and roasted almonds and cashews.','قشطة، فتات الكنافة، فستق ولوز وكاجو محمّص.'],0,1],
['shell','shell','b',['בקלאווה תורכית','Turkish baklava','بقلاوة تركية'],['בצורת צדף, עלים דקים ופריכים במילוי קרם ופיסטוק.','Shell-shaped, thin crisp layers filled with cream and pistachio.','على شكل صدفة، رقائق رفيعة مقرمشة محشوّة بالقشطة والفستق.'],0,1],
['rolls','rolls','k',['גלילי כנאפה ברוטב תות','Knafeh rolls in strawberry sauce','لفائف كنافة بصلصة الفراولة'],['גלילי קדאיף במילוי קרם על רוטב תות חמצמץ. הטוויסט של השף.','Kadaif rolls filled with cream on a tangy strawberry sauce. The chef’s twist.','لفائف كنافة محشوّة بالقشطة على صلصة فراولة حامضة. لمسة الشيف.'],0,1],
['nests','nests','b',['קן ציפור','Bird’s nest baklava','عشّ البلبل'],['קן קדאיף זהוב מלא פיסטוקים שלמים.','A golden kadaif nest filled with whole pistachios.','عشّ من الكنافة الذهبية مليء بالفستق الكامل.'],0,1],
['burma','burma','b',['בורמה פיסטוק','Pistachio burma','بورما فستق'],['גליל קדאיף ארוך ופריך עם לב ירוק של פיסטוק.','A long crisp kadaif roll with a green pistachio heart.','لفافة كنافة طويلة مقرمشة بقلب أخضر من الفستق.'],0,1],
['balls','balls','b',['בקלאווה קושטא','Qushta pistachio bites','بقلاوة بالقشطة'],['כיפות פיסטוק במילוי קושטא. פיתוח של המקום.','Pistachio domes filled with qushta cream. A house creation.','قبب فستق محشوّة بالقشطة. من ابتكار المحل.'],0,1],
['awwameh','awwameh','b',['עוואמה','Awwameh','عوّامة'],['כדורי בצק פריכים טבולים בסירופ.','Crisp dough balls dipped in syrup.','كرات عجين مقرمشة مغموسة بالقطر.'],0,1],
['round','fatir','b',['בקלאווה במגש עגול','Round-tray baklava','بقلاوة صينية مدوّرة'],['עלים דקים ופיסטוק, נחתכת למשולשים מול העיניים.','Thin layers and pistachio, cut into triangles in front of you.','رقائق رفيعة وفستق، تُقطَّع مثلّثات أمامك.'],0,1],
['basbousa','harisa','h',['בסבוסה','Basbousa','بسبوسة'],['עוגת סולת לחה בסירופ עדין, גם בגרסת קוקוס.','Moist semolina cake in a gentle syrup, also with coconut.','كعكة سميد رطبة بقطر خفيف، ومنها بجوز الهند.'],0,1],
['tray','gift-box','b',['מגש מעורב לאירוח','Mixed hosting tray','صينية ضيافة مشكّلة'],['מרכיבים יחד לפי מה שאתם אוהבים, ארוז יפה לקחת.','Put together around what you like, packed to go.','نركّبها معًا حسب ذوقك، مغلّفة للأخذ.'],0,1],
['coffee','druze-coffee','d',['קפה שחור','Black coffee','قهوة سادة'],['מגיע לשולחן בלי לבקש. על חשבון הבית.','Arrives at your table without asking. On the house.','تصل إلى الطاولة دون أن تطلب. على حساب المحل.'],0,0],
];
const byId=Object.fromEntries(M.map(m=>[m[0],m]));
const CATS=[['all',['הכל','All','الكل']],['k',['כנאפה','Knafeh','كنافة']],['b',['בקלאווה','Baklava','بقلاوة']],['h',['קינוחי השף','Chef’s desserts','حلويات الشيف']],['d',['קפה','Coffee','قهوة']]];
const BASES=[['knafeh','knafeh',['כנאפה עם גלידה תורכית','Knafeh + Turkish ice cream','كنافة مع بوظة تركية'],['המנה שכולם באים בשבילה','The plate everyone comes for','الطبق الذي يأتي الجميع لأجله'],['המנה של הבית','The house plate','طبق البيت']],
['classic','knafeh-nablusi',['כנאפה קלאסית','Classic knafeh','كنافة كلاسيكية'],['בלי גלידה, גבינה נמתחת','No ice cream, stretchy cheese','بدون بوظة، جبنة تتمدّد'],['הקלאסיקה','The classic','الكلاسيكية']],
['rolls','rolls',['גלילי כנאפה ותות','Knafeh rolls & strawberry','لفائف كنافة وفراولة'],['קרם בפנים, רוטב תות','Cream inside, strawberry sauce','قشطة في الداخل، صلصة فراولة'],['הטוויסט של השף','The chef’s twist','لمسة الشيف']],
['madlouka','madlouka',['מדלוקה סורית','Syrian madlouka','مدلوقة سورية'],['פירורי כנאפה, קרם ואגוזים','Knafeh crumb, cream & nuts','فتات كنافة، قشطة ومكسّرات'],['סורי אמיתי','Truly Syrian','سوري أصيل']]];
const ADDS=[['גלידה תורכית נוספת','Extra Turkish ice cream','بوظة تركية إضافية'],['פיסטוק נוסף','Extra pistachio','فستق إضافي'],['אגוזים קלויים','Roasted nuts','مكسّرات محمّصة'],['סירופ בצד','Syrup on the side','القطر على جنب'],['בלי פיסטוק (אלרגיה)','No pistachio (allergy)','بدون فستق (حساسية)']];
const INV=['rolls','balls','malabi','shell'];
const MQ=[['כנאפה','Knafeh','كنافة'],['גלידה תורכית','Turkish ice cream','بوظة تركية'],['לילות ביירות','Layali Beirut','ليالي بيروت'],['בקלאווה פיסטוק','Pistachio baklava','بقلاوة فستق'],['חלאוות אל ג׳יבן','Halawet el-jibn','حلاوة الجبن'],['מדלוקה','Madlouka','مدلوقة'],['טרילאצ׳ה','Trileçe','تريليتشا'],['מלבי','Malabi','مهلبية'],['עוואמה','Awwameh','عوّامة'],['בורמה','Burma','بورما'],['קן ציפור','Bird’s nest','عشّ البلبل'],['קפה על חשבון הבית','Coffee on the house','قهوة على حسابنا']];
const R=[
[['ביקרנו לראשונה ב־2022, ומאז הטעם בלתי נשכח ורצינו לחזור. גם הבקלאווה ברמה הכי גבוהה שיש.','We first came in 2022, the taste stayed with us and we had to come back. The baklava is top level too.','زرنا المكان أول مرة عام 2022 وبقي الطعم في الذاكرة فعدنا. والبقلاوة أيضًا بأعلى مستوى.'],'Sagi Oster'],
[['הבקלאווה הכי טעימה שאכלתי בארץ! פיסטוק זה פיסטוק. מתיקות בול במידה הנכונה.','The best baklava I have eaten in Israel! Pistachio is pistachio. Exactly the right sweetness.','أطيب بقلاوة أكلتها في البلاد! الفستق فستق. الحلاوة بالمقدار الصحيح تمامًا.'],'עינבר אליהו'],
[['המלבי מגיע עם שכבת פרלין אגוזים קראנצ׳ית למעלה. שילוב מושלם, הכי טוב שאכלתי.','The malabi comes with a crunchy nut praline on top. A perfect match, the best I have had.','المهلبية تأتي مع طبقة برالين مقرمشة. مزيج مثالي، أطيب ما أكلت.'],'Justin Cohen'],
[['המתוקים הטובים בארץ. שף ברמה הגבוהה ביותר, ברמה של שף צרפתי בצרפת.','The best sweets in the country. A chef at the highest level, like a French chef in France.','أطيب حلويات في البلاد. شيف بأعلى مستوى، كشيف فرنسي في فرنسا.'],'Reem Hared'],
[['הקינוחים לא מתוקים מדי כמו שאנחנו מכירים. הכנאפה אלוהית, מהטובות שאכלתי.','The desserts are not overly sweet like we are used to. The knafeh is divine, among the best I have had.','الحلويات ليست حلوة زيادة كما اعتدنا. الكنافة رائعة، من أطيب ما أكلت.'],'shmuel croitoro'],
[['כנאפה ברמה הגבוהה ביותר, לא מתוקה מדי, שערות קדאיף קריספיות, וקפה לכל דורש.','Knafeh of the highest level, not too sweet, crispy kadaif threads, and coffee for everyone.','كنافة بأعلى مستوى، غير حلوة زيادة، خيوط مقرمشة، وقهوة لكل من يطلب.'],'Yam Okovit'],
[['זכרנו אותו מ״הקינוח המושלם״. השף ואחיותיו מפליאים במלאכת הקינוחים, ואירוח מכל הלב.','We remembered him from “The Perfect Dessert”. The chef and his sisters do wonders, with hosting from the heart.','تذكّرناه من برنامج «الحلوى المثالية». الشيف وأخواته يبدعون، والضيافة من القلب.'],'Chilik Magal'],
[['הזמנו לילות ביירות, טרילאצ׳י וחלאוות אל ג׳יבן. הכוכבת על השולחן הייתה הטרילאצ׳י.','We ordered Layali Beirut, trileçe and halawet el-jibn. The star of the table was the trileçe.','طلبنا ليالي بيروت، تريليتشا وحلاوة الجبن. نجمة الطاولة كانت التريليتشا.'],'שלום שבח'],
[['התיישבנו ומיד הגיע אל השולחן קנקן של קפה חם. הכנאפה מומלצת במיוחד!','We sat down and a pot of hot coffee arrived right away. The knafeh is highly recommended!','جلسنا وفورًا وصل إبريق قهوة ساخنة إلى الطاولة. الكنافة موصى بها جدًا!'],'Meital Toker'],
];
const S={ // ui strings [he,en,ar]
 hot:['הכי מבוקש','Most wanted','الأكثر طلبًا'],sum:['ההזמנה שלכם:','Your order:','طلبك:'],added:['נוסף להזמנה','Added to your order','أُضيف إلى الطلب'],
 today:['היום','Today','اليوم'],tom:['מחר','Tomorrow','غدًا'],asap:['כמה שיותר מהר','As soon as possible','بأسرع وقت'],
 openT:['פתוח עכשיו · עד 19:00','Open now · until 19:00','مفتوح الآن · حتى 19:00'],closedA:['סגור עכשיו · נפתח היום ב־9:30','Closed now · opens today at 9:30','مغلق الآن · يفتح اليوم 9:30'],closedB:['סגור עכשיו · נפתח מחר ב־9:30','Closed now · opens tomorrow at 9:30','مغلق الآن · يفتح غدًا 9:30'],
 days:['ראשון עד שבת','Sunday to Saturday','من الأحد إلى السبت'],coffee:['קפה לכל אורח','Coffee for every guest','قهوة لكل ضيف'],free:['על חשבון הבית','On the house','على حساب المحل'],
 less:['פחות','Less','أقل'],more:['יותר','More','أكثر'],addA:['הוספה להזמנה','Add to order','أضف إلى الطلب']
};

/* ---------- i18n ---------- */
const HE={};$$('[data-t]').forEach(e=>{HE[e.dataset.t]=e.innerHTML});
function applyLang(l){LANG=l;const d=document.documentElement;d.lang=l;d.dir=l==='en'?'ltr':'rtl';
 $$('[data-t]').forEach(e=>{const k=e.dataset.t;e.innerHTML=l==='he'?HE[k]:(window.TR[k]?window.TR[k][l==='en'?0:1]:HE[k])});
 $$('#lang button').forEach(b=>b.classList.toggle('on',b.dataset.l===l));
 renderAll();splitWords();layout()}
$('#lang').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.l!==LANG)applyLang(b.dataset.l)});

/* ---------- renderers ---------- */
let filter='all';
const cart=new Map(); // key -> {id,img,name[he..],opts[[he,en,ar]..],qty}
function renderMenu(){
 $('#filters').innerHTML=CATS.map(c=>`<button class="${c[0]===filter?'on':''}" data-f="${c[0]}">${tx(c[1])}</button>`).join('');
 const list=M.filter(m=>filter==='all'||m[2]===filter);
 $('#mlist').innerHTML=list.map((m,i)=>{const q=cart.get(m[0])?.qty||0;return `<figure class="dish${filter==='all'&&i===0?' big':''} on" data-id="${m[0]}"><div class="ph"><img src="img/${m[1]}.webp" alt="${tx(m[3])}" loading="lazy" decoding="async"><span class="rk">${String(M.indexOf(m)+1).padStart(2,'0')}</span>${m[5]?`<span class="hot">${tx(S.hot)}</span>`:''}${m[6]?`<button class="add${q?' in':''}" data-add="${m[0]}" aria-label="${tx(S.addA)}: ${tx(m[3])}">${q?'×'+q:'+'}</button>`:''}</div><h3>${tx(m[3])}</h3><p>${tx(m[4])}</p></figure>`}).join('');
}
function renderStatic(){
 const mqh=MQ.map(w=>`<span>${tx(w)}</span><span>✦</span>`).join('');$('#mq').innerHTML=mqh+mqh;
 const rh=R.map(r=>`<div class="rv"><div class="st" aria-label="5/5">★★★★★</div><p>${tx(r[0])}</p><small>${r[1]} · Google</small></div>`).join('');$('#revs').innerHTML=rh+rh;
 $('#inv').innerHTML=INV.map(id=>{const m=byId[id];return `<div class="i"><img src="img/${m[1]}.webp" alt="${tx(m[3])}" loading="lazy"><button class="add" data-add="${id}" aria-label="${tx(S.addA)}: ${tx(m[3])}">+</button><div><b>${tx(m[3])}</b><small>${tx(m[4])}</small></div></div>`}).join('');
 // builder
 const cur=$('#bases .on')?.dataset.id||'knafeh';
 $('#bases').innerHTML=BASES.map(b=>`<button class="${b[0]===cur?'on':''}" data-id="${b[0]}"><b>${tx(b[2])}</b><small>${tx(b[3])}</small></button>`).join('');
 const on=$$('#adds .on').map(b=>+b.dataset.i);
 $('#adds').innerHTML=ADDS.map((a,i)=>`<button class="${on.includes(i)?'on':''}" data-i="${i}" aria-pressed="${on.includes(i)}">${tx(a)}</button>`).join('');
 $('#qm').setAttribute('aria-label',tx(S.less));$('#qp').setAttribute('aria-label',tx(S.more));
 // hours
 const now=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Jerusalem'}));const h=now.getHours()+now.getMinutes()/60;
 $('#hrs').innerHTML=`<div class="t"><span>${tx(S.days)}</span><span dir="ltr">9:30–19:00</span></div><div><span>${tx(S.coffee)}</span><span>${tx(S.free)}</span></div>`;
 const op=h>=9.5&&h<19;$('#open').classList.toggle('c',!op);$('#openT').textContent=tx(op?S.openT:(h<9.5?S.closedA:S.closedB));
 // pickup slots
 const sel=$('#otime'),prev=sel.value;const opts=[];let t=Math.ceil((h+.5)*2)/2;const lab=(x)=>`${String(Math.floor(x)).padStart(2,'0')}:${x%1?'30':'00'}`;
 if(op&&t<19){opts.push([tx(S.asap),'היום, כמה שיותר מהר']);for(;t<=19;t+=.5)opts.push([`${tx(S.today)} ${lab(t)}`,`היום ${lab(t)}`])}
 const dayW=h<9.5?S.today:S.tom,dayHe=h<9.5?'היום':'מחר';if(!op||opts.length<3)for(let x=10;x<=19;x+=1)opts.push([`${tx(dayW)} ${lab(x)}`,`${dayHe} ${lab(x)}`]);
 sel.innerHTML=opts.map(o=>`<option value="${o[1]}">${o[0]}</option>`).join('');if([...sel.options].some(o=>o.value===prev))sel.value=prev;
 $('#gwa').href=`https://wa.me/${WA}?text=${encodeURIComponent('היי אחמד, ראיתי באתר ואשמח לתאם טעימות / מגש אירוח')}`;
}
function renderAll(){renderStatic();renderMenu();updBuilder();renderCart()}

/* ---------- builder ---------- */
let qty=2;
function builderSel(){const b=BASES.find(x=>x[0]===($('#bases .on')?.dataset.id||'knafeh'));const ad=$$('#adds .on').map(x=>ADDS[+x.dataset.i]);return{b,ad}}
function updBuilder(){const{b,ad}=builderSel();$('#qv').textContent=qty;$('#btag').textContent=tx(b[4]);
 $('#sum').innerHTML=`<b>${tx(S.sum)}</b> ${qty} × ${tx(b[2])}${ad.length?' + '+ad.map(tx).join(', '):''}`}
$('#bases').addEventListener('click',e=>{const bt=e.target.closest('button');if(!bt||bt.classList.contains('on'))return;$$('#bases button').forEach(x=>x.classList.toggle('on',x===bt));
 const b=BASES.find(x=>x[0]===bt.dataset.id);const im=$('#bimg');im.classList.add('out');const n=new Image();n.src=`img/${b[1]}.webp`;n.onload=()=>setTimeout(()=>{im.src=n.src;im.classList.remove('out');const f=$('#flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');burst(.8,$('#stage'))},180);updBuilder()});
$('#adds').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;b.classList.toggle('on');b.setAttribute('aria-pressed',b.classList.contains('on'));if(b.classList.contains('on'))burst(.35,$('#stage'));updBuilder()});
$('#qm').onclick=()=>{qty=Math.max(1,qty-1);updBuilder()};$('#qp').onclick=()=>{qty=Math.min(30,qty+1);updBuilder()};
$('#badd').onclick=e=>{const{b,ad}=builderSel();const key=b[0]+(ad.length?'|'+ad.map(a=>a[0]).join(','):'');const it=cart.get(key);
 if(it)it.qty+=qty;else cart.set(key,{id:b[0],img:b[1],name:b[2],opts:ad,qty});flyTo($('#bimg'));afterAdd()};
const stage=$('#stage'),card=$('#card');
if(!isM){stage.addEventListener('mousemove',e=>{const r=stage.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`rotateY(${x*14}deg) rotateX(${-y*12}deg) translateZ(20px)`});stage.addEventListener('mouseleave',()=>card.style.transform='')}

/* ---------- cart ---------- */
function count(){let n=0;cart.forEach(i=>n+=i.qty);return n}
function afterAdd(){renderCart();renderMenu();toast(tx(S.added));$$('[data-cnt]').forEach(c=>{c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop')})}
function addId(id,src){const m=byId[id];const it=cart.get(id);if(it)it.qty++;else cart.set(id,{id,img:m[1],name:m[3],opts:[],qty:1});if(src)flyTo(src);afterAdd()}
document.addEventListener('click',e=>{const a=e.target.closest('[data-add]');if(a){e.preventDefault();addId(a.dataset.add,a.closest('.ph,.i')?.querySelector('img'));return}
 const ph=e.target.closest('.dish .ph');if(ph){const id=ph.parentElement.dataset.id;if(byId[id][6])addId(id,ph.querySelector('img'))}});
function renderCart(){const n=count();$$('[data-cnt]').forEach(c=>{c.textContent=n;c.hidden=!n});
 $('#lines').innerHTML=[...cart].map(([k,i])=>`<div class="line"><img src="img/${i.img}.webp" alt=""><div><b>${tx(i.name)}</b>${i.opts.length?`<small>${i.opts.map(tx).join(' · ')}</small>`:''}</div><div class="q"><button data-dec="${k}" aria-label="${tx(S.less)}">−</button><output>${i.qty}</output><button data-inc="${k}" aria-label="${tx(S.more)}">+</button></div></div>`).join('');
 $('#empty').hidden=!!n;$('#oform').style.display=n?'':'none';$('#osend').classList.toggle('off',!n);updSend()}
$('#lines').addEventListener('click',e=>{const d=e.target.closest('[data-dec]'),i=e.target.closest('[data-inc]');if(d){const it=cart.get(d.dataset.dec);if(--it.qty<=0)cart.delete(d.dataset.dec)}else if(i)cart.get(i.dataset.inc).qty++;else return;renderCart();renderMenu()});
function updSend(){const L=[...cart.values()].map(i=>`• ${i.qty} × ${i.name[0]}${i.opts.length?' ('+i.opts.map(o=>o[0]).join(', ')+')':''}`);
 const nm=$('#oname').value.trim(),nt=$('#onote').value.trim();
 const msg=['היי אחמד, הזמנה חדשה מהאתר 🍯','',...L,'',nm?`שם: ${nm}`:'',`איסוף: ${$('#otime').value}`,nt?`הערה: ${nt}`:'','תשלום במקום. תודה!'].filter((x,i,a)=>x!==''||a[i-1]!=='').join('\n');
 $('#osend').href=`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`}
['#oname','#onote','#otime'].forEach(s=>$(s).addEventListener('input',updSend));
const sheet=$('#sheet'),scrim=$('#scrim');let lastFocus;
function openCart(){lastFocus=document.activeElement;sheet.hidden=scrim.hidden=false;requestAnimationFrame(()=>{sheet.classList.add('on');scrim.classList.add('on')});lenis&&lenis.stop();document.documentElement.style.overflow='hidden';$('#shX').focus()}
function closeCart(){sheet.classList.remove('on');scrim.classList.remove('on');setTimeout(()=>{sheet.hidden=scrim.hidden=true},500);lenis&&lenis.start();document.documentElement.style.overflow='';lastFocus&&lastFocus.focus()}
['#cartTop','#cartBar','#vorder'].forEach(s=>$(s).addEventListener('click',openCart));$('#shX').onclick=closeCart;scrim.onclick=closeCart;
addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.hidden)closeCart()});
{let y0=null;sheet.addEventListener('touchstart',e=>{if(e.target.closest('.sh-b')&&$('.sh-b').scrollTop>0)return;y0=e.touches[0].clientY},{passive:true});
 sheet.addEventListener('touchmove',e=>{if(y0==null||!isM)return;const dy=e.touches[0].clientY-y0;if(dy>0)sheet.style.transform=`translateY(${dy}px)`},{passive:true});
 sheet.addEventListener('touchend',e=>{if(y0==null)return;const dy=e.changedTouches[0].clientY-y0;sheet.style.transform='';if(dy>110)closeCart();y0=null})}
let tT;function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>el.classList.remove('on'),1600)}
function flyTo(img){if(!img||reduce)return;const r=img.getBoundingClientRect();const tg=(isM?$('#cartBar'):$('#cartTop')).getBoundingClientRect();const d=document.createElement('img');d.src=img.currentSrc||img.src;d.className='flydot';
 const sx=r.left+r.width/2-27,sy=r.top+r.height/2-27;d.style.left=sx+'px';d.style.top=sy+'px';document.body.appendChild(d);
 d.animate([{transform:'scale(1.6)',opacity:1},{transform:`translate(${(tg.left+tg.width/2-27-sx)*.5}px,${(tg.top-sy)*.5-90}px) scale(1)`,opacity:1,offset:.55},{transform:`translate(${tg.left+tg.width/2-27-sx}px,${tg.top+tg.height/2-27-sy}px) scale(.25)`,opacity:.3}],{duration:720,easing:'cubic-bezier(.3,.7,.3,1)'}).onfinish=()=>d.remove()}
$('#a11yBtn').onclick=()=>$('#a11y').showModal();

/* ---------- frame scenes ---------- */
const scenes=$$('.scene[data-clip]').map(el=>{const c=el.querySelector('canvas');return{el,c,ctx:c.getContext('2d'),clip:el.dataset.clip,n:+el.dataset.n,fit:el.dataset.fit||'contain',imgs:[],loaded:0,started:false,last:-1,p:0,top:0,h:1}});
function size(s){const r=s.c.getBoundingClientRect();if(!r.width)return;s.c.width=Math.round(r.width*dpr);s.c.height=Math.round(r.height*dpr);s.last=-1}
function load(s){if(s.started||!s.n)return;s.started=true;const set=isM?'m':'d';const order=[0];
 for(let st=8;st>=1;st=st>>1)for(let i=0;i<s.n;i+=st)if(!order.includes(i))order.push(i);
 let k=0;const next=()=>{if(k>=order.length)return;const i=order[k++];const im=new Image();im.decoding='async';im.onload=()=>{s.imgs[i]=im;s.loaded++;s.last=-1;next()};im.onerror=next;im.src=`f/${s.clip}/${set}/${String(i).padStart(3,'0')}.webp`};
 for(let j=0;j<4;j++)next()}
function draw(s){if(!s.n)return;let i=Math.round(s.p*(s.n-1));let im=s.imgs[i];
 if(!im){for(let o=1;o<s.n;o++){if(s.imgs[i-o]){im=s.imgs[i-o];i-=o;break}if(s.imgs[i+o]){im=s.imgs[i+o];i+=o;break}}}
 if(!im||i===s.last)return;s.last=i;const W=s.c.width,H=s.c.height,iw=im.naturalWidth,ih=im.naturalHeight;
 const sc=s.fit==='cover'?Math.max(W/iw,H/ih):Math.min(W/iw,H/ih);const w=iw*sc,h=ih*sc;s.ctx.clearRect(0,0,W,H);s.ctx.drawImage(im,(W-w)/2,(H-h)/2,w,h)}
const vs=scenes.find(s=>s.clip==='6-visit');{const im=new Image();im.src='img/visit.webp';im.onload=()=>{vs.imgs[0]=im;vs.n=1;vs.started=true;vs.last=-1}}

/* ---------- particles ---------- */
const fx=$('#fx'),fc=fx.getContext('2d');let FW,FH;
const fxSize=()=>{FW=fx.width=Math.round(innerWidth*dpr);FH=fx.height=Math.round(innerHeight*dpr)};fxSize();
const PAL={gold:['#f6e2a8','#d6b26a','#fff3cf'],pis:['#a9c25a','#c7d97a','#7f9a3a','#f6e2a8'],petal:['#e57aa0','#f3a6c0','#c9547d'],syrup:['#e9a440','#f6c66a','#fff0c0']};
let mode='pis';const P=[];const NP=reduce?0:(isM?26:70);
const mk=()=>({x:Math.random()*FW,y:Math.random()*FH,z:.4+Math.random()*1.6,s:Math.random(),rot:Math.random()*6.28,vr:(Math.random()-.5)*.04,vx:(Math.random()-.5)*.3,vy:-(.15+Math.random()*.45),life:1});
for(let i=0;i<NP;i++)P.push(mk());
function burst(k=1,el){if(reduce)return;const n=Math.round((isM?16:36)*k);let cx=FW*.5,cy=FH*.5;if(el){const r=el.getBoundingClientRect();cx=(r.left+r.width/2)*dpr;cy=(r.top+r.height*.45)*dpr}
 for(let i=0;i<n;i++){const p=mk();p.x=cx+(Math.random()-.5)*FW*.16;p.y=cy+(Math.random()-.5)*FH*.08;const a=Math.random()*6.28,v=2+Math.random()*6;p.vx=Math.cos(a)*v;p.vy=Math.sin(a)*v-3;p.tmp=1;P.push(p)}}
let vel=0;
function drawFx(){fc.clearRect(0,0,FW,FH);const pal=PAL[mode];
 for(let i=P.length-1;i>=0;i--){const p=P[i];
  p.x+=p.vx*p.z*dpr;p.y+=(p.vy*p.z-vel*.5*p.z)*dpr;p.rot+=p.vr;
  if(p.tmp){p.vy+=.16;p.vx*=.985;p.life-=.013;if(p.life<=0){P.splice(i,1);continue}}
  else{if(p.y<-40)p.y=FH+40;if(p.y>FH+40)p.y=-40;if(p.x<-40)p.x=FW+40;if(p.x>FW+40)p.x=-40}
  const col=pal[Math.floor(p.s*pal.length)%pal.length];const sz=p.z*dpr;const al=(p.tmp?p.life:1)*(.35+.55*(p.z/2));
  const m=p.tmp?'pis':mode;if(m==='petal'&&p.s>.45)continue;
  fc.setTransform(Math.cos(p.rot),Math.sin(p.rot),-Math.sin(p.rot),Math.cos(p.rot),p.x,p.y);fc.globalAlpha=al;fc.fillStyle=p.tmp?PAL.pis[Math.floor(p.s*4)%4]:col;fc.beginPath();
  if(m==='petal')fc.ellipse(0,0,5*sz,3*sz,0,0,6.28);
  else if(m==='pis'){fc.moveTo(-2.6*sz,-1.5*sz);fc.lineTo(2.4*sz,-2*sz);fc.lineTo(2*sz,2.2*sz);fc.lineTo(-2*sz,1.6*sz);fc.closePath()}
  else if(m==='syrup')fc.arc(0,0,2.2*sz,0,6.28);
  else fc.arc(0,0,1.5*sz,0,6.28);
  fc.fill()}
 fc.setTransform(1,0,0,1,0,0);fc.globalAlpha=1}

/* ---------- layout cache ---------- */
const hero=$('#hero'),rig=$('#rig'),hic=$('#hic'),hkn=$('#hkn'),huds=[$('#hud1'),$('#hud2'),$('#hud3')],ghost=$('#ghost');
const hd=$('#hd'),mbar=$('#mbar'),words=$('#words');let ws=[];
function splitWords(){words.innerHTML=words.innerHTML.replace(/<span class="w[^"]*">([^<]*)<\/span>/g,'$1').replace(/(<em>)|(<\/em>)|([^\s<>]+)/g,(m,a,b,w)=>w?`<span class="w">${w}</span>`:m);ws=[...words.querySelectorAll('.w')]}
const anat=scenes.find(s=>s.clip==='3-anatomy');
const L=[1,2,3,4].map(i=>({l:$('#l'+i),c:$('#c'+i),k:$('#k'+i),a:[.12,.32,.52,.68][i-1]}));
const gf=$('#gf'),gv=$('#gv');
const fly=$$('#fly .f'),flyEl=$('#fly'),chefEl=$('#chef'),cframe=$('#cframe'),cghost=$('#cghost'),badges=$$('.cbadge');
const fxSecs=$$('[data-fx]');
const traysEl=$('#trays'),awwEl=$('#aww'),ring3=$('#ring3'),rcs=$$('#ring3 .rc'),aw3=$('#aw3'),ballEls=$$('#aw3 .ball');
const RG={r:0,v:0,drag:false,touched:false,x:0};
{const box=$('#ringbox');
 box.addEventListener('pointerdown',e=>{if(e.target.closest('.rnav'))return;RG.drag=true;RG.touched=true;RG.x=e.clientX;RG.v=0;box.classList.add('drag');try{box.setPointerCapture(e.pointerId)}catch(_){}});
 box.addEventListener('pointermove',e=>{if(!RG.drag)return;const dx=e.clientX-RG.x;RG.x=e.clientX;const d=dx*(isM?.42:.28);RG.r+=d;RG.v=d});
 const end=()=>{RG.drag=false;box.classList.remove('drag')};box.addEventListener('pointerup',end);box.addEventListener('pointercancel',end);box.addEventListener('lostpointercapture',end);
 const step=d=>{RG.touched=true;RG.v=0;RG.r=Math.round(RG.r/60)*60+d*60};
 $('#rprev').addEventListener('click',()=>step(1));$('#rnext').addEventListener('click',()=>step(-1));
 box.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')step(1);if(e.key==='ArrowRight')step(-1)})}
const BL=ballEls.map((e,i)=>({e,a:i/ballEls.length*6.283+(i%2)*.5,r:.62+(i%3)*.16,h:(i%4-1.5)*.2,sp:.8+(i%3)*.35,sc:.7+(i%4)*.18}));
let VH=innerHeight,heroTop=0,heroH=1,geo=[];
const absTop=el=>el.getBoundingClientRect().top+scrollY;
function layout(){VH=innerHeight;heroTop=absTop(hero);heroH=hero.offsetHeight;
 scenes.forEach(s=>{s.top=absTop(s.el);s.h=s.el.offsetHeight;size(s)});
 geo={words:[absTop(words),words.offsetHeight],fly:[absTop(flyEl),flyEl.offsetHeight],chef:[absTop(chefEl),chefEl.offsetHeight],trays:[absTop(traysEl),traysEl.offsetHeight],aww:[absTop(awwEl),awwEl.offsetHeight],fx:fxSecs.map(s=>[absTop(s),s.offsetHeight,s.dataset.fx])};fxSize();const R=ring3.offsetWidth*1.02;rcs.forEach((c,i)=>{c.style.transform=`rotateY(${i*60}deg) translateZ(${R.toFixed(1)}px)`})}
let rT;addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(layout,120)});
new ResizeObserver(()=>{clearTimeout(rT);rT=setTimeout(layout,120)}).observe(document.body);

/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');if(!e.target.closest('.scene'))io.unobserve(e.target)}else if(e.target.closest('.scene'))e.target.classList.remove('on')}),{rootMargin:'0px 0px -10% 0px',threshold:.15});
$$('[data-a]').forEach((e,i)=>{if(e.closest('#hero')){e.style.setProperty('--i',i);return}io.observe(e)});
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const c=e.target;cio.unobserve(c);const to=+c.dataset.count,dec=+(c.dataset.dec||0),plain=c.dataset.plain;const t0=performance.now();const step=n=>{const k=clamp((n-t0)/1600);const v=to*(1-Math.pow(1-k,3));c.textContent=plain?Math.round(v):v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}),{threshold:.5});

/* ---------- scroll driver ---------- */
const lenis=(window.Lenis&&!isM&&!reduce)?new Lenis({lerp:.12,wheelMultiplier:1.15,smoothWheel:true}):null;
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const h=a.getAttribute('href');if(h.length<2)return;const t=document.querySelector(h);if(!t)return;e.preventDefault();lenis?lenis.scrollTo(t,{offset:0}):t.scrollIntoView({behavior:reduce?'auto':'smooth'})});
let mx=0,my=0,tmx=0,tmy=0;if(!isM)addEventListener('mousemove',e=>{tmx=e.clientX/innerWidth-.5;tmy=e.clientY/innerHeight-.5},{passive:true});
// hero intro spring
let drop=-1.5,dv=0,introOn=false,kin=0,landed=false;
let lastY=scrollY,hidden=false;document.addEventListener('visibilitychange',()=>hidden=document.hidden);
function tick(t){
 requestAnimationFrame(tick);if(hidden)return;
 lenis&&lenis.raf(t);
 const y=scrollY,H=VH;vel=vel*.85+(y-lastY)*.15;lastY=y;
 hd.classList.toggle('s',y>heroTop+heroH-H*.55);mbar.classList.toggle('on',y>heroTop+heroH-H*.55);
 mx+=(tmx-mx)*.08;my+=(tmy-my)*.08;
 // HERO 3D rig
 if(y<heroTop+heroH){const p=clamp((y-heroTop)/(heroH-H));const ts=t/1000;
  if(introOn){kin+=(1-kin)*.06;const a=(0-drop)*.09;dv=(dv+a)*.86;drop+=dv;if(!landed&&drop>-.02){landed=true;burst(1.3,rig)}}
  const arc=Math.sin(Math.PI*clamp(p/.94));const lift=ease(arc);const sw=Math.sin(p*Math.PI*2);const bob=reduce?0:Math.sin(ts*1.3)*.012;
  const rx=10-arc*20+my*-9+(reduce?0:Math.sin(ts*.7)*1.2),ry=mx*14+(reduce?0:Math.sin(ts*.5)*2.2)+sw*(isM?17:22);
  rig.style.transform=`rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${(sw*-3).toFixed(2)}deg) scale(${((.72+.28*kin)*(1+arc*(isM?.04:.16))).toFixed(4)})`;rig.style.opacity=kin;
  hkn.style.transform=`translateZ(0) rotate(${(sw*6).toFixed(2)}deg)`;
  hic.style.transform=`translate3d(${(lift*-3).toFixed(2)}%,${((drop-lift*(isM?.18:.34)+bob)*100).toFixed(2)}%,${(70+lift*(isM?55:170)).toFixed(1)}px) rotate(${(-4-lift*12+drop*20).toFixed(2)}deg)`;
  hic.style.opacity=clamp(1.6+drop*1.1);
  huds.forEach((h,i)=>h.classList.toggle('on',landed&&p>.1+i*.09&&p<.84));
  ghost.style.transform=`translateX(${((p-.5)*-30).toFixed(2)}%)`}
 for(const s of scenes){const top=s.top-y;if(top<H*2.5&&top+s.h>-H)load(s);if(top+s.h<0||top>H)continue;s.p=clamp(-top/(s.h-H||1));draw(s)}
 if(anat&&anat.top-y<H&&anat.top+anat.h-y>0){const p=anat.p;for(const o of L){const lp=clamp((p-o.a)/.12);o.l.style.strokeDashoffset=1-lp;o.c.style.opacity=lp>0?1:0;o.k.classList.toggle('on',lp>.85)}
  const g=clamp((p-.1)/.75);gf.style.strokeDashoffset=1-g;gv.textContent=Math.round(g*100)}
 // words
 {const top=geo.words[0]-y;if(top<H&&top+geo.words[1]>0){const wp=clamp((H*.85-top)/(geo.words[1]+H*.35));const nOn=Math.round(wp*ws.length);for(let i=0;i<ws.length;i++)ws[i].classList.toggle('on',i<nOn)}}
 // chef 3D
 {const top=geo.chef[0]-y;if(top<H&&top+geo.chef[1]>0){const k=clamp((top+geo.chef[1]/2-H/2)/H,-1,1);const dir=document.documentElement.dir==='ltr'?-1:1;
   cframe.style.transform=`rotateY(${(k*-16*dir+mx*10).toFixed(2)}deg) rotateX(${(k*7+my*-8).toFixed(2)}deg) translateY(${(k*26).toFixed(1)}px)`;
   cghost.style.transform=`translateX(${(k*14).toFixed(2)}%)`;badges.forEach(b=>{b.style.transform=`translateY(${(k*+b.dataset.d*46).toFixed(1)}px)`})}}
 // live 3D ring + awwameh
 {const top=geo.trays[0]-y;if(top<H&&top+geo.trays[1]>0){
   if(!RG.drag){if(Math.abs(RG.v)>.08){RG.r+=RG.v;RG.v*=.94}else if(RG.touched){const tg=Math.round(RG.r/60)*60;RG.r+=(tg-RG.r)*.14}else if(!reduce)RG.r-=.1}
   ring3.style.transform=`rotateX(-8deg) rotateY(${RG.r.toFixed(2)}deg)`}}
 {const top=geo.aww[0]-y;if(top<H&&top+geo.aww[1]>0){const p=clamp(-top/(geo.aww[1]-H));const W=aw3.offsetWidth,ts=reduce?0:t/1000;aw3.style.transform=`rotateX(${(16-p*22+my*-6).toFixed(2)}deg) rotateY(${(Math.sin(p*6.283)*16+mx*12).toFixed(2)}deg) scale(${(.9+Math.sin(p*3.1416)*.14).toFixed(3)})`;
   for(const b of BL){const a=b.a+p*6.283*b.sp+ts*.12;const x=Math.cos(a)*b.r*W,z=Math.sin(a)*b.r*W*.9,yy=(b.h-.25+Math.sin(a*1.7+ts)*.06-p*.25)*W;b.e.style.transform=`translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,${z.toFixed(1)}px) rotate(${(a*40).toFixed(1)}deg) scale(${b.sc})`}}}
 // fly parallax
 {const top=geo.fly[0]-y;if(top<H&&top+geo.fly[1]>0){const k=(top+geo.fly[1]/2-H/2)/H;fly.forEach(f=>{const d=+f.dataset.d;f.style.transform=`translateY(${(k*d*150).toFixed(1)}px) rotate(${(k*d*-8).toFixed(2)}deg) scale(${(1-Math.abs(k)*.08).toFixed(3)})`})}}
 let m='gold';for(const s of geo.fx){const top=s[0]-y;if(top<H*.5&&top+s[1]>H*.5){m=s[2];break}}mode=m;
 drawFx()}

/* ---------- boot ---------- */
renderAll();splitWords();layout();$$('[data-count]').forEach(c=>cio.observe(c));
const ld=$('#ld'),bar=$('#ld .bar i');const need=[$('#hkn'),$('#hic')];let t0=performance.now();
(function wait(){const n=need.filter(i=>i.complete&&i.naturalWidth).length;bar.style.width=(n/need.length*100)+'%';
 if(n===need.length||performance.now()-t0>5000){ld.classList.add('done');$$('#hero [data-a]').forEach(e=>e.classList.add('on'));setTimeout(()=>{introOn=true},250);layout()}else requestAnimationFrame(wait)})();
if(reduce){drop=0;kin=1;landed=true}
document.fonts&&document.fonts.ready.then(layout);
requestAnimationFrame(tick);
})();
