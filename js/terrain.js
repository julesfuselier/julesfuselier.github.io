import{b as vt,c as K,e as _,f as gt,g as xt,h as yt,o as Et,q as Mt,t as At,v as St}from"./chunk-JRPSU5I5.js";function wt(n){return{base:.12,step:.78/(n+1)}}var Q=13;function qt(n){let e=2166136261;for(let r of n)e^=r.codePointAt(0),e=Math.imul(e,16777619);return e>>>0}function $t(n){let e=n>>>0;return()=>{e=e+1831565813>>>0;let r=e;return r=Math.imul(r^r>>>15,r|1),r^=r+Math.imul(r^r>>>7,r|61),((r^r>>>14)>>>0)/4294967296}}function bt(n,e){let r=Array.from({length:(e+1)*(e+1)},n),s=(c,u)=>r[u*(e+1)+c],a=c=>c*c*(3-2*c);return(c,u)=>{let y=Math.min(c*e,e-1e-9),v=Math.min(u*e,e-1e-9),l=Math.floor(y),h=Math.floor(v),d=a(y-l),b=a(v-h),E=s(l,h)+(s(l+1,h)-s(l,h))*d,L=s(l,h+1)+(s(l+1,h+1)-s(l,h+1))*d;return E+(L-E)*b}}var Z=1.7;function jt(n){let e=[5,10,20,40].map(r=>bt(n,r));return(r,s)=>{let a=0,c=0,u=.5;for(let y of e){let v=1-Math.abs(2*y(r,s)-1);a+=v*v*u,c+=u,u*=.5}return a/c}}function Ct(n){return(n.height??1)**(1/Z)}function Ht(n,e,r,s){let a=$t(n),c=bt(a,3),u=jt(a),y=r/e,v=s.length>1?26:9,l=[];for(let h=0;h<=r;h+=1){let d=[];for(let b=0;b<=e;b+=1){let E=b/e,L=h/r,O=c(E,Math.min(L*y,1)),V=.8+.4*O,j=0,F=0;for(let k of s){let H=Ct(k),N=Math.hypot(E-k.x,(L-k.y)*y)*V/(.45+.55*H),I=Math.exp(-((N*N*v)**.7));H*I>j&&(j=H*I,F=I)}let C=u(E,Math.min(L*y,1)),W=C+(1-C)*F**6;d.push(j*(.35+.65*W)*.84+O*.12)}l.push(d)}return l}function Lt({seed:n,peaks:e,cols:r,rows:s}){return Ht(qt(n),r,s,e)}function Pt(n,e,r,s,a){return .5*(2*e+(r-n)*a+(2*n-5*e+4*r-s)*a*a+(3*e-n-3*r+s)*a*a*a)}function Ft(n){if(n.length<2)return[];let e=s=>n[Math.max(0,Math.min(n.length-1,s))],r=[];for(let s=0;s<n.length-1;s+=1)for(let a=0;a<16;a+=1){let c=a/16;r.push({x:Pt(e(s-1).x,e(s).x,e(s+1).x,e(s+2).x,c),y:Pt(e(s-1).y,e(s).y,e(s+1).y,e(s+2).y,c)})}return r.push({...n.at(-1)}),r}function Tt(n){return n.map(({x:e,y:r},s)=>`${s===0?"M":"L"}${e.toFixed(2)} ${r.toFixed(2)}`).join("")}var R={width:10,depth:4,height:2.3},w={cols:360,rows:144},x={fieldOfView:26,distance:9.3,startElevation:89,endElevation:44,maxAzimuth:22,introDuration:1400},G={azimuth:5,elevation:2.5,smoothing:.08},M={degreesPerWidth:90,stretch:8,momentum:.12,stiffness:250,damping:2*Math.sqrt(250),maxVelocity:240};function Nt(n,e){let r=Math.abs(n)-e;if(r<=0)return n;let s=(1-1/(r*.55/M.stretch+1))*M.stretch;return Math.sign(n)*(e+s)}function Ot(n,e){let r=Math.min(Math.abs(n)-e,M.stretch*.999);if(r<=0)return n;let s=(1/(1-r/M.stretch)-1)*(M.stretch/.55);return Math.sign(n)*(e+s)}var zt={delay:900,duration:1800},U={dolly:.1,smoothing:.12,leaveDelay:180},tt=Math.PI/180,Vt=`
  attribute float aHeight;
  varying float vHeight;
  varying float vLight;
  varying float vSlope;
  varying vec2 vUv;

  // Direction d'o\xF9 vient la lumi\xE8re : en haut \xE0 gauche, comme sur une carte.
  const vec3 LIGHT = normalize(vec3(-0.5, 0.8, -0.35));

  void main() {
    vHeight = aHeight;
    vLight = clamp(dot(normal, LIGHT), 0.0, 1.0);
    vSlope = 1.0 - normal.y; // 0 \xE0 plat, proche de 1 sur une paroi
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Dt=`
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform float uBase;
  uniform float uStep;
  uniform float uLevels;
  uniform float uShadeLit; // 1 si l'encre est plus claire que le papier (th\xE8me sombre)
  uniform float uShadeStrength;
  uniform vec3 uAccent;      // couleur des sommets (terre cuite)
  uniform vec2 uFocus;       // sommet mis en avant, en coordonn\xE9es de texture
  uniform float uFocusAmount; // 0 sans mise en avant, 1 pleinement
  varying float vHeight;
  varying float vLight;
  varying float vSlope;
  varying vec2 vUv;

  // Intensit\xE9 (0 \xE0 1) d'un trait plac\xE9 sur chaque valeur enti\xE8re de f.
  float lineAt(float f, float width) {
    float distanceInPixels = abs(fract(f - 0.5) - 0.5) / max(fwidth(f), 0.00001);
    return 1.0 - smoothstep(width - 0.5, width + 0.5, distanceInPixels);
  }

  void main() {
    float level = (vHeight - uBase) / uStep;
    float inRange = step(0.5, level) * step(level, uLevels + 0.5);
    float minor = lineAt(level, 0.6) * 0.45;
    float major = lineAt(level / 4.0, 1.0) * 0.7; // une courbe ma\xEEtresse sur quatre
    float ink = max(minor, major) * inRange;

    // Les bords s'estompent pour que le terrain se fonde dans la page.
    vec2 edge = smoothstep(0.0, 0.12, vUv) * smoothstep(0.0, 0.12, 1.0 - vUv);

    // Ombrage : les versants \xE0 l'ombre tirent vers l'encre en th\xE8me clair ;
    // en th\xE8me sombre, ce sont les versants \xE9clair\xE9s qui s'\xE9claircissent.
    // Les parois raides sont assombries en plus, comme la roche nue.
    float shade = mix(1.0 - vLight, vLight, uShadeLit) * uShadeStrength;
    float rock = smoothstep(0.25, 0.7, vSlope) * uShadeStrength * 0.6 * (1.0 - uShadeLit);
    vec3 ground = mix(uPaper, uInk, min(shade + rock, 0.75));

    // Mise en avant : autour du sommet survol\xE9, les courbes prennent la
    // couleur des sommets. Les distances sont ramen\xE9es aux proportions du
    // terrain (10 de large pour 4 de profondeur) pour former un cercle.
    float near = 1.0 - smoothstep(0.25, 0.9, length((vUv - uFocus) * vec2(10.0, 4.0)));
    vec3 lineColor = mix(uInk, uAccent, near * uFocusAmount);
    float focusedInk = min(1.0, ink * (1.0 + 0.6 * near * uFocusAmount));

    gl_FragColor = vec4(mix(ground, lineColor, focusedInk), edge.x * edge.y);
    #include <colorspace_fragment>
  }
