'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import { DATA } from '@/data';
import { gsap } from '@/lib/motion';
import { useReveal } from '@/hooks/useReveal';
import Heading from './Heading';
import Ext from './Ext';

type FormState = { name: string; email: string; message: string };

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const btn = useRef<HTMLAnchorElement>(null);
  useReveal(ref);

  const [f, setF] = useState<FormState>({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const ok = {
    name: f.name.trim().length > 0,
    email: /\S+@\S+\.\S+/.test(f.email),
    message: f.message.trim().length > 4
  };
  const valid = ok.name && ok.email && ok.message;

  /* No backend: the button opens the visitor's mail app with everything filled in. */
  const href =
    'mailto:' + DATA.email +
    '?subject=' + encodeURIComponent('Hello from ' + f.name) +
    '&body=' + encodeURIComponent(f.message + '\n\n' + f.name + ' (' + f.email + ')');

  const set = (k: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));
  const cls = (k: keyof FormState) => 'field' + (touched && !ok[k] ? ' bad' : '');

  const send = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!valid) {
      e.preventDefault();
      setTouched(true);
      gsap.fromTo(btn.current, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,0.3)' });
      return;
    }
    setSent(true);
    gsap.fromTo(btn.current, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' });
  };

  const copy = () => {
    navigator.clipboard?.writeText(DATA.email).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => { /* clipboard unavailable */ }
    );
  };

  return (
    <section id="contact" ref={ref} className="relative min-h-[100svh] px-6 md:px-16 pt-28 pb-24 flex items-center">
      <div className="w-full max-w-7xl mx-auto">
        <div className="md:w-[52%]">
          <Heading title="Let’s work together" blurb="Have a project, an opportunity or a question? Send me a message." />
          <div data-reveal="" className="glass rounded-3xl p-6 md:p-9">
            <div className="space-y-4">
              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-sm text-slate-300">Your name</label>
                <input id="c-name" className={cls('name')} value={f.name} onChange={set('name')} placeholder="Ada Lovelace" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="c-email" className="mb-1.5 block text-sm text-slate-300">Your email</label>
                <input id="c-email" className={cls('email')} value={f.email} onChange={set('email')} placeholder="ada@example.com" autoComplete="email" inputMode="email" />
              </div>
              <div>
                <label htmlFor="c-msg" className="mb-1.5 block text-sm text-slate-300">Message</label>
                <textarea id="c-msg" rows={5} className={cls('message')} value={f.message} onChange={set('message')} placeholder="Tell me what you’re building."></textarea>
              </div>
            </div>

            {touched && !valid && (
              <p className="mt-4 text-sm text-red-300" role="alert">Add your name, a valid email and a short message to continue.</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a ref={btn} href={valid ? href : '#contact'} onClick={send} className="btn btn-primary">Send message</a>
              <button type="button" onClick={copy} className="btn btn-ghost">{copied ? 'Email copied' : 'Copy my email'}</button>
            </div>

            {sent && (
              <p className="mt-4 text-sm text-slate-300" role="status">
                Your email app should open with the message ready to send. If it doesn’t, write to {DATA.email}.
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm">
              <span className="text-slate-400">Find me on</span>
              {DATA.socials.map((s) => (
                <Ext key={s.label} href={s.href} className="text-slate-100 underline underline-offset-4 decoration-1 decoration-white/30 hover:decoration-white">{s.label}</Ext>
              ))}
            </div>
          </div>
        </div>
      </div>
      <footer className="absolute inset-x-0 bottom-6 px-6 text-center text-xs text-slate-500">
        © 2026 {DATA.name}. Built with Next.js, Three.js, GSAP and Tailwind CSS.
      </footer>
    </section>
  );
}
