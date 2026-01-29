import{c as i,r as u,j as e,d as l,X as N}from"./index-DykhQkCz.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=i("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=i("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=i("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);function R({value:p,onChange:h,onFileSelect:m,isUploading:n=!1,size:x="md",shape:f="circle",placeholder:g,className:y}){const s=u.useRef(null),[v,c]=u.useState(null),j={sm:"w-16 h-16",md:"w-24 h-24",lg:"w-32 h-32"},b=t=>{var d;const r=(d=t.target.files)==null?void 0:d[0];if(!r)return;if(!r.type.startsWith("image/")){alert("Please select an image file");return}if(r.size>5*1024*1024){alert("File size must be less than 5MB");return}const a=new FileReader;a.onloadend=()=>{c(a.result)},a.readAsDataURL(r),m(r)},w=t=>{t.stopPropagation(),c(null),h(null),s.current&&(s.current.value="")},o=v||p;return e.jsxs("div",{className:l("relative cursor-pointer group",j[x],f==="circle"?"rounded-full":"rounded-xl","bg-muted/20 border-2 border-dashed border-muted-foreground/30","flex items-center justify-center overflow-hidden","transition-all hover:border-primary/50 hover:bg-muted/30",y),onClick:()=>{var t;return(t=s.current)==null?void 0:t.click()},children:[e.jsx("input",{ref:s,type:"file",accept:"image/*",className:"hidden",onChange:b,disabled:n}),n?e.jsxs("div",{className:"flex flex-col items-center justify-center gap-1",children:[e.jsx(C,{className:"w-6 h-6 animate-spin text-primary"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"Uploading..."})]}):o?e.jsxs(e.Fragment,{children:[e.jsx("img",{src:o,alt:"Preview",className:"w-full h-full object-cover"}),e.jsx("button",{type:"button",onClick:w,className:l("absolute top-1 right-1 p-1 rounded-full","bg-destructive text-destructive-foreground","opacity-0 group-hover:opacity-100 transition-opacity","hover:bg-destructive/90"),children:e.jsx(N,{className:"w-3 h-3"})}),e.jsx("div",{className:l("absolute inset-0 flex items-center justify-center","bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"),children:e.jsx(k,{className:"w-6 h-6 text-white"})})]}):e.jsx("div",{className:"flex flex-col items-center justify-center gap-1 text-muted-foreground",children:g||e.jsxs(e.Fragment,{children:[e.jsx(U,{className:"w-6 h-6"}),e.jsx("span",{className:"text-xs",children:"Upload"})]})})]})}export{R as P};
