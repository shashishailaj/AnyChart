if(!_.vml){_.vml=1;(function($){var zM=function(a){var b=Math.pow(10,6);return Math.round(a*b)/b},AM=function(a,b){var c=a.x-b.x,d=a.y-b.y;return Math.sqrt(c*c+d*d)},BM=function(a,b,c,d,e){$.Sg.call(this,a,b,c,d,e)},CM=function(a,b,c,d,e,f,h){$.Hj.call(this,a,b,c,b,b,f,h);this.YF=d;this.ZF=e},DM=function(a,b,c,d,e,f,h){f=null!=f?$.Hb(f,0,1):1;var k=[];(0,$.Za)(a,function(a){k.push(""+a.offset+a.color+(a.opacity?a.opacity:null))});return k.join("")+f+b+c+d+e+(h?""+h.left+h.top+h.width+h.height:"")},HM=function(){$.Mh.call(this);
var a=window.document;pda()||a.createStyleSheet().addRule("."+EM,"behavior:url(#default#VML)");try{a.namespaces[FM]||a.namespaces.add(FM,qda),this.g=function(a){return $.bf(FM+":"+a,{"class":EM})}}catch(b){this.g=function(a){return $.bf(FM+":"+a,{"class":EM,xmlns:"urn:schemas-microsoft.com:vml"})}}GM&&(this.Nb=this.gda)},IM=function(a){return $.B(a)&&$.ya(a,"%")?(0,window.parseFloat)(a)+"%":(0,window.parseFloat)(String(a))+"px"},JM=function(a){return 100*Math.round(a)},KM=function(a,b){a[b]&&(a.cssText=
a.cssText.replace(new RegExp("(^|; )("+b+": [^;]*)(;|$)","ig"),";"))},LM=function(a,b){a.Nb(b,"coordsize",JM(1)+" "+JM(1));$.Vh(a,b.style,{position:"absolute",left:IM(0),top:IM(0),width:IM(1),height:IM(1)})},pda=function(){return!!$.bb($.ak(),function(a){return a.selectorText==="."+EM})},MM=function(a,b){var c=a%90,d=$.H(a),e=1,f=b.left+b.width/2,h=b.top+b.height/2,k=0>Math.sin(d)||180==a||360==a;if(90==a||270==a)c+=1E-6;180!=a&&(0>Math.tan(d)||90==a||270==a)&&(e=-1,c=90-c);c=$.H(c);d=Math.tan(c);
d=Math.sin(c)*(b.height/2-d*b.width/2)+Math.sqrt(Math.pow(b.width/2,2)*(1+Math.pow(d,2)));e*=Math.cos(c)*d;c=1*Math.sin(c)*d;k&&(e=-e,c=-c);return{wf:new $.Pb(Math.round(f-e),Math.round(h+c)),uh:new $.Pb(Math.round(f+e),Math.round(h-c))}},NM=function(a,b){var c,d;b.wf.x==b.uh.x?(c=b.wf.x,d=a.y):b.wf.y==b.uh.y?(c=a.x,d=b.wf.y):(c=(b.wf.x*Math.pow(b.uh.y-b.wf.y,2)+a.x*Math.pow(b.uh.x-b.wf.x,2)+(b.uh.x-b.wf.x)*(b.uh.y-b.wf.y)*(a.y-b.wf.y))/(Math.pow(b.uh.y-b.wf.y,2)+Math.pow(b.uh.x-b.wf.x,2)),d=(b.uh.x-
b.wf.x)*(a.x-c)/(b.uh.y-b.wf.y)+a.y);c=new $.Pb(c,d);d=[$.Hb(b.wf.x-b.uh.x,-1,1),$.Hb(b.wf.y-b.uh.y,-1,1)];var e=[$.Hb(b.wf.x-c.x,-1,1),$.Hb(b.wf.y-c.y,-1,1)],f=[$.Hb(b.uh.x-c.x,-1,1),$.Hb(b.uh.y-c.y,-1,1)];return 0>(d[0]?(e[0]+f[0])*d[0]:(e[1]+f[1])*d[1])?-AM(b.wf,c):AM(b.wf,c)},rda=function(a,b,c,d){var e=MM(c,d);d=AM(e.wf,e.uh);var f=MM(c,b);b=AM(f.wf,f.uh);c=NM(e.wf,f);var e=NM(e.uh,f),f={offset:Math.round(c/b*100)/100,color:"",opacity:1},h={offset:Math.round(e/b*100)/100,color:"",opacity:1},
k=[];k.toString=function(){for(var a="\n",b=0,c=this.length;b<c;b++)a+="offset: "+this[b].offset+"; color: "+this[b].color+"; opacity: "+this[b].opacity+"\n";return a};var l,m,p,q;k.push(f);for(p=0;p<a.length;p++){var r=a[p];r.color=$.El(r.color).Pf;r.offset<=f.offset?l={offset:r.offset,color:r.color,opacity:r.opacity}:r.offset>f.offset&&r.offset<h.offset?k.push({offset:r.offset,color:r.color,opacity:r.opacity}):r.offset>=h.offset&&!m&&(m={offset:r.offset,color:r.color,opacity:r.opacity})}k.push(h);
a=r=1;if(2<k.length){l||(l=k[1]);p=b*l.offset;q=Math.abs(b*k[1].offset-p);var t=$.Fl(String(l.color)),u=$.Fl(String(k[1].color)),r=r-(q?Math.abs(c-p)/q:0);f.color=$.uc($.Il(t,u,r));m||(m=k[k.length-2]);q=b*m.offset;p=b*k[k.length-2].offset;r=Math.abs(p-q);q=$.Fl(String(k[k.length-2].color));t=$.Fl(String(m.color));a-=r?Math.abs(e-p)/r:0;h.color=$.uc($.Il(q,t,a))}else l||0!=m.offset||(l=m),m||1!=l.offset||(m=l),p=b*l.offset,q=b*m.offset,t=$.Fl(String(l.color)),u=$.Fl(String(m.color)),q=Math.abs(q-
p),r-=q?Math.abs(c-p)/q:0,a-=q?Math.abs(e-p)/q:0,f.color=$.uc($.Il(t,u,r)),h.color=$.uc($.Il(t,u,a));f.opacity=l.opacity;h.opacity=m.opacity;for(p=0;p<k.length;p++)k[p].offset=p?p==k.length-1?1:Math.abs(c-k[p].offset*b)/d:0;return k},sda=function(a,b){a=String(a);if(!a)return"none";var c=a.split(" ");c.length%2&&c.push.apply(c,c);for(var d=[],e=0;e<c.length;e++)d.push(Math.ceil((0,window.parseFloat)(c[e])/b));return d.join(" ")},OM=function(a,b){$.nd.call(this);this.F=a;this.B=b},PM=function(a){delete a.F;
$.lf(a.at);a.at=null},QM=function(a){$.Jj.call(this,a);this.g={};this.B={}},tda=function(a,b,c){var d="",d=$.B(b)?d+(b+"1"):$.J(b,$.Hj)?DM(b.keys,b.Cd,b.Dd,b.YF,b.ZF,b.opacity,b.Jb):$.J(b,$.Fj)?$.Gj(b.keys,b.opacity,b.angle,b.mode):d+(b.color+b.opacity),e;if($.B(c))e=c;else if("keys"in c){var f=0!=c.keys.length?c.keys[0]:c;e=f.color||"black";e+="opacity"in f?f.opacity:1}else e=c.color,e+="opacity"in c?c.opacity:1;d=""+d+(""+c.thickness+e+c.lineJoin+c.lineCap+c.dash);if($.Lc(a.g,d))return a.g[d];b=
new OM(b,c);return a.g[d]=b},uda=function(a,b,c,d,e,f,h,k){k=k?k:null;var l=DM(b,c,d,e,f,h,k);return $.Lc(a.B,l)?a.B[l]:a.B[l]=new CM(b,c,d,e,f,h,k)},RM=function(a,b,c){$.Sj.call(this,a,b,c)},SM=function(a,b){$.ri.call(this,a,b);this.Ja=null;this.ba=!1;this.Ua=null},TM=function(a){var b=a.Me();return!(!b||b&&1==b.Zc&&!b.he&&!b.ce&&1==b.Vd)||!!a.vm()},UM=function(a){var b=a.Ua;a=a.Me();return b||a?b&&a?!(a.Zc==b.Zc&&a.he==b.he&&a.ce==b.ce&&a.Vd==b.Vd):!0:!1},VM=function(a){var b=a.ba;a.ba=TM(a);var c=
!b&&a.ba,b=b&&!a.ba,d=!a.Ca()||a.Ca().Od();d||a.Ca().te();c?(a.wb(1024),a.wb(32),a.wb(16384),a.wb(4),a.Jb=new $.I(a.x(),a.y(),a.Pb,a.kc)):b&&(a.wb(1024),a.wb(32),a.wb(16384),a.wb(4),a.Jb=a.hj(a.Ja,{}));d||a.Ca().me()};$.G(BM,$.Sg);BM.prototype.Vb=function(){var a=$.Ug(this),b=a&&!a.Od();b&&a.te();(0,$.Za)(this.J,function(a){a.wb(512)},this);b&&a.me()};$.F("acgraph.vml.Clip",BM);$.G(CM,$.Hj);$.G(HM,$.Mh);$.ka(HM);var qda="urn:schemas-microsoft-com:vml",FM="any_vml",EM="any_vml",GM=$.fa.document&&$.fa.document.documentMode&&8<=$.fa.document.documentMode;$.g=HM.prototype;$.g.Pj=null;$.g.Sg=null;$.g.UA=null;$.g.Kt=null;$.g.hm=null;$.g.Uz=null;$.g.gda=function(a,b,c){a[b]=c};$.g.IJ=function(){return window.document.createElement("div")};
$.g.Mn=function(){this.Kt=this.PJ();LM(this,this.Kt);this.Kt.style.display="none";$.Vh(this,this.Kt,{filled:"true",fillcolor:"black",stroked:"false",path:"m0,0 l1,0 e"});window.document.body.appendChild(this.Kt);this.Pj=$.bf("DIV");this.Sg=$.bf("SPAN");this.UA=$.bf("SPAN");window.document.body.appendChild(this.Pj);this.Pj.appendChild(this.UA);this.Pj.appendChild(this.Sg);$.Of(this.Pj,{position:"absolute",visibility:"hidden",left:0,top:0});$.Of(this.UA,{"font-size":"0px",border:"0 solid"});this.UA.innerHTML=
"a";this.b=$.bf("SPAN");this.Pj.appendChild(this.b);$.Of(this.b,{"font-size":"0px",border:"0 solid"});this.b.innerHTML="a";this.Uz=$.bf("IMG");$.Of(this.Uz,{position:"absolute",left:0,top:0});this.Pj.appendChild(this.Uz);this.Jk=$.bf("DIV");this.Pj.appendChild(this.Jk)};$.g.TE=function(a){this.Pj||this.Mn();this.Nb(this.Uz,"src",a);return $.fg(this.Uz)};
$.g.measure=function(a,b){if(""==a)return new $.I(0,0,0,0);this.Pj||this.Mn();$.lf(this.hm);this.hm=this.$w("");this.Kt.appendChild(this.hm);var c=null,d=0;if(" "==a)return $.Ph(this,b);$.xa(a," ")&&(d+=c=$.Ph(this,b).width);$.ya(a," ")&&(d+=c||$.Ph(this,b).width);KM(this.Sg.style,"font-style");KM(this.Sg.style,"font-variant");KM(this.Sg.style,"font-family");KM(this.Sg.style,"font-size");KM(this.Sg.style,"font-weight");KM(this.Sg.style,"letter-spacing");KM(this.Sg.style,"text-decoration");this.Sg.style.cssText=
"";b.fontStyle&&($.Of(this.Sg,"font-style",b.fontStyle),$.Of(this.hm,"font-style",b.fontStyle));b.fontVariant&&($.Of(this.Sg,"font-variant",b.fontVariant),$.Of(this.hm,"font-variant",b.fontVariant));b.fontFamily&&($.Of(this.Sg,"font-family",b.fontFamily),$.Of(this.hm,"font-family",b.fontFamily));b.fontSize&&($.Of(this.Sg,"font-size",b.fontSize),$.Of(this.hm,"font-size",b.fontSize));b.fontWeight?($.Of(this.Sg,"font-weight",b.fontWeight),$.Of(this.hm,"font-weight",b.fontWeight)):($.Of(this.Sg,"font-weight",
"normal"),$.Of(this.hm,"font-weight","normal"));b.letterSpacing&&($.Of(this.Sg,"letter-spacing",b.letterSpacing),this.hm.style["v-text-spacing"]="normal"==b.letterSpacing?"":b.letterSpacing);b.mp&&($.Of(this.Sg,"text-decoration",b.decoration),$.Of(this.hm,"text-decoration",b.decoration));$.Of(this.Sg,"border","0 solid");this.Nb(this.hm,"string",a);c=$.fg(this.Kt).width;$.Of(this.Pj,{left:0,top:0,width:"auto",height:"auto"});this.Sg.innerHTML=a;var e=$.fg(this.UA);$.Vf(this.Pj,0,-(e.top+e.height));
e=$.fg(this.Sg);e.width=c+d;--e.left;this.Sg.innerHTML="";return e};$.g.ML=function(a){this.Pj||this.Mn();$.B(a)?this.Jk.innerHTML=a:(a=a.cloneNode(!0),this.Jk.appendChild(a));a=$.fg(this.Jk);this.Jk.innerHTML="";return a};$.g.rV={1:"m",2:"l",3:"c",4:"ae",5:"x"};$.g.IV=function(a,b){var c=b[2]+b[3];a.push(JM(b[4]-$.Lb(c,b[0])),JM(b[5]-$.Mb(c,b[1])),JM(b[0]),JM(b[1]),Math.round(-65536*b[2]),Math.round(-65536*b[3]))};$.g.MV=function(a,b){$.id(Array.prototype.push,(0,$.Eb)(b,JM),a)};
$.g.eS=function(){return $.bf("div",{style:"overflow:hidden;position:relative;"})};$.g.RF=function(a,b,c){$.Vh(this,a.style,{width:IM(b),height:IM(c)})};$.g.HJ=HM.prototype.IJ;$.g.Cy=HM.prototype.IJ;$.g.WR=function(){return this.g("image")};$.g.SR=function(){return this.g("shape")};$.g.aS=function(){return this.g("shape")};$.g.UR=function(){return this.g("shape")};$.g.ZR=function(){return this.g("fill")};$.g.VR=HM.prototype.IJ;$.g.vW=$.ia;$.g.BW=$.ia;
$.g.yW=function(a){$.Vh(this,a.ja().style,{position:"absolute",left:IM(0),top:IM(0),width:IM(1),height:IM(1)})};
$.g.wW=function(a){var b=a.Ig(),c=a.ja(),d=a.src()||"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",e=a.align(),f,h,k;if(e==$.Dh)e=b.left,f=b.top,h=b.width,k=b.height;else{k=this.TE(d);h=k.width/b.width;f=k.height/b.height;var l=a.Av()==$.Eh;f=1/((1<h&&1<f||1>h&&1>f?l?h>f:h<f:l?1<h:1>h)?h:f);h=k.width*f;k=k.height*f;switch(e){case $.Dh:e=b.width;f=b.height;break;case "x-min-y-min":e=b.left;f=b.top;break;case "x-mid-y-min":e=b.left+b.width/2-h/2;f=b.top;break;case "x-max-y-min":e=
b.left+b.width-h;f=b.top;break;case "x-min-y-mid":e=b.left;f=b.top+b.height/2-k/2;break;default:case "x-mid-y-mid":e=b.left+b.width/2-h/2;f=b.top+b.height/2-k/2;break;case "x-max-y-mid":e=b.left+b.width-h;f=b.top+b.height/2-k/2;break;case "x-min-y-max":e=b.left;f=b.top+b.height-k;break;case "x-mid-y-max":e=b.left+b.width/2-h/2;f=b.top+b.height-k;break;case "x-max-y-max":e=b.left+b.width-h,f=b.top+b.height-k}}$.Vh(this,c.style,{position:"absolute",left:IM(e),top:IM(f),width:IM(h),height:IM(k)});this.Nb(c,
"src",d);a.clip(b)};$.g.rW=function(a){this.CM(a)};$.g.CM=function(a){var b=a.ja();LM(this,b);var c=a.In(),d=a.Jn(),e=a.tm(),f=a.zq(),h=a.Me();h&&!$.cc(h)?(c=$.Yb(c,d,e,f,0,360,!1),d=c.length,h.transform(c,0,c,0,d/2),h=["m",JM(c[d-2]),JM(c[d-1]),"c"],$.id(Array.prototype.push,(0,$.Eb)(c,JM),h)):h=["ae",JM(c),JM(d),JM(e),JM(f),0,Math.round(-23592960)];h.push("x");$.Hg(a,4);$.Hg(a,256);this.Nb(b,"path",h.join(" "))};
$.g.FM=function(a){var b=a.ja();LM(this,b);var c=$.Yh(this,a,!0);c?this.Nb(b,"path",c):(this.Nb(b,"path","M 0,0"),b.removeAttribute("path"));$.Hg(a,4);$.Hg(a,256)};$.g.PJ=function(){var a=this.g("shape"),b=this.g("path");b.setAttribute("textpathok","t");a.appendChild(b);return a};$.g.WC=function(){return window.document.createElement("span")};$.g.$w=function(a){var b=this.g("textpath");b.setAttribute("on","t");b.setAttribute("string",a);return b};
$.g.sW=function(a,b){var c=a.ja();c&&(c.style.cursor=b||"")};$.g.HM=function(a){var b=a.ja().style,c,d;TM(a)?a.path()||(d=a.za,a.j.length&&(d-=a.j[0].j),c=a.K,$.Vh(this,b,{position:"absolute",overflow:"visible",left:IM(c),top:IM(d)})):(c=a.x(),d=a.y(),a.Jo()&&a.height()&&a.height()>a.o&&("middle"==a.Jo()&&(d+=a.height()/2-a.o/2),"bottom"==a.Jo()&&(d+=a.height()-a.o)),$.Vh(this,b,{position:"absolute",overflow:"hidden",left:IM(c),top:IM(d)}))};
$.g.EW=function(a){var b=a.ja(),c=b.style;b.style.cssText="";TM(a)?(a.path()||$.Vh(this,c,{width:IM(1),height:IM(1)}),b.innerHTML=""):null!=a.Ja&&(a.fontSize()&&$.Of(b,"font-size",a.fontSize()),a.color()&&$.Of(b,"color",a.color()),a.fontFamily()&&$.Of(b,"font-family",a.fontFamily()),a.fontStyle()&&$.Of(b,"font-style",a.fontStyle()),a.fontVariant()&&$.Of(b,"font-variant",a.fontVariant()),a.fontWeight()&&$.Of(b,"font-weight",a.fontWeight()),a.letterSpacing()&&$.Of(b,"letter-spacing",a.letterSpacing()),
a.mp()&&$.Of(b,"text-decoration",a.mp()),a.opacity()&&(c.filter="alpha(opacity="+100*a.opacity()+")"),a.ax()&&$.Of(b,"line-height",a.ax()),a.bx()&&$.Of(b,"text-indent",a.bx()),"..."==a.vm()&&$.Of(b,"text-overflow","ellipsis"),""==a.vm()&&$.Of(b,"text-overflow","clip"),a.bs()&&$.Of(b,"direction",a.bs()),$.Of(b,"word-break",a.fB()),$.Of(b,"word-wrap",a.gB()),null!=a.width()?$.Of(this.b,"white-space","normal"):$.Of(this.b,"white-space","nowrap"),a.Il()&&(b.style["text-align"]=a.B?"end"==a.Il()||"left"==
a.Il()?"left":a.Il()==$.qi||"right"==a.Il()?"right":"center":"end"==a.Il()||"right"==a.Il()?"right":a.Il()==$.qi||"left"==a.Il()?"left":"center"),$.ig(b,!a.cs()),b.innerHTML=a.Ja,this.Nb(c,"width",String(a.width()?IM(a.width()):a.sb().width)),this.Nb(c,"height",String(a.height()?IM(a.height()):a.sb().height)))};
$.g.jO=function(a){var b=a.ja(),c=a.parent().path();if(c){var d=$.kk();d.jd($.eh(c));a.o&&d.Hl(a.J,a.g);a=c?$.Yh(this,d,!0):"m "+JM(a.x)+","+JM(a.y)+" l "+(JM(a.x)+1)+","+JM(a.y)+" e";b.setAttribute("path",a)}};
$.g.kO=function(a){var b=a.parent(),c=b.style(),d=a.b,e=a.ja(),c=$.Rc(c);$.Tc(c,d);a=this.$w(a.text);c.fontStyle&&$.Of(a,"font-style",c.fontStyle);c.fontVariant&&$.Of(a,"font-variant",c.fontVariant);c.fontFamily&&$.Of(a,"font-family",c.fontFamily);c.fontSize&&$.Of(a,"font-size",c.fontSize);c.fontWeight&&$.Of(a,"font-weight",c.fontWeight);c.letterSpacing&&(a.style["v-text-spacing"]="normal"==c.letterSpacing?"":c.letterSpacing);c.decoration&&$.Of(a,"text-decoration",c.decoration);c.hAlign&&(a.style["v-text-align"]=
b.B?"end"==c.hAlign||"left"==c.hAlign?"left":c.hAlign==$.qi||"right"==c.hAlign?"right":"center":"end"==c.hAlign||"right"==c.hAlign?"right":c.hAlign==$.qi||"left"==c.hAlign?"left":"center");c.opacity&&(d=this.g("fill"),this.Nb(d,"opacity",c.opacity),e.appendChild(d));e.appendChild(a);b.cs()?e.removeAttribute("unselectable"):this.Nb(e,"unselectable","on");LM(this,e);e.setAttribute("filled","t");e.setAttribute("fillcolor",c.color);e.setAttribute("stroked","f");b.ja().appendChild(e)};$.g.YU=function(){return!0};
$.g.eR=function(a){var b=a.fill();$.J(b,$.sc)&&(b="black");var c=a.stroke(),d;$.B(c)?d=c:d="keys"in c?0!=c.keys.length?c.keys[0].color:"#000":c.color;var e=!$.B(b)&&"keys"in b&&"cx"in b&&"cy"in b,f=!$.B(b)&&"keys"in b&&!e,h=!e&&!f,k="none"!=b&&"none"!=b.color,l="none"!=d&&0!=c.thickness,m=h&&k&&1!=b.opacity,p=!$.B(c)&&l&&(1!=c.opacity||"miter"!=c.lineJoin||"butt"!=c.lineCap||"none"!=c.dash),q,r,t;if(e||f||m||p){var p=a.Ca(),m=p.j,u;u=$.J(a,$.fh)&&a.gg()?new $.I(0,0,1,1):a.sb();if(f){r=$.J(b.mode,
$.I);t=$.pb(b.keys,0);0!=t[0].offset&&t.unshift({offset:0,color:t[0].color,opacity:t[0].opacity});q=t[t.length-1];1!=q.offset&&t.push({offset:1,color:q.color,opacity:q.opacity});var v=b.mode?$.Sh(b.angle,u):b.angle;u=$.kj(m,r?rda(t,b.mode,v,u):t,b.opacity,v,b.mode)}else if(e){var w;b.mode?(w=b.mode,q=Math.min(w.width,w.height),v=(b.cx*w.width-(u.left-w.left))/u.width,t=(b.cy*w.height-(u.top-w.top))/u.height,w=q/u.width*1,u=q/u.height*1):(v=b.cx,t=b.cy,w=u=1);u=uda(m,b.keys,v,t,w,u,b.opacity,b.mode)}else u=
b;v=tda(m,u,c);if(!v.ek){w=this.g("shapetype");$.Xh(this,w,$.Ec($.Bc.uc(),v));$.gf(m.ja(),w);v.ek=!0;var x=null;if(f){var z=u;z.ek&&(z=new $.Fj(z.keys,z.opacity,z.angle,z.mode),v.F=z);x=this.g("fill");t=z.keys;var E=[];(0,$.Za)(t,function(a){E.push(a.offset+" "+a.color)},this);p=$.Jb(z.angle+270);q=t[t.length-1];h=t[0];$.Vh(this,x,{type:"gradient",method:"none",colors:E.join(","),angle:p,color:h.color,opacity:r?z.opacity:(0,window.isNaN)(q.opacity)?z.opacity:q.opacity,color2:q.color,"o:opacity2":r?
z.opacity:(0,window.isNaN)(h.opacity)?z.opacity:h.opacity});w.appendChild(x);z.Yw=m;z.ek=!0}else e?(r=u,r.ek&&(r=new CM(r.keys,r.Cd,r.Dd,r.YF,r.ZF,r.opacity,r.Jb),v.F=r),x=this.g("fill"),t=r.keys,h=t[t.length-1],q=t[0],$.Vh(this,x,{src:p.pathToRadialGradientImage,size:r.YF+","+r.ZF,origin:".5, .5",position:r.Cd+","+r.Dd,type:"pattern",method:"linear sigma",colors:"0 "+h.color+";1 "+q.color,color:h.color,opacity:(0,window.isNaN)(h.opacity)?r.opacity:h.opacity,color2:q.color,"o:opacity2":(0,window.isNaN)(q.opacity)?
r.opacity:q.opacity}),w.appendChild(x),r.Zw=m,r.ek=!0):h&&(x=v.at?v.at:v.at=this.g("fill"),$.B(b)?($.Vh(this,a.ja(),{fillcolor:b,filled:"none"!=b}),$.Vh(this,x,{type:"solid",on:"none"!=b,color:b,opacity:1})):($.Vh(this,a.ja(),{fillcolor:b.color,filled:"none"!=b.color}),$.Vh(this,x,{type:"solid",on:"none"!=b.color,color:b.color,opacity:(0,window.isNaN)(b.opacity)?1:b.opacity})));w.appendChild(x);r=v.IA?v.IA:v.IA=this.g("stroke");m=c.thickness?c.thickness:1;p=(h=sda(c.dash,m))?"flat":c.lineCap;$.Vh(this,
r,{joinstyle:c.lineJoin||"miter",endcap:"butt"==p?"flat":p,dashstyle:h,on:l,color:d,opacity:$.A(c)&&"opacity"in c?c.opacity:1,weight:m+"px"});w.appendChild(r)}if(e||f)h=u.keys[u.keys.length-1],$.Vh(this,a.ja(),{fillcolor:h.color,filled:"none"!=h.color});$.Vh(this,a.ja(),{filled:k,fillcolor:b.color||b,stroked:l,strokecolor:d,strokeweight:c.thickness?c.thickness+"px":"1px"});$.Vh(this,a.ja(),{type:"#"+$.Ec($.Bc.uc(),v)})}else $.Vh(this,a.ja(),{type:"",filled:k,fillcolor:b.color||b,stroked:l,strokecolor:d,
strokeweight:c.thickness?c.thickness+"px":"1px"})};$.g.lO=function(a){var b=a.ja().style;this.Nb(b,"visibility",a.visible()?"":"hidden")};$.g.bu=function(a){var b=a.Ig(),c=a.Me();if(c){var d;a.Ba?d=a.Ba:d=a.Ba=this.g("skew");a.Na||(a.ja().appendChild(d),a.Na=!0);$.Vh(this,d,{on:"true",origin:[-.5-b.left/b.width,-.5-b.top/b.height].join(),matrix:[zM(c.Zc),zM(c.he),zM(c.ce),zM(c.Vd),0,0].join()});$.Vh(this,a.ja().style,{left:IM(b.left+c.$c),top:IM(b.top+c.ad)})}else a.Na&&($.lf(a.Ba),a.Na=!1)};
$.g.uW=function(a){var b=a.ja(),c=a.In(),d=a.Jn(),e=a.tm(),f=a.zq();(a=a.Me())&&!$.cc(a)?(c=$.Yb(c,d,e,f,0,360,!1),d=c.length,a.transform(c,0,c,0,d/2),a=["m",JM(c[d-2]),JM(c[d-1]),"c"],$.id(Array.prototype.push,(0,$.Eb)(c,JM),a)):a=["ae",JM(c),JM(d),JM(e),JM(f),0,Math.round(-23592960)];a.push("x");this.Nb(b,"path",a.join(" "))};$.g.xW=function(a){var b=a.ja().style;(a=a.Me())&&this.Nb(b,"rotation",String($.gc(a)))};$.g.AW=function(a){var b=a.ja();(a=$.Yh(this,a,!0))?this.Nb(b,"path",a):b.removeAttribute("path")};
$.g.zW=$.ia;
$.g.FW=function(a){var b=a.Me();if(b){var c=a.j,d=a.ja().style,e,f;if(TM(a)){if(a.path()||(f=a.za,a.j.length&&(f-=a.j[0].j),e=a.K,$.Vh(this,d,{position:"absolute",overflow:"visible",left:IM(e+b.$c),top:IM(f+b.ad)})),UM(a))for(a=0,d=c.length;a<d;a++){var h=c[a],k;h.Ba?(k=h.Ba,$.Vh(this,k,{origin:[-.5-e,-.5-f].join(),matrix:[zM(b.Zc),zM(b.he),zM(b.ce),zM(b.Vd),0,0].join()})):k=h.Ba=this.g("skew");!h.Na&&h.ja()&&(h.ja().appendChild(k),h.Na=!0);var l=[-.5-e,-.5-f].join();h.ja()&&(h.ja().rotation=0);$.Vh(this,
k,{on:"true",origin:l,matrix:[zM(b.Zc),zM(b.he),zM(b.ce),zM(b.Vd),0,0].join()})}}else e=a.x(),f=a.y(),a.Jo()&&a.height()&&a.height()>a.o&&("middle"==a.Jo()&&(f+=a.height()/2-a.o/2),"bottom"==a.Jo()&&(f+=a.height()-a.o)),$.Vh(this,d,{position:"absolute",overflow:"hidden",left:IM(e+b.$c),top:IM(f+b.ad)})}};$.g.cA=function(){return!0};$.g.DW=$.ia;$.g.rS=$.ia;
$.g.zM=function(a){var b=$.J(a,$.gh),c=a.clip();if(c){var c=c.shape(),c=c.Vn(c.Pc),c=c.clone(),d=a.ja().style;if($.n(b)&&b)a=a.Me(),c=$.ec(c,a);else if(!$.J(a,SM)||TM(a))c.left-=a.$G()||0,c.top-=a.aH()||0;a=c.left;b=c.top;this.Nb(d,"clip",["rect(",b+"px",a+c.width+"px",b+c.height+"px",a+"px",")"].join(" "))}else c=a.ja().style,KM(c,"clip")};$.g.UL=function(){return!0};$.G(OM,$.nd);$.g=OM.prototype;$.g.at=null;$.g.IA=null;$.g.ek=!1;$.g.gj=function(){return"shape-type"};$.g.da=function(){delete this.F;delete this.B;$.lf(this.at);this.at=null;$.lf(this.IA);this.IA=null};$.G(QM,$.Jj);QM.prototype.clear=function(){$.Oc(this.g);$.Oc(this.B);QM.I.clear.call(this)};QM.prototype.TV=function(a){for(var b=$.Ij(a.keys,a.Cd,a.Dd,a.YF,a.ZF,a.opacity,a.Jb),c=$.Jc(this.g),d=0,e=c.length;d<e;d++){var f=c[d];f.F==a&&PM(f)}$.Lc(this.B,b)&&$.Pc(this.B,b)};QM.prototype.RV=function(a){for(var b=$.Gj(a.keys,a.opacity,a.angle,a.mode),c=$.Jc(this.g),d=0,e=c.length;d<e;d++){var f=c[d];f.F==a&&PM(f)}a=this.j;$.Lc(a,b)&&$.Pc(a,b)};
QM.prototype.da=function(){for(var a in this.g)$.K(this.g[a]);this.g=null;QM.I.da.call(this)};$.G(RM,$.Sj);RM.prototype.K=function(){return new QM(this)};RM.prototype.TR=function(a,b,c,d){return new BM(this,a,b,c,d)};$.F("acgraph.vml.Stage",RM);$.G(SM,$.ri);$.g=SM.prototype;$.g.vm=function(a){a&&(this.ba=!0);return SM.I.vm.call(this,a)};$.g.opacity=function(a){if(null!=a){if(a!==this.style().opacity){var b=!this.Ca()||this.Ca().Od();b||this.Ca().te();this.style().opacity=a;this.wb(1024);this.wb(32);this.wb(16384);this.wb(4);this.lq();b||this.Ca().me()}return this}return this.style().opacity};
$.g.color=function(a){if(null!=a){if(a!==this.style().color){var b=!this.Ca()||this.Ca().Od();b||this.Ca().te();this.style().color=a;this.wb(1024);this.wb(32);this.wb(16384);this.wb(4);this.lq();b||this.Ca().me()}return this}return this.style().color};$.g.lq=function(){if($.Jg().cA()){var a=this.Me();a&&!$.cc(a)&&(this.wb(4),this.Ua=null)}};$.g.Vn=function(a){this.ba=TM(this);return SM.I.Vn.call(this,a)};
$.g.Vb=function(){SM.I.Vb.call(this);if(UM(this)||this.vm()){$.Jg();var a=this.ja();GM&&this.ja()&&(a.innerHTML=a.innerHTML)}return this};$.g.pM=function(){$.Hg(this,64)};$.g.zF=function(){this.ba?SM.I.zF.call(this):($.Jg().HM(this),$.Hg(this,16384))};$.g.dk=function(){this.ba?SM.I.dk.call(this):$.Hg(this,32)};
$.g.ju=function(){if(this.ba)SM.I.ju.call(this);else{null!=this.bs()&&(this.B="rtl"==this.bs());var a=this.text();this.Sa||null==this.text()?this.Ja=a:this.Ja=$.Da(a);this.Jb=this.hj(this.Ja,{})}};
$.g.hj=function(a,b){if(this.ba)return SM.I.hj.call(this,a,b);var c=$.Jg(),d=this.style();c.Pj||c.Mn();c.b.style.cssText="";d.fontStyle&&$.Of(c.b,"font-style",d.fontStyle);d.fontVariant&&$.Of(c.b,"font-variant",d.fontVariant);d.fontFamily&&$.Of(c.b,"font-family",d.fontFamily);d.fontSize&&$.Of(c.b,"font-size",d.fontSize);d.fontWeight&&$.Of(c.b,"font-weight",d.fontWeight);d.letterSpacing&&$.Of(c.b,"letter-spacing",d.letterSpacing);d.decoration&&$.Of(c.b,"text-decoration",d.decoration);d.textIndent&&
$.Of(c.b,"text-indent",d.textIndent);$.Of(c.b,"word-break",d.wordBreak);$.Of(c.b,"word-wrap",d.wordWrap);null!=d.width||$.Of(c.b,"white-space","nowrap");d.width&&$.Of(c.b,"width",d.width);$.Of(c.Pj,{left:0,top:0,width:"1px",height:"1px"});$.Of(c.b,{border:"0 solid",position:"absolute",left:0,top:0});c.b.innerHTML=a;d=$.fg(c.b);c.b.innerHTML="";d.left=this.x();d.top=this.y();this.o=d.height;this.height()&&(d.height=this.height());return d};
$.g.cp=function(){var a=this.Me();!a||this.fe(256)||this.fe(4)||(this.Ua=a.clone())};$.g.wr=function(){SM.I.wr.call(this);VM(this)};$.g.nm=function(){SM.I.nm.call(this);VM(this);if(GM&&UM(this)){var a=!this.Ca()||this.Ca().Od();a||this.Ca().te();this.ma=!1;this.wb(1024);this.wb(32);this.wb(16384);this.wb(4);this.lq();a||this.Ca().me()}};$.g.da=function(){delete this.Ua;SM.I.da.call(this)};var WM=SM.prototype;WM.color=WM.color;WM.opacity=WM.opacity;WM.textOverflow=WM.vm;$.F("acgraph.vml.Text",SM);$.F("acgraph.vml.getRenderer",function(){return HM.uc()});}).call(this,$)}