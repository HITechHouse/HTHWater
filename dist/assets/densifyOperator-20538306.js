import{gb as s,G as g,az as m}from"./index-ee1133ea.js";import{s as y}from"./SimpleGeometryCursor-e3941f41.js";import{o as v}from"./ProjectionTransformation-5bc4f99e.js";import{getSpatialReference as l,toGeometry as f,fromGeometry as p}from"./apiConverter-0d48c0e6.js";const i=new v;function $(n,e,r,o){return i.execute(n,e,r,o,null)}function b(n,e,r,o){const t=i.executeMany(new y(n),e,r,o,null);return Array.from(t)}function D(){return i.supportsCurves()}function G(n,e,r={}){let{maxAngleInDegrees:o=0,maxDeviation:t=0,unit:u}=r;const a=l(n);return u&&(e=s(e,u,a),t&&(t=s(t,u,a))),f($(p(n),e,t,m(o)),a)}function _(n,e,r={}){let{maxAngleInDegrees:o=0,maxDeviation:t=0,unit:u}=r;const a=n.map(p),c=l(n);return u&&(e=s(e,u,c),t&&(t=s(t,u,c))),b(a,e,t,m(o)).map(x=>f(x,c)).filter(g)}const A=D(),d=Object.freeze(Object.defineProperty({__proto__:null,execute:G,executeMany:_,supportsCurves:A},Symbol.toStringTag,{value:"Module"}));export{A as c,d as l,G as p,_ as u};
