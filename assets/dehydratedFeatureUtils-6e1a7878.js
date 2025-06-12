import{n as N}from"./glsl-d181cb51.js";import{N as C,nP as Fe,nQ as Ue,mT as Ee,nR as Ge,bE as je,ag as He,nS as Le,nT as _e,O as Be,nU as ke,nV as qe,nW as Xe,nX as Ze,cK as Qe,nY as Ye,nZ as Je,n_ as Ke,en as j,ar as B,at as D,hQ as We,eD as ie,eJ as et,R as Ae,Q as tt,eo as F,eq as z,aq as be,av as ee}from"./index-f5157718.js";import{t as nt}from"./doublePrecisionUtils-e3c3d0d8.js";import{s as ot,a as st,c as at,o as Ie,e as rt,g as Oe,h as lt,p as it,w as ct,i as ut,j as ft,k as ht,n as E,f as G,l as Re,m as Pe}from"./Geometry-8dafe6ab.js";import{e as y}from"./VertexAttribute-2e1bbe8b.js";import{e as pt}from"./mat4f64-7b47076d.js";import{u as dt}from"./meshVertexSpaceUtils-17de56f2.js";import{e as xe}from"./projectVectorToVector-0faf6a11.js";import{o as mt,x as wt}from"./hydratedFeatures-e3b8e6f3.js";import{r as I,n as U,t as Me}from"./vec3f32-ad1dc57f.js";import{w as Ce,o as gt}from"./Indices-c3d21335.js";import{M as Ot,l as vt,x as xt}from"./plane-4ee7a2fd.js";import{k as yt}from"./sphere-935a1925.js";import{t as $}from"./orientedBoundingBox-78e22e5b.js";import{s as te}from"./InterleavedLayout-dfda3115.js";function tn(e){e.code.add(N`const float MAX_RGBA_FLOAT =
255.0 / 256.0 +
255.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 / 256.0;
const vec4 FIXED_POINT_FACTORS = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
vec4 float2rgba(const float value) {
float valueInValidDomain = clamp(value, 0.0, MAX_RGBA_FLOAT);
vec4 fixedPointU8 = floor(fract(valueInValidDomain * FIXED_POINT_FACTORS) * 256.0);
const float toU8AsFloat = 1.0 / 255.0;
return fixedPointU8 * toU8AsFloat;
}`),e.code.add(N`const vec4 RGBA_TO_FLOAT_FACTORS = vec4(
255.0 / (256.0),
255.0 / (256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0 * 256.0)
);
float rgbaTofloat(vec4 rgba) {
return dot(rgba, RGBA_TO_FLOAT_FACTORS);
}`),e.code.add(N`const vec4 uninterpolatedRGBAToFloatFactors = vec4(
1.0 / 256.0,
1.0 / 256.0 / 256.0,
1.0 / 256.0 / 256.0 / 256.0,
1.0 / 256.0 / 256.0 / 256.0 / 256.0
);
float uninterpolatedRGBAToFloat(vec4 rgba) {
return (dot(round(rgba * 255.0), uninterpolatedRGBAToFloatFactors) - 0.5) * 2.0;
}`)}function nn(e,n){return e==null&&(e=[]),e.push(n),e}function on(e,n){if(e==null)return null;const o=e.filter(t=>t!==n);return o.length===0?null:o}function sn(e,n,o,t,s){oe[0]=e.get(n,0),oe[1]=e.get(n,1),oe[2]=e.get(n,2),nt(oe,k,3),o.set(s,0,k[0]),t.set(s,0,k[1]),o.set(s,1,k[2]),t.set(s,1,k[3]),o.set(s,2,k[4]),t.set(s,2,k[5])}const oe=C(),k=new Float32Array(6),At=.5;function an(e,n){e.include(ot),e.attributes.add(y.POSITION,"vec3"),e.attributes.add(y.NORMAL,"vec3"),e.attributes.add(y.CENTEROFFSETANDDISTANCE,"vec4");const o=e.vertex;st(o,n),at(o,n),o.uniforms.add(new Ie("viewport",t=>t.camera.fullViewport),new rt("polygonOffset",t=>t.shaderPolygonOffset),new Oe("cameraGroundRelative",t=>t.camera.aboveGround?1:-1)),n.hasVerticalOffset&&lt(o),o.constants.add("smallOffsetAngle","float",.984807753012208),o.code.add(N`struct ProjectHUDAux {
vec3 posModel;
vec3 posView;
vec3 vnormal;
float distanceToCamera;
float absCosAngle;
};`),o.code.add(N`
    float applyHUDViewDependentPolygonOffset(float pointGroundDistance, float absCosAngle, inout vec3 posView) {
      float pointGroundSign = ${n.terrainDepthTest?N.float(0):N`sign(pointGroundDistance)`};
      if (pointGroundSign == 0.0) {
        pointGroundSign = cameraGroundRelative;
      }

      // cameraGroundRelative is -1 if camera is below ground, 1 if above ground
      // groundRelative is 1 if both camera and symbol are on the same side of the ground, -1 otherwise
      float groundRelative = cameraGroundRelative * pointGroundSign;

      // view angle dependent part of polygon offset emulation: we take the absolute value because the sign that is
      // dropped is instead introduced using the ground-relative position of the symbol and the camera
      if (polygonOffset > .0) {
        float cosAlpha = clamp(absCosAngle, 0.01, 1.0);
        float tanAlpha = sqrt(1.0 - cosAlpha * cosAlpha) / cosAlpha;
        float factor = (1.0 - tanAlpha / viewport[2]);

        // same side of the terrain
        if (groundRelative > 0.0) {
          posView *= factor;
        }
        // opposite sides of the terrain
        else {
          posView /= factor;
        }
      }

      return groundRelative;
    }
  `),n.draped&&!n.hasVerticalOffset||it(o),n.draped||(o.uniforms.add(new Oe("perDistancePixelRatio",t=>Math.tan(t.camera.fovY/2)/(t.camera.fullViewport[2]/2))),o.code.add(N`
    void applyHUDVerticalGroundOffset(vec3 normalModel, inout vec3 posModel, inout vec3 posView) {
      float distanceToCamera = length(posView);

      // Compute offset in world units for a half pixel shift
      float pixelOffset = distanceToCamera * perDistancePixelRatio * ${N.float(At)};

      // Apply offset along normal in the direction away from the ground surface
      vec3 modelOffset = normalModel * cameraGroundRelative * pixelOffset;

      // Apply the same offset also on the view space position
      vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;

      posModel += modelOffset;
      posView += viewOffset;
    }
  `)),n.screenCenterOffsetUnitsEnabled&&ct(o),n.hasScreenSizePerspective&&ut(o),o.code.add(N`
    vec4 projectPositionHUD(out ProjectHUDAux aux) {
      vec3 centerOffset = centerOffsetAndDistance.xyz;
      float pointGroundDistance = centerOffsetAndDistance.w;

      aux.posModel = position;
      aux.posView = (view * vec4(aux.posModel, 1.0)).xyz;
      aux.vnormal = normal;
      ${n.draped?"":"applyHUDVerticalGroundOffset(aux.vnormal, aux.posModel, aux.posView);"}

      // Screen sized offset in world space, used for example for line callouts
      // Note: keep this implementation in sync with the CPU implementation, see
      //   - MaterialUtil.verticalOffsetAtDistance
      //   - HUDMaterial.applyVerticalOffsetTransformation

      aux.distanceToCamera = length(aux.posView);

      vec3 viewDirObjSpace = normalize(cameraPosition - aux.posModel);
      float cosAngle = dot(aux.vnormal, viewDirObjSpace);

      aux.absCosAngle = abs(cosAngle);

      ${n.hasScreenSizePerspective&&(n.hasVerticalOffset||n.screenCenterOffsetUnitsEnabled)?"vec3 perspectiveFactor = screenSizePerspectiveScaleFactor(aux.absCosAngle, aux.distanceToCamera, screenSizePerspectiveAlignment);":""}

      ${n.hasVerticalOffset?n.hasScreenSizePerspective?"float verticalOffsetScreenHeight = applyScreenSizePerspectiveScaleFactorFloat(verticalOffset.x, perspectiveFactor);":"float verticalOffsetScreenHeight = verticalOffset.x;":""}

      ${n.hasVerticalOffset?N`
            float worldOffset = clamp(verticalOffsetScreenHeight * verticalOffset.y * aux.distanceToCamera, verticalOffset.z, verticalOffset.w);
            vec3 modelOffset = aux.vnormal * worldOffset;
            aux.posModel += modelOffset;
            vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;
            aux.posView += viewOffset;
            // Since we elevate the object, we need to take that into account
            // in the distance to ground
            pointGroundDistance += worldOffset;`:""}

      float groundRelative = applyHUDViewDependentPolygonOffset(pointGroundDistance, aux.absCosAngle, aux.posView);

      ${n.screenCenterOffsetUnitsEnabled?"":N`
            // Apply x/y in view space, but z in screen space (i.e. along posView direction)
            aux.posView += vec3(centerOffset.x, centerOffset.y, 0.0);

            // Same material all have same z != 0.0 condition so should not lead to
            // branch fragmentation and will save a normalization if it's not needed
            if (centerOffset.z != 0.0) {
              aux.posView -= normalize(aux.posView) * centerOffset.z;
            }
          `}

      vec4 posProj = proj * vec4(aux.posView, 1.0);

      ${n.screenCenterOffsetUnitsEnabled?n.hasScreenSizePerspective?"float centerOffsetY = applyScreenSizePerspectiveScaleFactorFloat(centerOffset.y, perspectiveFactor);":"float centerOffsetY = centerOffset.y;":""}

      ${n.screenCenterOffsetUnitsEnabled?"posProj.xy += vec2(centerOffset.x, centerOffsetY) * pixelRatio * 2.0 / viewport.zw * posProj.w;":""}

      // constant part of polygon offset emulation
      posProj.z -= groundRelative * polygonOffset * posProj.w;
      return posProj;
    }
  `)}function Pt(e){e.uniforms.add(new ft("alignPixelEnabled",n=>n.alignPixelEnabled)),e.code.add(N`vec4 alignToPixelCenter(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.500123) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = (floor(xy * widthHeight) + vec2(0.5)) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`),e.code.add(N`vec4 alignToPixelOrigin(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.5) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = floor((xy + 0.5 * pixelSz) * widthHeight) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`)}var ce;(function(e){e[e.Occluded=0]="Occluded",e[e.NotOccluded=1]="NotOccluded",e[e.Both=2]="Both",e[e.COUNT=3]="COUNT"})(ce||(ce={}));function rn(e){e.vertex.uniforms.add(new Oe("renderTransparentlyOccludedHUD",n=>n.hudRenderStyle===ce.Occluded?1:n.hudRenderStyle===ce.NotOccluded?0:.75),new Ie("viewport",n=>n.camera.fullViewport),new ht("hudVisibilityTexture",n=>{var o;return(o=n.hudVisibility)==null?void 0:o.getTexture()})),e.vertex.include(Pt),e.vertex.code.add(N`bool testHUDVisibility(vec4 posProj) {
vec4 posProjCenter = alignToPixelCenter(posProj, viewport.zw);
vec4 occlusionPixel = texture(hudVisibilityTexture, .5 + .5 * posProjCenter.xy / posProjCenter.w);
if (renderTransparentlyOccludedHUD > 0.5) {
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g * renderTransparentlyOccludedHUD < 1.0;
}
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g == 1.0;
}`)}function ln(e,n){if(e.type==="point")return _(e,n,!1);if(mt(e))switch(e.type){case"extent":return _(e.center,n,!1);case"polygon":return _(e.centroid,n,!1);case"polyline":return _(Se(e),n,!0);case"mesh":return _(dt(e.vertexSpace,e.spatialReference)??e.extent.center,n,!1);case"multipoint":return}else switch(e.type){case"extent":return _(Mt(e),n,!0);case"polygon":return _(St(e),n,!0);case"polyline":return _(Se(e),n,!0);case"multipoint":return}}function Se(e){const n=e.paths[0];if(!n||n.length===0)return null;const o=Fe(n,Ue(n)/2);return xe(o[0],o[1],o[2],e.spatialReference)}function Mt(e){return xe(.5*(e.xmax+e.xmin),.5*(e.ymax+e.ymin),e.zmin!=null&&e.zmax!=null&&isFinite(e.zmin)&&isFinite(e.zmax)?.5*(e.zmax+e.zmin):void 0,e.spatialReference)}function St(e){const n=e.rings[0];if(!n||n.length===0)return null;const o=Ee(e.rings,!!e.hasZ);return xe(o[0],o[1],o[2],e.spatialReference)}function _(e,n,o){const t=o?e:wt(e);return n&&e?Ge(e,t,n)?t:null:t}function cn(e,n,o,t=0){if(e){n||(n=je());const s=e;let u=.5*s.width*(o-1),r=.5*s.height*(o-1);return s.width<1e-7*s.height?u+=r/20:s.height<1e-7*s.width&&(r+=u/20),He(n,s.xmin-u-t,s.ymin-r-t,s.xmax+u+t,s.ymax+r+t),n}return null}function un(e,n,o=null){const t=Le(_e);return e!=null&&(t[0]=e[0],t[1]=e[1],t[2]=e[2]),n!=null?t[3]=n:e!=null&&e.length>3&&(t[3]=e[3]),o&&(t[0]*=o,t[1]*=o,t[2]*=o,t[3]*=o),t}function fn(e=ke,n,o,t=1){const s=new Array(3);if(n==null||o==null)s[0]=1,s[1]=1,s[2]=1;else{let u,r=0;for(let l=2;l>=0;l--){const f=e[l],a=f!=null,c=l===0&&!u&&!a,h=o[l];let w;f==="symbol-value"||c?w=h!==0?n[l]/h:1:a&&f!=="proportional"&&isFinite(f)&&(w=h!==0?f/h:1),w!=null&&(s[l]=w,u=w,r=Math.max(r,Math.abs(w)))}for(let l=2;l>=0;l--)s[l]==null?s[l]=u:s[l]===0&&(s[l]=.001*r)}for(let u=2;u>=0;u--)s[u]/=t;return Be(s)}function $t(e){return e.isPrimitive!=null}function hn(e){return Tt($t(e)?[e.width,e.depth,e.height]:e)?null:"Symbol sizes may not be negative values"}function Tt(e){const n=o=>o==null||o>=0;return Array.isArray(e)?e.every(n):n(e)}function pn(e,n,o,t=pt()){return e&&qe(t,t,-e/180*Math.PI),n&&Xe(t,t,n/180*Math.PI),o&&Ze(t,t,o/180*Math.PI),t}function dn(e,n,o){if(o.minDemResolution!=null)return o.minDemResolution;const t=Qe(n),s=Ye(e)*t,u=Je(e)*t,r=Ke(e)*(n.isGeographic?1:t);return s===0&&u===0&&r===0?o.minDemResolutionForPoints:.01*Math.max(s,u,r)}var ve;(function(e){function n(r,l){const f=r[l],a=r[l+1],c=r[l+2];return Math.sqrt(f*f+a*a+c*c)}function o(r,l){const f=r[l],a=r[l+1],c=r[l+2],h=1/Math.sqrt(f*f+a*a+c*c);r[l]*=h,r[l+1]*=h,r[l+2]*=h}function t(r,l,f){r[l]*=f,r[l+1]*=f,r[l+2]*=f}function s(r,l,f,a,c,h=l){(c=c||r)[h]=r[l]+f[a],c[h+1]=r[l+1]+f[a+1],c[h+2]=r[l+2]+f[a+2]}function u(r,l,f,a,c,h=l){(c=c||r)[h]=r[l]-f[a],c[h+1]=r[l+1]-f[a+1],c[h+2]=r[l+2]-f[a+2]}e.length=n,e.normalize=o,e.scale=t,e.add=s,e.subtract=u})(ve||(ve={}));const X=ve,de=[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]],bt=[0,0,1,-1,0,0,1,0,0,0,-1,0,0,1,0,0,0,-1],It=[0,0,1,0,1,1,0,1],Rt=[0,1,2,2,3,0,4,0,3,3,7,4,1,5,6,6,2,1,1,0,4,4,5,1,3,2,6,6,7,3,5,4,7,7,6,5],Ne=new Array(36);for(let e=0;e<6;e++)for(let n=0;n<6;n++)Ne[6*e+n]=e;const q=new Array(36);for(let e=0;e<6;e++)q[6*e]=0,q[6*e+1]=1,q[6*e+2]=2,q[6*e+3]=2,q[6*e+4]=3,q[6*e+5]=0;function mn(e,n){Array.isArray(n)||(n=[n,n,n]);const o=new Array(24);for(let t=0;t<8;t++)o[3*t]=de[t][0]*n[0],o[3*t+1]=de[t][1]*n[1],o[3*t+2]=de[t][2]*n[2];return new G(e,[[y.POSITION,new $(o,Rt,3,!0)],[y.NORMAL,new $(bt,Ne,3)],[y.UV0,new $(It,q,2)]])}const me=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,-.5,0],[0,.5,0]],Ct=[0,1,-1,1,1,0,0,1,1,-1,1,0,0,-1,-1,1,-1,0,0,-1,1,-1,-1,0],Nt=[5,1,0,5,2,1,5,3,2,5,0,3,4,0,1,4,1,2,4,2,3,4,3,0],Dt=[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7];function wn(e,n){Array.isArray(n)||(n=[n,n,n]);const o=new Array(18);for(let t=0;t<6;t++)o[3*t]=me[t][0]*n[0],o[3*t+1]=me[t][1]*n[1],o[3*t+2]=me[t][2]*n[2];return new G(e,[[y.POSITION,new $(o,Nt,3,!0)],[y.NORMAL,new $(Ct,Dt,3)]])}const se=I(-.5,0,-.5),ae=I(.5,0,-.5),re=I(0,0,.5),le=I(0,.5,0),Z=U(),Q=U(),J=U(),K=U(),W=U();j(Z,se,le),j(Q,se,ae),B(J,Z,Q),D(J,J),j(Z,ae,le),j(Q,ae,re),B(K,Z,Q),D(K,K),j(Z,re,le),j(Q,re,se),B(W,Z,Q),D(W,W);const we=[se,ae,re,le],Vt=[0,-1,0,J[0],J[1],J[2],K[0],K[1],K[2],W[0],W[1],W[2]],zt=[0,1,2,3,1,0,3,2,1,3,0,2],Ft=[0,0,0,1,1,1,2,2,2,3,3,3];function gn(e,n){Array.isArray(n)||(n=[n,n,n]);const o=new Array(12);for(let t=0;t<4;t++)o[3*t]=we[t][0]*n[0],o[3*t+1]=we[t][1]*n[1],o[3*t+2]=we[t][2]*n[2];return new G(e,[[y.POSITION,new $(o,zt,3,!0)],[y.NORMAL,new $(Vt,Ft,3)]])}function On(e,n,o,t,s={uv:!0}){const u=-Math.PI,r=2*Math.PI,l=-Math.PI/2,f=Math.PI,a=Math.max(3,Math.floor(o)),c=Math.max(2,Math.floor(t)),h=(a+1)*(c+1),w=E(3*h),P=E(3*h),A=E(2*h),O=[];let p=0;for(let d=0;d<=c;d++){const b=[],i=d/c,M=l+i*f,S=Math.cos(M);for(let R=0;R<=a;R++){const H=R/a,v=u+H*r,V=Math.cos(v)*S,T=Math.sin(M),ne=-Math.sin(v)*S;w[3*p]=V*n,w[3*p+1]=T*n,w[3*p+2]=ne*n,P[3*p]=V,P[3*p+1]=T,P[3*p+2]=ne,A[2*p]=H,A[2*p+1]=i,b.push(p),++p}O.push(b)}const m=new Array;for(let d=0;d<c;d++)for(let b=0;b<a;b++){const i=O[d][b],M=O[d][b+1],S=O[d+1][b+1],R=O[d+1][b];d===0?(m.push(i),m.push(S),m.push(R)):d===c-1?(m.push(i),m.push(M),m.push(S)):(m.push(i),m.push(M),m.push(S),m.push(S),m.push(R),m.push(i))}const g=[[y.POSITION,new $(w,m,3,!0)],[y.NORMAL,new $(P,m,3,!0)]];return s.uv&&g.push([y.UV0,new $(A,m,2,!0)]),s.offset&&(g[0][0]=y.OFFSET,g.push([y.POSITION,new $(Float64Array.from(s.offset),Ce(m.length),3,!0)])),new G(e,g)}function vn(e,n,o,t){const s=Ut(n,o,t);return new G(e,s)}function Ut(e,n,o){const t=e;let s,u;if(o)s=[0,-1,0,1,0,0,0,0,1,-1,0,0,0,0,-1,0,1,0],u=[0,1,2,0,2,3,0,3,4,0,4,1,1,5,2,2,5,3,3,5,4,4,5,1];else{const a=t*(1+Math.sqrt(5))/2;s=[-t,a,0,t,a,0,-t,-a,0,t,-a,0,0,-t,a,0,t,a,0,-t,-a,0,t,-a,a,0,-t,a,0,t,-a,0,-t,-a,0,t],u=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1]}for(let a=0;a<s.length;a+=3)X.scale(s,a,e/X.length(s,a));let r={};function l(a,c){a>c&&([a,c]=[c,a]);const h=a.toString()+"."+c.toString();if(r[h])return r[h];let w=s.length;return s.length+=3,X.add(s,3*a,s,3*c,s,w),X.scale(s,w,e/X.length(s,w)),w/=3,r[h]=w,w}for(let a=0;a<n;a++){const c=u.length,h=new Array(4*c);for(let w=0;w<c;w+=3){const P=u[w],A=u[w+1],O=u[w+2],p=l(P,A),m=l(A,O),g=l(O,P),d=4*w;h[d]=P,h[d+1]=p,h[d+2]=g,h[d+3]=A,h[d+4]=m,h[d+5]=p,h[d+6]=O,h[d+7]=g,h[d+8]=m,h[d+9]=p,h[d+10]=m,h[d+11]=g}u=h,r={}}const f=Pe(s);for(let a=0;a<f.length;a+=3)X.normalize(f,a);return[[y.POSITION,new $(Pe(s),u,3,!0)],[y.NORMAL,new $(f,u,3,!0)]]}function xn(e,n={}){const{normal:o,position:t,color:s,rotation:u,size:r,centerOffsetAndDistance:l,uvs:f,featureAttribute:a,objectAndLayerIdColor:c=null}=n,h=t?Ae(t):C(),w=o?Ae(o):tt(0,0,1),P=s?[255*s[0],255*s[1],255*s[2],s.length>3?255*s[3]:255]:[255,255,255,255],A=r!=null&&r.length===2?r:[1,1],O=u!=null?[u]:[0],p=Ce(1),m=[[y.POSITION,new $(h,p,3,!0)],[y.NORMAL,new $(w,p,3,!0)],[y.COLOR,new $(P,p,4,!0)],[y.SIZE,new $(A,p,2)],[y.ROTATION,new $(O,p,1,!0)]];if(f&&m.push([y.UV0,new $(f,p,f.length)]),l!=null){const g=[l[0],l[1],l[2],l[3]];m.push([y.CENTEROFFSETANDDISTANCE,new $(g,p,4)])}if(a){const g=[a[0],a[1],a[2],a[3]];m.push([y.FEATUREATTRIBUTE,new $(g,p,4)])}return new G(e,m,null,Re.Point,c)}function Et(e,n,o,t,s=!0,u=!0){let r=0;const l=n,f=e;let a=I(0,r,0),c=I(0,r+f,0),h=I(0,-1,0),w=I(0,1,0);t&&(r=f,c=I(0,0,0),a=I(0,r,0),h=I(0,1,0),w=I(0,-1,0));const P=[c,a],A=[h,w],O=o+2,p=Math.sqrt(f*f+l*l);if(t)for(let i=o-1;i>=0;i--){const M=i*(2*Math.PI/o),S=I(Math.cos(M)*l,r,Math.sin(M)*l);P.push(S);const R=I(f*Math.cos(M)/p,-l/p,f*Math.sin(M)/p);A.push(R)}else for(let i=0;i<o;i++){const M=i*(2*Math.PI/o),S=I(Math.cos(M)*l,r,Math.sin(M)*l);P.push(S);const R=I(f*Math.cos(M)/p,l/p,f*Math.sin(M)/p);A.push(R)}const m=new Array,g=new Array;if(s){for(let i=3;i<P.length;i++)m.push(1),m.push(i-1),m.push(i),g.push(0),g.push(0),g.push(0);m.push(P.length-1),m.push(2),m.push(1),g.push(0),g.push(0),g.push(0)}if(u){for(let i=3;i<P.length;i++)m.push(i),m.push(i-1),m.push(0),g.push(i),g.push(i-1),g.push(1);m.push(0),m.push(2),m.push(P.length-1),g.push(1),g.push(2),g.push(A.length-1)}const d=E(3*O);for(let i=0;i<O;i++)d[3*i]=P[i][0],d[3*i+1]=P[i][1],d[3*i+2]=P[i][2];const b=E(3*O);for(let i=0;i<O;i++)b[3*i]=A[i][0],b[3*i+1]=A[i][1],b[3*i+2]=A[i][2];return[[y.POSITION,new $(d,m,3,!0)],[y.NORMAL,new $(b,g,3,!0)]]}function yn(e,n,o,t,s,u=!0,r=!0){return new G(e,Et(n,o,t,s,u,r))}function An(e,n,o,t,s,u,r){const l=s?Me(s):I(1,0,0),f=u?Me(u):I(0,0,0);r??(r=!0);const a=U();D(a,l);const c=U();F(c,a,Math.abs(n));const h=U();F(h,c,-.5),z(h,h,f);const w=I(0,1,0);Math.abs(1-be(a,w))<.2&&ie(w,0,0,1);const P=U();B(P,a,w),D(P,P),B(w,P,a);const A=2*t+(r?2:0),O=t+(r?2:0),p=E(3*A),m=E(3*O),g=E(2*A),d=new Array(3*t*(r?4:2)),b=new Array(3*t*(r?4:2));r&&(p[3*(A-2)]=h[0],p[3*(A-2)+1]=h[1],p[3*(A-2)+2]=h[2],g[2*(A-2)]=0,g[2*(A-2)+1]=0,p[3*(A-1)]=p[3*(A-2)]+c[0],p[3*(A-1)+1]=p[3*(A-2)+1]+c[1],p[3*(A-1)+2]=p[3*(A-2)+2]+c[2],g[2*(A-1)]=1,g[2*(A-1)+1]=1,m[3*(O-2)]=-a[0],m[3*(O-2)+1]=-a[1],m[3*(O-2)+2]=-a[2],m[3*(O-1)]=a[0],m[3*(O-1)+1]=a[1],m[3*(O-1)+2]=a[2]);const i=(v,V,T)=>{d[v]=V,b[v]=T};let M=0;const S=U(),R=U();for(let v=0;v<t;v++){const V=v*(2*Math.PI/t);F(S,w,Math.sin(V)),F(R,P,Math.cos(V)),z(S,S,R),m[3*v]=S[0],m[3*v+1]=S[1],m[3*v+2]=S[2],F(S,S,o),z(S,S,h),p[3*v]=S[0],p[3*v+1]=S[1],p[3*v+2]=S[2],g[2*v]=v/t,g[2*v+1]=0,p[3*(v+t)]=p[3*v]+c[0],p[3*(v+t)+1]=p[3*v+1]+c[1],p[3*(v+t)+2]=p[3*v+2]+c[2],g[2*(v+t)]=v/t,g[2*v+1]=1;const T=(v+1)%t;i(M++,v,v),i(M++,v+t,v),i(M++,T,T),i(M++,T,T),i(M++,v+t,v),i(M++,T+t,T)}if(r){for(let v=0;v<t;v++){const V=(v+1)%t;i(M++,A-2,O-2),i(M++,v,O-2),i(M++,V,O-2)}for(let v=0;v<t;v++){const V=(v+1)%t;i(M++,v+t,O-1),i(M++,A-1,O-1),i(M++,V+t,O-1)}}const H=[[y.POSITION,new $(p,d,3,!0)],[y.NORMAL,new $(m,b,3,!0)],[y.UV0,new $(g,d,2,!0)]];return new G(e,H)}function Pn(e,n,o,t,s,u){t=t||10,s=s==null||s,te(n.length>1);const r=[[0,0,0]],l=[],f=[];for(let a=0;a<t;a++){l.push([0,-a-1,-(a+1)%t-1]);const c=a/t*2*Math.PI;f.push([Math.cos(c)*o,Math.sin(c)*o])}return Gt(e,f,n,r,l,s,u)}function Gt(e,n,o,t,s,u,r=I(0,0,0)){const l=n.length,f=E(o.length*l*3+(6*t.length||0)),a=E(o.length*l*3+(t?6:0)),c=new Array,h=new Array;let w=0,P=0;const A=C(),O=C(),p=C(),m=C(),g=C(),d=C(),b=C(),i=C(),M=C(),S=C(),R=C(),H=C(),v=C(),V=Ot();ie(M,0,1,0),j(O,o[1],o[0]),D(O,O),u?(z(i,o[0],r),D(p,i)):ie(p,0,0,1),$e(O,p,M,M,g,p,Te),ee(m,p),ee(H,g);for(let x=0;x<t.length;x++)F(d,g,t[x][0]),F(i,p,t[x][2]),z(d,d,i),z(d,d,o[0]),f[w++]=d[0],f[w++]=d[1],f[w++]=d[2];a[P++]=-O[0],a[P++]=-O[1],a[P++]=-O[2];for(let x=0;x<s.length;x++)c.push(s[x][0]>0?s[x][0]:-s[x][0]-1+t.length),c.push(s[x][1]>0?s[x][1]:-s[x][1]-1+t.length),c.push(s[x][2]>0?s[x][2]:-s[x][2]-1+t.length),h.push(0),h.push(0),h.push(0);let T=t.length;const ne=t.length-1;for(let x=0;x<o.length;x++){let ye=!1;x>0&&(ee(A,O),x<o.length-1?(j(O,o[x+1],o[x]),D(O,O)):ye=!0,z(S,A,O),D(S,S),z(R,o[x-1],m),vt(o[x],S,V),xt(V,yt(R,A),i)?(j(i,i,o[x]),D(p,i),B(g,S,p),D(g,g)):$e(S,m,H,M,g,p,Te),ee(m,p),ee(H,g)),u&&(z(i,o[x],r),D(v,i));for(let L=0;L<l;L++)if(F(d,g,n[L][0]),F(i,p,n[L][1]),z(d,d,i),D(b,d),a[P++]=b[0],a[P++]=b[1],a[P++]=b[2],z(d,d,o[x]),f[w++]=d[0],f[w++]=d[1],f[w++]=d[2],!ye){const he=(L+1)%l;c.push(T+L),c.push(T+l+L),c.push(T+he),c.push(T+he),c.push(T+l+L),c.push(T+l+he);for(let pe=0;pe<6;pe++){const ze=c.length-6;h.push(c[ze+pe]-ne)}}T+=l}const De=o[o.length-1];for(let x=0;x<t.length;x++)F(d,g,t[x][0]),F(i,p,t[x][1]),z(d,d,i),z(d,d,De),f[w++]=d[0],f[w++]=d[1],f[w++]=d[2];const ue=P/3;a[P++]=O[0],a[P++]=O[1],a[P++]=O[2];const fe=T-l;for(let x=0;x<s.length;x++)c.push(s[x][0]>=0?T+s[x][0]:-s[x][0]-1+fe),c.push(s[x][2]>=0?T+s[x][2]:-s[x][2]-1+fe),c.push(s[x][1]>=0?T+s[x][1]:-s[x][1]-1+fe),h.push(ue),h.push(ue),h.push(ue);const Ve=[[y.POSITION,new $(f,c,3,!0)],[y.NORMAL,new $(a,h,3,!0)]];return new G(e,Ve)}function Mn(e,n,o,t){te(n.length>1,"createPolylineGeometry(): polyline needs at least 2 points"),te(n[0].length===3,"createPolylineGeometry(): malformed vertex"),te(o==null||o.length===n.length,"createPolylineGeometry: need same number of points and normals"),te(o==null||o[0].length===3,"createPolylineGeometry(): malformed normal");const s=We(3*n.length),u=new Array(2*(n.length-1));let r=0,l=0;for(let a=0;a<n.length;a++){for(let c=0;c<3;c++)s[r++]=n[a][c];a>0&&(u[l++]=a-1,u[l++]=a)}const f=[[y.POSITION,new $(s,u,3,!0)]];if(o){const a=E(3*o.length);let c=0;for(let h=0;h<n.length;h++)for(let w=0;w<3;w++)a[c++]=o[h][w];f.push([y.NORMAL,new $(a,u,3,!0)])}return t&&f.push([y.COLOR,new $(t,gt(t.length/4),4)]),new G(e,f,null,Re.Line)}function Sn(e,n,o,t,s,u=0){const r=new Array(18),l=[[-o,u,s/2],[t,u,s/2],[0,n+u,s/2],[-o,u,-s/2],[t,u,-s/2],[0,n+u,-s/2]],f=[0,1,2,3,0,2,2,5,3,1,4,5,5,2,1,1,0,3,3,4,1,4,3,5];for(let a=0;a<6;a++)r[3*a]=l[a][0],r[3*a+1]=l[a][1],r[3*a+2]=l[a][2];return new G(e,[[y.POSITION,new $(r,f,3,!0)]])}function $n(e,n){const o=e.getMutableAttribute(y.POSITION).data;for(let t=0;t<o.length;t+=3){const s=o[t],u=o[t+1],r=o[t+2];ie(Y,s,u,r),et(Y,Y,n),o[t]=Y[0],o[t+1]=Y[1],o[t+2]=Y[2]}}function Tn(e,n=e){const o=e.attributes,t=o.get(y.POSITION).data,s=o.get(y.NORMAL).data;if(s){const u=n.getMutableAttribute(y.NORMAL).data;for(let r=0;r<s.length;r+=3){const l=s[r+1];u[r+1]=-s[r+2],u[r+2]=l}}if(t){const u=n.getMutableAttribute(y.POSITION).data;for(let r=0;r<t.length;r+=3){const l=t[r+1];u[r+1]=-t[r+2],u[r+2]=l}}}function ge(e,n,o,t,s){return!(Math.abs(be(n,e))>s)&&(B(o,e,n),D(o,o),B(t,o,e),D(t,t),!0)}function $e(e,n,o,t,s,u,r){return ge(e,n,s,u,r)||ge(e,o,s,u,r)||ge(e,t,s,u,r)}const Te=.99619469809,Y=C();function bn(e){return e.type==="point"}export{un as A,wn as B,fn as D,dn as E,mn as F,$e as M,$n as O,cn as S,hn as U,Tt as Z,sn as a,nn as b,bn as c,At as d,Et as e,ce as f,gn as g,An as h,yn as i,ln as j,xn as k,Pt as l,Tn as m,rn as n,pn as o,On as p,Sn as q,on as r,vn as s,tn as t,an as u,Pn as v,Mn as w,Gt as x};
