import{b as r}from"./dom-d99a6807.js";/*! All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://github.com/Esri/calcite-design-system/blob/dev/LICENSE.md for details.
v3.2.1 */function i(e){return e[e.openProp||"open"]}function s(e){requestAnimationFrame(()=>{e.transitionEl&&r(e.transitionEl,e.transitionProp,()=>{i(e)?e.onBeforeOpen():e.onBeforeClose()},()=>{i(e)?e.onOpen():e.onClose()})})}export{s as o};
