import{ga as a}from"./index-ee1133ea.js";import{fromGeometryToGXGeometry as i,getSpatialReference as c}from"./jsonConverter-62caea18.js";import"./Transformation2D-6dd5ab6c.js";import"./ProjectionTransformation-5bc4f99e.js";import"./SimpleGeometryCursor-e3941f41.js";function l(t,m={}){const{unit:o}=m;let e=i(t).calculateLength2D();const r=c(t);return e&&o&&r&&(e=a(e,r,o)),e}export{l as execute};
