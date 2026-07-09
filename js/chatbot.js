/* ==========================================================================
   SAFVEX — Floating chatbot (rule-based, no backend required)
   Greets, briefly explains services, asks a qualifying question, then
   suggests a service and offers to continue on WhatsApp or by email.
   ========================================================================== */
(function () {
  const fab = document.querySelector('.fab-bot');
  const panel = document.querySelector('.chatbot-panel');
  if (!fab || !panel) return;

  const body = panel.querySelector('.chatbot-body');
  const optionsWrap = panel.querySelector('.chatbot-options');

  const SERVICES = {
    'AI Automation': 'ai-automation.html',
    'Website Development': 'website-development.html',
    'WhatsApp Automation': 'whatsapp-automation.html',
    'SEO': 'seo.html',
    'Google & Meta Ads': 'google-meta-ads.html',
    'Google Business Profile': 'google-business-profile.html',
    'Lead Generation': 'lead-generation.html',
    'Social Media Management': 'social-media-management.html',
  };

  function addMsg(text, from = 'bot') {
    const div = document.createElement('div');
    div.className = `chat-msg chat-${from}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function setOptions(options) {
    optionsWrap.innerHTML = '';
    options.forEach((opt) => {
      const b = document.createElement('button');
      b.className = 'chat-opt';
      b.textContent = opt.label;
      b.addEventListener('click', () => {
        addMsg(opt.label, 'user');
        optionsWrap.innerHTML = '';
        opt.action();
      });
      optionsWrap.appendChild(b);
    });
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    addMsg('Hi, I\u2019m the SAFVEX assistant. We help businesses grow through AI automation, high-performance websites, SEO, WhatsApp automation, ads, and lead generation.');
    setTimeout(() => {
      addMsg('What are you mainly trying to solve right now?');
      setOptions([
        { label: 'Get more customers', action: () => suggest(['Lead Generation', 'Google & Meta Ads', 'SEO']) },
        { label: 'Save time on repetitive work', action: () => suggest(['AI Automation', 'WhatsApp Automation']) },
        { label: 'I need a new website', action: () => suggest(['Website Development']) },
        { label: 'Not sure yet', action: () => suggest(['AI Automation', 'Website Development', 'Lead Generation']) },
      ]);
    }, 500);
  }

  function suggest(list) {
    const text = list.length > 1
      ? `Based on that, a good starting point would be ${list.slice(0, -1).join(', ')} or ${list[list.length - 1]}.`
      : `Based on that, ${list[0]} looks like the right fit.`;
    addMsg(text);
    setTimeout(() => {
      addMsg('Want to take the next step?');
      setOptions([
        { label: 'Continue on WhatsApp', action: () => {
            window.open(window.buildWhatsAppLink ? window.buildWhatsAppLink({ need: list.join(', ') }) : 'https://wa.me/917776900037', '_blank', 'noopener');
            addMsg('Opening WhatsApp \u2014 talk soon!');
          } },
        { label: 'Email SAFVEX', action: () => {
            window.location.href = `mailto:safvexsolutions@gmail.com?subject=Project Enquiry&body=Hi SAFVEX, I'm interested in ${encodeURIComponent(list.join(', '))}.`;
            addMsg('Your email app should be opening now.');
          } },
        { label: 'See the service page', action: () => {
            const href = SERVICES[list[0]] || 'services.html';
            addMsg('Here you go:');
            const link = document.createElement('a');
            link.href = href; link.textContent = `Open ${list[0]} \u2192`; link.className = 'chat-link';
            body.appendChild(link);
          } },
      ]);
    }, 500);
  }

  fab.addEventListener('click', () => {
    const willOpen = !panel.classList.contains('is-open');
    panel.classList.toggle('is-open');
    if (willOpen) start();
  });
  panel.querySelector('.chatbot-close')?.addEventListener('click', () => panel.classList.remove('is-open'));
})();
