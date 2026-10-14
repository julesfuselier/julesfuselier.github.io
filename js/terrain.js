import{b as vt,c as K,e as _,f as gt,g as yt,h as xt,o as Et,q as Mt,t as wt,v as St}from"./chunk-JRPSU5I5.js";function At(n){return{base:.12,step:.78/(n+1)}}var Q=13;function It(n){let e=2166136261;for(let r of n)e^=r.codePointAt(0),e=Math.imul(e,16777619);return e>>>0}function qt(n){let e=n>>>0;return()=>{e=e+1831565813>>>0;let r=e;return r=Math.imul(r^r>>>15,r|1),r^=r+Math.imul(r^r>>>7,r|61),((r^r>>>14)>>>0)/4294967296}}function bt(n,e){let r=Array.from({length:(e+1)*(e+1)},n),i=(c,u)=>r[u*(e+1)+c],a=c=>c*c*(3-2*c);return(c,u)=>{let y=Math.min(c*e,e-1e-9),v=Math.min(u*e,e-1e-9),l=Math.floor(y),h=Math.floor(v),d=a(y-l),A=a(v-h),x=i(l,h)+(i(l+1,h)-i(l,h))*d,b=i(l,h+1)+(i(l+1,h+1)-i(l,h+1))*d;return x+(b-x)*A}}var Z=1.7;function $t(n){let e=[5,10,20,40].map(r=>bt(n,r));return(r,i)=>{let a=0,c=0,u=.5;for(let y of e){let v=1-Math.abs(2*y(r,i)-1);a+=v*v*u,c+=u,u*=.5}return a/c}}function jt(n){return(n.height??1)**(1/Z)}function Ct(n,e,r,i){let a=qt(n),c=bt(a,3),u=$t(a),y=r/e,v=i.length>1?26:9,l=[];for(let h=0;h<=r;h+=1){let d=[];for(let A=0;A<=e;A+=1){let x=A/e,b=h/r,O=c(x,Math.min(b*y,1)),D=.8+.4*O,j=0,L=0;for(let R of i){let H=jt(R),N=Math.hypot(x-R.x,(b-R.y)*y)*D/(.45+.55*H),k=Math.exp(-((N*N*v)**.7));H*k>j&&(j=H*k,L=k)}let C=u(x,Math.min(b*y,1)),W=C+(1-C)*L**6;d.push(j*(.35+.65*W)*.84+O*.12)}l.push(d)}return l}function Lt({seed:n,peaks:e,cols:r,rows:i}){return Ct(It(n),r,i,e)}function Pt(n,e,r,i,a){return .5*(2*e+(r-n)*a+(2*n-5*e+4*r-i)*a*a+(3*e-n-3*r+i)*a*a*a)}function Ft(n){if(n.length<2)return[];let e=i=>n[Math.max(0,Math.min(n.length-1,i))],r=[];for(let i=0;i<n.length-1;i+=1)for(let a=0;a<16;a+=1){let c=a/16;r.push({x:Pt(e(i-1).x,e(i).x,e(i+1).x,e(i+2).x,c),y:Pt(e(i-1).y,e(i).y,e(i+1).y,e(i+2).y,c)})}return r.push({...n.at(-1)}),r}function Tt(n){return n.map(({x:e,y:r},i)=>`${i===0?"M":"L"}${e.toFixed(2)} ${r.toFixed(2)}`).join("")}var z={width:10,depth:4,height:2.3},S={cols:360,rows:144},M={fieldOfView:26,distance:9.3,startElevation:89,endElevation:44,maxAzimuth:22,introDuration:1400},G={azimuth:5,elevation:2.5,smoothing:.08},$={degreesPerWidth:90,stretch:8,momentum:.12,stiffness:250,damping:2*Math.sqrt(250)};function Ht(n,e){let r=Math.abs(n)-e;if(r<=0)return n;let i=(1-1/(r*.55/$.stretch+1))*$.stretch;return Math.sign(n)*(e+i)}var zt={delay:900,duration:1800},U={dolly:.1,smoothing:.12,leaveDelay:180},tt=Math.PI/180,Nt=`
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
`,Ot=`
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
`;function Dt(n){return[...n.querySelectorAll("[data-summit]")].map(e=>({element:e,x:Number(e.dataset.x)/100,y:Number(e.dataset.y)/100,height:Number(e.dataset.height)}))}function et(n){return n**Z*z.height}function Vt(n){let e=new Et(z.width,z.depth,S.cols,S.rows);e.rotateX(-90*tt);let r=e.attributes.position,i=new Float32Array(r.count);for(let a=0;a<=S.rows;a+=1)for(let c=0;c<=S.cols;c+=1){let u=a*(S.cols+1)+c;i[u]=n[a][c],r.setY(u,et(n[a][c]))}return e.setAttribute("aHeight",new yt(i,1)),e.computeVertexNormals(),e}function Bt(n,e){let r=Dt(n),i=Lt({seed:n.dataset.seed,peaks:r,...S}),{base:a,step:c}=At(Q),u=new Mt({vertexShader:Nt,fragmentShader:Ot,transparent:!0,uniforms:{uPaper:{value:new _},uInk:{value:new _},uBase:{value:a},uStep:{value:c},uLevels:{value:Q},uShadeLit:{value:0},uShadeStrength:{value:0},uAccent:{value:new _},uFocus:{value:new vt},uFocusAmount:{value:0}}}),y=new gt;y.add(new xt(Vt(i),u));let v=new wt(M.fieldOfView,1,.1,100),l=new St({antialias:!0,alpha:!0});l.setPixelRatio(Math.min(window.devicePixelRatio,2)),l.domElement.setAttribute("aria-hidden","true"),n.prepend(l.domElement),n.classList.add("is-3d");let h=window.matchMedia("(prefers-reduced-motion: reduce)").matches,d={elevation:h?M.endElevation:M.startElevation,azimuth:0,distance:M.distance},A=new K(0,.55,0),x=0;function b(){let t=getComputedStyle(n);u.uniforms.uPaper.value.set(t.getPropertyValue("--canvas-soft").trim()),u.uniforms.uInk.value.set(t.getPropertyValue("--body").trim()),u.uniforms.uAccent.value.set(t.getPropertyValue("--summit").trim());let o=m=>m.getHSL({}).l,s=o(u.uniforms.uInk.value)>o(u.uniforms.uPaper.value);u.uniforms.uShadeLit.value=s?1:0,u.uniforms.uShadeStrength.value=s?.16:.42}function O(){let t=(d.elevation+g.elevation)*tt,o=(d.azimuth+g.azimuth)*tt;v.position.set(d.distance*Math.cos(t)*Math.sin(o),d.distance*Math.sin(t),d.distance*Math.cos(t)*Math.cos(o)),v.lookAt(A),v.position.lerp(f.point,f.amount*U.dolly)}function D(t,o){let s=Math.round(o*S.rows),m=Math.round(t*S.cols),T=new K((t-.5)*z.width,et(i[s][m]),(o-.5)*z.depth).project(v);return{x:(T.x+1)/2,y:(1-T.y)/2}}function j(){let{clientWidth:t,clientHeight:o}=n;for(let s of r){let m=D(s.x,s.y);s.element.style.setProperty("--x",`${m.x*t}px`),s.element.style.setProperty("--y",`${m.y*o}px`)}}let L=n.querySelector("[data-trail]"),C=L?.getAttribute("d"),W=Ft([...r].sort((t,o)=>t.x-o.x)),R=h?1:0;function H(){if(!L)return;let t=W.map(({x:E,y:F})=>D(E,F)),o=R*(t.length-1),s=Math.floor(o),m=t.slice(0,s+1),T=t[s+1];if(T){let E=m.at(-1),F=o-s;m.push({x:E.x+(T.x-E.x)*F,y:E.y+(T.y-E.y)*F})}L.setAttribute("d",m.length>1?Tt(m.map(({x:E,y:F})=>({x:E*100,y:F*100}))):"")}let N=0;function k(t){N||=t;let o=Math.min(Math.max(t-N-zt.delay,0)/zt.duration,1);R=o<.5?2*o*o:1-(-2*o+2)**2/2,w(),o<1&&I&&requestAnimationFrame(k)}let f={amount:0,toAmount:0,point:A.clone(),toPoint:A.clone()},X=!1,V=0;function nt(){f.amount+=(f.toAmount-f.amount)*U.smoothing,f.point.lerp(f.toPoint,U.smoothing),u.uniforms.uFocusAmount.value=f.amount,w(),X=!(Math.abs(f.amount-f.toAmount)<.002&&f.point.distanceTo(f.toPoint)<.002),X&&I&&requestAnimationFrame(nt)}function ot(t){if(!h){if(clearTimeout(V),f.toAmount=t?1:0,t){let o=Math.round(t.y*S.rows),s=Math.round(t.x*S.cols);f.toPoint.set((t.x-.5)*z.width,et(i[o][s]),(t.y-.5)*z.depth),f.amount<.01&&f.point.copy(f.toPoint),u.uniforms.uFocus.value.set(t.x,1-t.y)}X||requestAnimationFrame(nt)}}let Rt=r.map(t=>{let o=()=>ot(t),s=()=>{clearTimeout(V),V=setTimeout(()=>ot(null),U.leaveDelay)};for(let m of["pointerenter","focusin"])t.element.addEventListener(m,o);for(let m of["pointerleave","focusout"])t.element.addEventListener(m,s);return{summit:t,enter:o,leave:s}});function kt(){x=0,O(),l.render(y,v),j(),H()}let I=!0;function w(){I&&!x&&(x=requestAnimationFrame(kt))}function rt(){let{clientWidth:t,clientHeight:o}=n;l.setSize(t,o,!1),v.aspect=t/o,v.updateProjectionMatrix(),w()}let it=0,B=h;function st(t){if(B)return;it||=t;let o=Math.min((t-it)/M.introDuration,1),s=1-(1-o)**3;d.elevation=M.startElevation+(M.endElevation-M.startElevation)*s,w(),o<1?requestAnimationFrame(st):B=!0}let g={azimuth:0,elevation:0,toAzimuth:0,toElevation:0},Y=!1;function at(){g.azimuth+=(g.toAzimuth-g.azimuth)*G.smoothing,g.elevation+=(g.toElevation-g.elevation)*G.smoothing,w(),Y=Math.abs(g.toAzimuth-g.azimuth)>.01||Math.abs(g.toElevation-g.elevation)>.01,Y&&I&&requestAnimationFrame(at)}let J=n.closest("section, aside")??n,ct=t=>{if(h||t.pointerType!=="mouse"||P||f.toAmount>0)return;let o=J.getBoundingClientRect();g.toAzimuth=((t.clientX-o.left)/o.width-.5)*-2*G.azimuth,g.toElevation=((t.clientY-o.top)/o.height-.5)*2*G.elevation,Y||requestAnimationFrame(at)};J.addEventListener("pointermove",ct);let P=null,q=[],p={velocity:0,target:0,active:!1,last:0};function ut(t){if(!p.active||!I)return;let o=Math.min((t-(p.last||t))/1e3,1/30);p.last=t;let s=d.azimuth-p.target;p.velocity+=(-$.stiffness*s-$.damping*p.velocity)*o,d.azimuth+=p.velocity*o,w(),Math.abs(s)<.01&&Math.abs(p.velocity)<.05?(d.azimuth=p.target,p.active=!1):requestAnimationFrame(ut)}l.domElement.addEventListener("pointerdown",t=>{P||!t.isPrimary||(p.active=!1,P={x:t.clientX,azimuth:d.azimuth},q=[{azimuth:d.azimuth,time:t.timeStamp}],l.domElement.setPointerCapture(t.pointerId),n.classList.add("is-dragging"))}),l.domElement.addEventListener("pointermove",t=>{if(!P||!t.isPrimary)return;let o=P.azimuth-(t.clientX-P.x)/n.clientWidth*$.degreesPerWidth;d.azimuth=Ht(o,M.maxAzimuth),q.push({azimuth:o,time:t.timeStamp}),q.length>5&&q.shift(),w()});let lt=t=>{if(!P||!t.isPrimary)return;P=null,n.classList.remove("is-dragging");let o=q[0],s=q.at(-1),m=s.time-o.time,E=t.timeStamp-s.time<80&&m>0&&!h?(s.azimuth-o.azimuth)/m*1e3:0,F=d.azimuth+E*$.momentum;if(p.target=Math.max(-M.maxAzimuth,Math.min(M.maxAzimuth,F)),h){d.azimuth=p.target,w();return}p.velocity=E,p.last=0,p.active||(p.active=!0,requestAnimationFrame(ut))};l.domElement.addEventListener("pointerup",lt),l.domElement.addEventListener("pointercancel",lt);let mt=new ResizeObserver(rt);mt.observe(n);let ht=new MutationObserver(()=>{b(),w()});ht.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});let dt=window.matchMedia("(prefers-color-scheme: dark)"),ft=()=>{b(),w()};dt.addEventListener("change",ft);function pt(){if(!e.matches){I=!1,J.removeEventListener("pointermove",ct),clearTimeout(V),e.removeEventListener("change",pt),dt.removeEventListener("change",ft),mt.disconnect(),ht.disconnect(),cancelAnimationFrame(x),B=!0,l.domElement.remove(),l.dispose(),n.classList.remove("is-3d","is-dragging"),L&&C&&L.setAttribute("d",C);for(let{summit:t,enter:o,leave:s}of Rt){for(let m of["pointerenter","focusin"])t.element.removeEventListener(m,o);for(let m of["pointerleave","focusout"])t.element.removeEventListener(m,s)}for(let t of r)t.element.style.setProperty("--x",`${t.element.dataset.x}%`),t.element.style.setProperty("--y",`${t.element.dataset.y}%`)}}e.addEventListener("change",pt),b(),rt(),requestAnimationFrame(st),h||requestAnimationFrame(k)}export{Bt as mountTerrain};
