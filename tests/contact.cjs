const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
const faCode=fs.readFileSync(path.join(__dirname,'../dist/fa-i18n.js'),'utf8');
let locale='en';
function env(reply,{online=true,reject=false}={}){
 const all={},events={};
 function el(id){return all[id]??= {id,value:'',maxLength:5000,validity:{valid:true},style:{},attributes:{},listeners:{},textContent:'',classList:{toggle(){}},addEventListener(k,fn){this.listeners[k]=fn},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},removeAttribute(k){delete this.attributes[k]},focus(){all.focus=id},querySelector(s){return el(id+s)},showModal(){this.open=true},close(){this.open=false}};}
 const form=el('form');form.elements={name:el('name'),email:el('email'),message:el('message'),_honey:el('honey')}; form.reset=()=>Object.values(form.elements).forEach(e=>e.value='');
 Object.assign(form.elements.name,{value:'Test Person'});form.elements.email.value='test@example.com';form.elements.message.value='Test message';
 const map={'#contact-form':form,'#form-status':el('status'),'#sent-dialog':el('dialog'),'#close-sent':el('close')};
 const ctx={URLSearchParams,location:{search:'',origin:'https://example.com',pathname:'/'},document:{querySelector:s=>map[s]||(s.endsWith('-error')?el(s):null)},matchMedia:()=>({matches:true,addEventListener(){}}),window:{addEventListener:(k,f)=>events[k]=f},navigator:{onLine:online},AbortController,setTimeout,clearTimeout,fetch:async()=>{ctx.calls++;if(reject)throw new Error('offline');return {ok:true,json:async()=>reply}},calls:0};
 if(locale==='fa')vm.runInNewContext(faCode,ctx);
 vm.runInNewContext(code,ctx);return {all,ctx,form,events,submit:()=>form.listeners.submit({preventDefault(){}})};
}
(async()=>{
 for(locale of ['en','fa']){
 let e=env({success:'true',message:'The form was submitted successfully.'});await e.submit();assert.equal(e.all.dialog.open,true);assert.equal(e.form.elements.message.value,'');assert.equal(e.all['form[type="submit"]'].disabled,false);
 e=env({success:'true',message:'Please activate your form by confirming your email.'});await e.submit();assert.notEqual(e.all.dialog.open,true);assert.equal(e.form.elements.message.value,'Test message');assert.match(e.all.status.textContent,locale==='fa'?/هنوز فعال نشده/:/awaiting activation/);
 e=env({success:false});await e.submit();assert.notEqual(e.all.dialog.open,true);assert.equal(e.form.elements.message.value,'Test message');assert.match(e.all.status.textContent,locale==='fa'?/پیام ارسال نشد/:/could not be sent/);
 e=env(null,{reject:true});await e.submit();assert.match(e.all.status.textContent,locale==='fa'?/پیام ارسال نشد/:/could not be sent/);assert.equal(e.all['form[type="submit"]'].disabled,false);
 e=env(null,{online:false});await e.submit();assert.equal(e.ctx.calls,0);assert.match(e.all.status.textContent,locale==='fa'?/اتصال اینترنت قطع/:/offline/);
 e=env({success:true});e.form.elements.name.value='';await e.submit();assert.equal(e.ctx.calls,0);assert.equal(e.all.focus,'name');assert.equal(e.form.elements.name.attributes['aria-invalid'],'true');
 e=env({success:true});e.form.elements.email.validity.valid=false;await e.submit();assert.equal(e.ctx.calls,0);assert.equal(e.all.focus,'email');
 e=env({success:true});let resolve;e.ctx.fetch=()=>{e.ctx.calls++;return new Promise(r=>resolve=r)};const pending=e.submit();await e.submit();assert.equal(e.ctx.calls,1);assert.equal(e.all['form[type="submit"]'].disabled,true);resolve({ok:true,json:async()=>({success:true})});await pending;
 console.log(`PASS: ${locale} contact messages.`);
 }
 console.log('PASS: 16 isolated contact-flow checks (mock responses, no network): accepted, activation, rejection, network failure, offline, missing field, invalid email, duplicate-submit prevention.');
})().catch(e=>{console.error(e);process.exitCode=1});
