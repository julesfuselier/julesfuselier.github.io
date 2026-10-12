import{b as dt,c as W,e as D,f as ht,g as ft,h as pt,o as vt,q as gt,t as xt,v as yt}from"./chunk-JRPSU5I5.js";function Et(n){return{base:.12,step:.78/(n+1)}}var Y=13;function Tt(n){let e=2166136261;for(let o of n)e^=o.codePointAt(0),e=Math.imul(e,16777619);return e>>>0}function Rt(n){let e=n>>>0;return()=>{e=e+1831565813>>>0;let o=e;return o=Math.imul(o^o>>>15,o|1),o^=o+Math.imul(o^o>>>7,o|61),((o^o>>>14)>>>0)/4294967296}}function wt(n,e){let o=Array.from({length:(e+1)*(e+1)},n),s=(a,c)=>o[c*(e+1)+a],i=a=>a*a*(3-2*a);return(a,c)=>{let g=Math.min(a*e,e-1e-9),f=Math.min(c*e,e-1e-9),u=Math.floor(g),d=Math.floor(f),p=i(g-u),w=i(f-d),x=s(u,d)+(s(u+1,d)-s(u,d))*p,S=s(u,d+1)+(s(u+1,d+1)-s(u,d+1))*p;return x+(S-x)*w}}var J=1.7;function kt(n){let e=[5,10,20,40].map(o=>wt(n,o));return(o,s)=>{let i=0,a=0,c=.5;for(let g of e){let f=1-Math.abs(2*g(o,s)-1);i+=f*f*c,a+=c,c*=.5}return i/a}}function It(n){return(n.height??1)**(1/J)}function zt(n,e,o,s){let i=Rt(n),a=wt(i,3),c=kt(i),g=o/e,f=s.length>1?26:9,u=[];for(let d=0;d<=o;d+=1){let p=[];for(let w=0;w<=e;w+=1){let x=w/e,S=d/o,H=a(x,Math.min(S*g,1)),N=.8+.4*H,I=0,A=0;for(let P of s){let $=It(P),q=Math.hypot(x-P.x,(S-P.y)*g)*N/(.45+.55*$),F=Math.exp(-((q*q*f)**.7));$*F>I&&(I=$*F,A=F)}let z=c(x,Math.min(S*g,1)),U=z+(1-z)*A**6;p.push(I*(.35+.65*U)*.84+H*.12)}u.push(p)}return u}function St({seed:n,peaks:e,cols:o,rows:s}){return zt(Tt(n),o,s,e)}function At(n,e,o,s,i){return .5*(2*e+(o-n)*i+(2*n-5*e+4*o-s)*i*i+(3*e-n-3*o+s)*i*i*i)}function Mt(n){if(n.length<2)return[];let e=s=>n[Math.max(0,Math.min(n.length-1,s))],o=[];for(let s=0;s<n.length-1;s+=1)for(let i=0;i<16;i+=1){let a=i/16;o.push({x:At(e(s-1).x,e(s).x,e(s+1).x,e(s+2).x,a),y:At(e(s-1).y,e(s).y,e(s+1).y,e(s+2).y,a)})}return o.push({...n.at(-1)}),o}function Lt(n){return n.map(({x:e,y:o},s)=>`${s===0?"M":"L"}${e.toFixed(2)} ${o.toFixed(2)}`).join("")}var b={width:10,depth:4,height:2.3},E={cols:360,rows:144},y={fieldOfView:26,distance:9.3,startElevation:89,endElevation:44,maxAzimuth:22,introDuration:1400},V={azimuth:5,elevation:2.5,smoothing:.08},bt={delay:900,duration:1800},_={dolly:.1,smoothing:.12,leaveDelay:180},K=Math.PI/180,$t=`
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
`,qt=`
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
`;function Ct(n){return[...n.querySelectorAll("[data-summit]")].map(e=>({element:e,x:Number(e.dataset.x)/100,y:Number(e.dataset.y)/100,height:Number(e.dataset.height)}))}function Q(n){return n**J*b.height}function Ht(n){let e=new vt(b.width,b.depth,E.cols,E.rows);e.rotateX(-90*K);let o=e.attributes.position,s=new Float32Array(o.count);for(let i=0;i<=E.rows;i+=1)for(let a=0;a<=E.cols;a+=1){let c=i*(E.cols+1)+a;s[c]=n[i][a],o.setY(c,Q(n[i][a]))}return e.setAttribute("aHeight",new ft(s,1)),e.computeVertexNormals(),e}function _t(n,e){let o=Ct(n),s=St({seed:n.dataset.seed,peaks:o,...E}),{base:i,step:a}=Et(Y),c=new gt({vertexShader:$t,fragmentShader:qt,transparent:!0,uniforms:{uPaper:{value:new D},uInk:{value:new D},uBase:{value:i},uStep:{value:a},uLevels:{value:Y},uShadeLit:{value:0},uShadeStrength:{value:0},uAccent:{value:new D},uFocus:{value:new dt},uFocusAmount:{value:0}}}),g=new ht;g.add(new pt(Ht(s),c));let f=new xt(y.fieldOfView,1,.1,100),u=new yt({antialias:!0,alpha:!0});u.setPixelRatio(Math.min(window.devicePixelRatio,2)),u.domElement.setAttribute("aria-hidden","true"),n.prepend(u.domElement),n.classList.add("is-3d");let d=window.matchMedia("(prefers-reduced-motion: reduce)").matches,p={elevation:d?y.endElevation:y.startElevation,azimuth:0,distance:y.distance},w=new W(0,.55,0),x=0;function S(){let t=getComputedStyle(n);c.uniforms.uPaper.value.set(t.getPropertyValue("--canvas-soft").trim()),c.uniforms.uInk.value.set(t.getPropertyValue("--body").trim()),c.uniforms.uAccent.value.set(t.getPropertyValue("--summit").trim());let r=m=>m.getHSL({}).l,l=r(c.uniforms.uInk.value)>r(c.uniforms.uPaper.value);c.uniforms.uShadeLit.value=l?1:0,c.uniforms.uShadeStrength.value=l?.16:.42}function H(){let t=(p.elevation+v.elevation)*K,r=(p.azimuth+v.azimuth)*K;f.position.set(p.distance*Math.cos(t)*Math.sin(r),p.distance*Math.sin(t),p.distance*Math.cos(t)*Math.cos(r)),f.lookAt(w),f.position.lerp(h.point,h.amount*_.dolly)}function N(t,r){let l=Math.round(r*E.rows),m=Math.round(t*E.cols),R=new W((t-.5)*b.width,Q(s[l][m]),(r-.5)*b.depth).project(f);return{x:(R.x+1)/2,y:(1-R.y)/2}}function I(){let{clientWidth:t,clientHeight:r}=n;for(let l of o){let m=N(l.x,l.y);l.element.style.setProperty("--x",`${m.x*t}px`),l.element.style.setProperty("--y",`${m.y*r}px`)}}let A=n.querySelector("[data-trail]"),z=A?.getAttribute("d"),U=Mt([...o].sort((t,r)=>t.x-r.x)),P=d?1:0;function $(){if(!A)return;let t=U.map(({x:L,y:k})=>N(L,k)),r=P*(t.length-1),l=Math.floor(r),m=t.slice(0,l+1),R=t[l+1];if(R){let L=m.at(-1),k=r-l;m.push({x:L.x+(R.x-L.x)*k,y:L.y+(R.y-L.y)*k})}A.setAttribute("d",m.length>1?Lt(m.map(({x:L,y:k})=>({x:L*100,y:k*100}))):"")}let q=0;function F(t){q||=t;let r=Math.min(Math.max(t-q-bt.delay,0)/bt.duration,1);P=r<.5?2*r*r:1-(-2*r+2)**2/2,M(),r<1&&C&&requestAnimationFrame(F)}let h={amount:0,toAmount:0,point:w.clone(),toPoint:w.clone()},G=!1,O=0;function Z(){h.amount+=(h.toAmount-h.amount)*_.smoothing,h.point.lerp(h.toPoint,_.smoothing),c.uniforms.uFocusAmount.value=h.amount,M(),G=!(Math.abs(h.amount-h.toAmount)<.002&&h.point.distanceTo(h.toPoint)<.002),G&&C&&requestAnimationFrame(Z)}function tt(t){if(!d){if(clearTimeout(O),h.toAmount=t?1:0,t){let r=Math.round(t.y*E.rows),l=Math.round(t.x*E.cols);h.toPoint.set((t.x-.5)*b.width,Q(s[r][l]),(t.y-.5)*b.depth),h.amount<.01&&h.point.copy(h.toPoint),c.uniforms.uFocus.value.set(t.x,1-t.y)}G||requestAnimationFrame(Z)}}let Pt=o.map(t=>{let r=()=>tt(t),l=()=>{clearTimeout(O),O=setTimeout(()=>tt(null),_.leaveDelay)};for(let m of["pointerenter","focusin"])t.element.addEventListener(m,r);for(let m of["pointerleave","focusout"])t.element.addEventListener(m,l);return{summit:t,enter:r,leave:l}});function Ft(){x=0,H(),u.render(g,f),I(),$()}let C=!0;function M(){C&&!x&&(x=requestAnimationFrame(Ft))}function et(){let{clientWidth:t,clientHeight:r}=n;u.setSize(t,r,!1),f.aspect=t/r,f.updateProjectionMatrix(),M()}let nt=0,j=d;function ot(t){if(j)return;nt||=t;let r=Math.min((t-nt)/y.introDuration,1),l=1-(1-r)**3;p.elevation=y.startElevation+(y.endElevation-y.startElevation)*l,M(),r<1?requestAnimationFrame(ot):j=!0}let v={azimuth:0,elevation:0,toAzimuth:0,toElevation:0},X=!1;function rt(){v.azimuth+=(v.toAzimuth-v.azimuth)*V.smoothing,v.elevation+=(v.toElevation-v.elevation)*V.smoothing,M(),X=Math.abs(v.toAzimuth-v.azimuth)>.01||Math.abs(v.toElevation-v.elevation)>.01,X&&C&&requestAnimationFrame(rt)}let B=n.closest("section, aside")??n,st=t=>{if(d||t.pointerType!=="mouse"||T||h.toAmount>0)return;let r=B.getBoundingClientRect();v.toAzimuth=((t.clientX-r.left)/r.width-.5)*-2*V.azimuth,v.toElevation=((t.clientY-r.top)/r.height-.5)*2*V.elevation,X||requestAnimationFrame(rt)};B.addEventListener("pointermove",st);let T=null;u.domElement.addEventListener("pointerdown",t=>{j=!0,p.elevation=y.endElevation,T={x:t.clientX,azimuth:p.azimuth},u.domElement.setPointerCapture(t.pointerId),n.classList.add("is-dragging")}),u.domElement.addEventListener("pointermove",t=>{if(!T)return;let r=T.azimuth-(t.clientX-T.x)/n.clientWidth*90;p.azimuth=Math.max(-y.maxAzimuth,Math.min(y.maxAzimuth,r)),M()});let it=()=>{T=null,n.classList.remove("is-dragging")};u.domElement.addEventListener("pointerup",it),u.domElement.addEventListener("pointercancel",it);let at=new ResizeObserver(et);at.observe(n);let ct=new MutationObserver(()=>{S(),M()});ct.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});let ut=window.matchMedia("(prefers-color-scheme: dark)"),lt=()=>{S(),M()};ut.addEventListener("change",lt);function mt(){if(!e.matches){C=!1,B.removeEventListener("pointermove",st),clearTimeout(O),e.removeEventListener("change",mt),ut.removeEventListener("change",lt),at.disconnect(),ct.disconnect(),cancelAnimationFrame(x),j=!0,u.domElement.remove(),u.dispose(),n.classList.remove("is-3d","is-dragging"),A&&z&&A.setAttribute("d",z);for(let{summit:t,enter:r,leave:l}of Pt){for(let m of["pointerenter","focusin"])t.element.removeEventListener(m,r);for(let m of["pointerleave","focusout"])t.element.removeEventListener(m,l)}for(let t of o)t.element.style.setProperty("--x",`${t.element.dataset.x}%`),t.element.style.setProperty("--y",`${t.element.dataset.y}%`)}}e.addEventListener("change",mt),S(),et(),requestAnimationFrame(ot),d||requestAnimationFrame(F)}export{_t as mountTerrain};