`;function _t(n){return[...n.querySelectorAll("[data-summit]")].map(e=>({element:e,x:Number(e.dataset.x)/100,y:Number(e.dataset.y)/100,height:Number(e.dataset.height)}))}function et(n){return n**Z*R.height}function Gt(n){let e=new Et(R.width,R.depth,w.cols,w.rows);e.rotateX(-90*tt);let r=e.attributes.position,s=new Float32Array(r.count);for(let a=0;a<=w.rows;a+=1)for(let c=0;c<=w.cols;c+=1){let u=a*(w.cols+1)+c;s[u]=n[a][c],r.setY(u,et(n[a][c]))}return e.setAttribute("aHeight",new xt(s,1)),e.computeVertexNormals(),e}function Jt(n,e){let r=_t(n),s=Lt({seed:n.dataset.seed,peaks:r,...w}),{base:a,step:c}=wt(Q),u=new Mt({vertexShader:Vt,fragmentShader:Dt,transparent:!0,uniforms:{uPaper:{value:new _},uInk:{value:new _},uBase:{value:a},uStep:{value:c},uLevels:{value:Q},uShadeLit:{value:0},uShadeStrength:{value:0},uAccent:{value:new _},uFocus:{value:new vt},uFocusAmount:{value:0}}}),y=new gt;y.add(new yt(Gt(s),u));let v=new At(x.fieldOfView,1,.1,100),l=new St({antialias:!0,alpha:!0});l.setPixelRatio(Math.min(window.devicePixelRatio,2)),l.domElement.setAttribute("aria-hidden","true"),n.prepend(l.domElement),n.classList.add("is-3d");let h=window.matchMedia("(prefers-reduced-motion: reduce)").matches,d={elevation:h?x.endElevation:x.startElevation,azimuth:0,distance:x.distance},b=new K(0,.55,0),E=0;function L(){let t=getComputedStyle(n);u.uniforms.uPaper.value.set(t.getPropertyValue("--canvas-soft").trim()),u.uniforms.uInk.value.set(t.getPropertyValue("--body").trim()),u.uniforms.uAccent.value.set(t.getPropertyValue("--summit").trim());let o=m=>m.getHSL({}).l,i=o(u.uniforms.uInk.value)>o(u.uniforms.uPaper.value);u.uniforms.uShadeLit.value=i?1:0,u.uniforms.uShadeStrength.value=i?.16:.42}function O(){let t=(d.elevation+g.elevation)*tt,o=(d.azimuth+g.azimuth)*tt;v.position.set(d.distance*Math.cos(t)*Math.sin(o),d.distance*Math.sin(t),d.distance*Math.cos(t)*Math.cos(o)),v.lookAt(b),v.position.lerp(f.point,f.amount*U.dolly)}function V(t,o){let i=Math.round(o*w.rows),m=Math.round(t*w.cols),z=new K((t-.5)*R.width,et(s[i][m]),(o-.5)*R.depth).project(v);return{x:(z.x+1)/2,y:(1-z.y)/2}}function j(){let{clientWidth:t,clientHeight:o}=n;for(let i of r){let m=V(i.x,i.y);i.element.style.setProperty("--x",`${m.x*t}px`),i.element.style.setProperty("--y",`${m.y*o}px`)}}let F=n.querySelector("[data-trail]"),C=F?.getAttribute("d"),W=Ft([...r].sort((t,o)=>t.x-o.x)),k=h?1:0;function H(){if(!F)return;let t=W.map(({x:S,y:P})=>V(S,P)),o=k*(t.length-1),i=Math.floor(o),m=t.slice(0,i+1),z=t[i+1];if(z){let S=m.at(-1),P=o-i;m.push({x:S.x+(z.x-S.x)*P,y:S.y+(z.y-S.y)*P})}F.setAttribute("d",m.length>1?Tt(m.map(({x:S,y:P})=>({x:S*100,y:P*100}))):"")}let N=0;function I(t){N||=t;let o=Math.min(Math.max(t-N-zt.delay,0)/zt.duration,1);k=o<.5?2*o*o:1-(-2*o+2)**2/2,A(),o<1&&q&&requestAnimationFrame(I)}let f={amount:0,toAmount:0,point:b.clone(),toPoint:b.clone()},X=!1,D=0;function nt(){f.amount+=(f.toAmount-f.amount)*U.smoothing,f.point.lerp(f.toPoint,U.smoothing),u.uniforms.uFocusAmount.value=f.amount,A(),X=!(Math.abs(f.amount-f.toAmount)<.002&&f.point.distanceTo(f.toPoint)<.002),X&&q&&requestAnimationFrame(nt)}function ot(t){if(!h){if(clearTimeout(D),f.toAmount=t?1:0,t){let o=Math.round(t.y*w.rows),i=Math.round(t.x*w.cols);f.toPoint.set((t.x-.5)*R.width,et(s[o][i]),(t.y-.5)*R.depth),f.amount<.01&&f.point.copy(f.toPoint),u.uniforms.uFocus.value.set(t.x,1-t.y)}X||requestAnimationFrame(nt)}}let Rt=r.map(t=>{let o=()=>ot(t),i=()=>{clearTimeout(D),D=setTimeout(()=>ot(null),U.leaveDelay)};for(let m of["pointerenter","focusin"])t.element.addEventListener(m,o);for(let m of["pointerleave","focusout"])t.element.addEventListener(m,i);return{summit:t,enter:o,leave:i}});function kt(){E=0,O(),l.render(y,v),j(),H()}let q=!0;function A(){q&&!E&&(E=requestAnimationFrame(kt))}function rt(){let{clientWidth:t,clientHeight:o}=n;l.setSize(t,o,!1),v.aspect=t/o,v.updateProjectionMatrix(),A()}let st=0,B=h;function it(t){if(B)return;st||=t;let o=Math.min((t-st)/x.introDuration,1),i=1-(1-o)**3;d.elevation=x.startElevation+(x.endElevation-x.startElevation)*i,A(),o<1?requestAnimationFrame(it):B=!0}let g={azimuth:0,elevation:0,toAzimuth:0,toElevation:0},Y=!1;function at(){g.azimuth+=(g.toAzimuth-g.azimuth)*G.smoothing,g.elevation+=(g.toElevation-g.elevation)*G.smoothing,A(),Y=Math.abs(g.toAzimuth-g.azimuth)>.01||Math.abs(g.toElevation-g.elevation)>.01,Y&&q&&requestAnimationFrame(at)}let J=n.closest("section, aside")??n,ct=t=>{if(h||t.pointerType!=="mouse"||T||f.toAmount>0)return;let o=J.getBoundingClientRect();g.toAzimuth=((t.clientX-o.left)/o.width-.5)*-2*G.azimuth,g.toElevation=((t.clientY-o.top)/o.height-.5)*2*G.elevation,Y||requestAnimationFrame(at)};J.addEventListener("pointermove",ct);let T=null,$=[],p={velocity:0,target:0,active:!1,last:0};function ut(t){if(!p.active||!q)return;let o=Math.min((t-(p.last||t))/1e3,1/30);p.last=t;let i=d.azimuth-p.target;p.velocity+=(-M.stiffness*i-M.damping*p.velocity)*o,d.azimuth+=p.velocity*o,A(),Math.abs(i)<.01&&Math.abs(p.velocity)<.05?(d.azimuth=p.target,p.active=!1):requestAnimationFrame(ut)}l.domElement.addEventListener("pointerdown",t=>{if(T||!t.isPrimary)return;p.active=!1;let o=Ot(d.azimuth,x.maxAzimuth);T={x:t.clientX,azimuth:o},$=[{azimuth:o,time:t.timeStamp}],l.domElement.setPointerCapture(t.pointerId),n.classList.add("is-dragging")}),l.domElement.addEventListener("pointermove",t=>{if(!T||!t.isPrimary)return;let o=T.azimuth-(t.clientX-T.x)/n.clientWidth*M.degreesPerWidth;d.azimuth=Nt(o,x.maxAzimuth),$.push({azimuth:o,time:t.timeStamp}),$.length>5&&$.shift(),A()});let lt=t=>{if(!T||!t.isPrimary)return;T=null,n.classList.remove("is-dragging");let o=$[0],i=$.at(-1),m=i.time-o.time,S=t.timeStamp-i.time<80&&m>0&&!h?(i.azimuth-o.azimuth)/m*1e3:0,P=Math.max(-M.maxVelocity,Math.min(M.maxVelocity,S)),It=d.azimuth+P*M.momentum;if(p.target=Math.max(-x.maxAzimuth,Math.min(x.maxAzimuth,It)),h){d.azimuth=p.target,A();return}p.velocity=P,p.last=0,p.active||(p.active=!0,requestAnimationFrame(ut))};l.domElement.addEventListener("pointerup",lt),l.domElement.addEventListener("pointercancel",lt);let mt=new ResizeObserver(rt);mt.observe(n);let ht=new MutationObserver(()=>{L(),A()});ht.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});let dt=window.matchMedia("(prefers-color-scheme: dark)"),ft=()=>{L(),A()};dt.addEventListener("change",ft);function pt(){if(!e.matches){q=!1,J.removeEventListener("pointermove",ct),clearTimeout(D),e.removeEventListener("change",pt),dt.removeEventListener("change",ft),mt.disconnect(),ht.disconnect(),cancelAnimationFrame(E),B=!0,l.domElement.remove(),l.dispose(),n.classList.remove("is-3d","is-dragging"),F&&C&&F.setAttribute("d",C);for(let{summit:t,enter:o,leave:i}of Rt){for(let m of["pointerenter","focusin"])t.element.removeEventListener(m,o);for(let m of["pointerleave","focusout"])t.element.removeEventListener(m,i)}for(let t of r)t.element.style.setProperty("--x",`${t.element.dataset.x}%`),t.element.style.setProperty("--y",`${t.element.dataset.y}%`)}}e.addEventListener("change",pt),L(),rt(),requestAnimationFrame(it),h||requestAnimationFrame(I)}export{Jt as mountTerrain};
