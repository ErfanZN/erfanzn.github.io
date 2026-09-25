(() => {
  const t = window.portfolioTranslate || ((text, values = {}) => text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? ''));
  const languageLink = document.querySelector('.language-switch');
  const syncLanguageLink = () => {
    if (!languageLink) return;
    const destination = new URL(document.documentElement.lang === 'fa' ? '/' : '/fa/', location.origin);
    destination.hash = location.hash;
    if (new URLSearchParams(location.search).get('review') === '1') destination.searchParams.set('review', '1');
    languageLink.href = destination.href;
  };
  syncLanguageLink();
  window.addEventListener('hashchange', syncLanguageLink);
  if (new URLSearchParams(location.search).get('review') === '1') {
    const review = document.createElement('script'); review.src = '/review.js'; document.head.append(review);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  hero?.addEventListener('pointermove', e => {
    if (reduced.matches || e.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--photo-x', `${Math.round((e.clientX / r.width - .5) * 12)}px`);
    hero.style.setProperty('--photo-y', `${Math.round(((e.clientY-r.top) / r.height - .5) * 8)}px`);
  });
  hero?.addEventListener('pointerleave', () => {hero.style.setProperty('--photo-x','0px');hero.style.setProperty('--photo-y','0px');});
  const knotPrompts = ['Find clarity', 'Find the signal', 'Connect the dots', 'Make room for clarity', 'Untangle the next step'];
  let knotRound = 0;
  document.querySelector('#simplify')?.addEventListener('click', e => {
    const button=e.currentTarget, clear=button.getAttribute('aria-pressed')!=='true';
    button.setAttribute('aria-pressed',String(clear));
    document.querySelector('.signal-playground').classList.toggle('is-clear',clear);
    document.querySelector('#signal-state').textContent=clear?t('A clear path forward'):t('Untangle the problem');
    if (!clear) knotRound = (knotRound + 1) % knotPrompts.length;
    button.innerHTML=clear?t('Explore again')+' <span aria-hidden="true">↺</span>':t(knotPrompts[knotRound])+' <span aria-hidden="true">↗</span>';
    document.querySelector('#signal').setAttribute('aria-label',clear?t('A clear path connects Problem, Decision, and Impact.'):t('A tangle of lines that can be simplified into a clear path.'));
  });
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('reveal');observer.unobserve(entry.target);}
    }),{threshold:.12});
    document.querySelectorAll('.section-heading,.case-card,.origin-story').forEach(el=>observer.observe(el));
  }
  const form=document.querySelector('#contact-form'); if(!form)return;
  const fields=['name','email','message']; const status=document.querySelector('#form-status');
  const send=form.querySelector('[type="submit"]'); let sending=false, dirty=false;
  const setError=(name,text)=>{const field=form.elements[name];field.setAttribute('aria-invalid',String(!!text));document.querySelector(`#${name}-error`).textContent=text;};
  form.addEventListener('input',e=>{
    dirty=true;
    if(fields.includes(e.target.name))setError(e.target.name,'');
    if(e.target.tagName==='TEXTAREA'){e.target.style.height='auto';e.target.style.height=`${Math.min(e.target.scrollHeight,400)}px`;}
  });
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  form.addEventListener('submit',async e=>{
    e.preventDefault(); if(sending || form.elements._honey.value)return;
    let first;
    fields.forEach(name=>{
      const field=form.elements[name],value=field.value.trim();
      let error=!value?({name:t('Please enter your name.'),email:t('Please enter your email address.'),message:t('Please add a message.')}[name]):'';
      if(name==='email'&&value&&!field.validity.valid)error=t('Enter a valid email address, like you@company.com.');
      if(value.length>field.maxLength)error=t('Please use {limit} characters or fewer.', {limit:field.maxLength});
      setError(name,error);if(error&&!first)first=field;
    });
    if(first){first.focus();return;}
    if(!navigator.onLine){status.className='form-status error';status.textContent=t('You’re offline. Reconnect and send again. Your message is still here.');return;}
    sending=true;send.disabled=true;form.setAttribute('aria-busy','true');send.querySelector('.send-label').textContent=t('Sending…');status.className='form-status';status.textContent=t('Sending your message…');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch('https://formsubmit.co/ajax/erfanzn777@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),message:form.elements.message.value.trim(),_subject:'New message from Erfan’s portfolio',_template:'table',_url:location.origin+location.pathname}),signal:controller.signal});
      const data=await response.json();
      if(!response.ok||!(data.success===true||data.success==='true'))throw new Error('service');
      if(/activat|confirm.*email|verify/i.test(data.message||'')){
        status.className='form-status error';status.textContent=t('Email delivery is awaiting activation. Please use the email link to contact Erfan directly. Your message is still here.');
      }else{
        dirty=false;form.reset();form.elements.message.style.height='';status.textContent=t('Message submitted. Thank you for reaching out.');
        const dialog=document.querySelector('#sent-dialog');dialog.showModal();
      }
    }catch(error){status.className='form-status error';status.textContent=error.name==='AbortError'?t('Delivery could not be confirmed. Your message is still here. Try again, or use the email link.'):t('Your message could not be sent. Please try again or use the email link. Your message is still here.');}
    finally{clearTimeout(timer);sending=false;send.disabled=false;form.removeAttribute('aria-busy');send.querySelector('.send-label').textContent=t('Send message');}
  });
  const dialog=document.querySelector('#sent-dialog');
  document.querySelector('#close-sent').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>send.focus());
})();
