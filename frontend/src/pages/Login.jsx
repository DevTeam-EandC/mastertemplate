import { useState } from "react";
import { ArrowRight, Building2, Sparkles } from "lucide-react";
import Brand from "../components/layout/Brand";
import { Field, Input } from "../components/ui/FormFields";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("sales@elevate.com");
  const [password, setPassword] = useState("password");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return setError("Enter your email and password to continue.");
    onLogin(email);
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-brand-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-24 h-[470px] w-[470px] rounded-full border border-white/10" />
        <div className="absolute -right-10 top-24 h-[300px] w-[300px] rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-20 h-[430px] w-[430px] rounded-full bg-brand-blue/40 blur-3xl" />
        <Brand />
        <div className="relative max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-blue-100"><Sparkles size={13} /> A clearer view of every opportunity</div>
          <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight">Build better<br /><span className="text-brand-steel">client journeys.</span></h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-blue-100/65">One organized workspace for client details, elevator project requirements, and your sales pipeline.</p>
          <div className="mt-12 grid max-w-md grid-cols-3 gap-5 border-t border-white/10 pt-6">
            <div><div className="text-2xl font-semibold">360°</div><div className="mt-1 text-xs text-blue-100/50">Client visibility</div></div>
            <div><div className="text-2xl font-semibold">4-step</div><div className="mt-1 text-xs text-blue-100/50">Project intake</div></div>
            <div><div className="text-2xl font-semibold">One</div><div className="mt-1 text-xs text-blue-100/50">Sales workspace</div></div>
          </div>
        </div>
        <div className="relative text-xs text-blue-100/40">© 2026 Powered by: E&C</div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[410px]">
          <div className="mb-10 lg:hidden">
            <div className="inline-flex rounded-xl bg-brand-ink p-3"><Building2 className="text-white" /></div>
            <div className="mt-3 text-lg font-bold text-brand-ink">ELEVATE.</div>
          </div>
          <div className="mb-8">
            <div className="text-xs font-bold uppercase tracking-[.18em] text-brand-blue">Welcome back</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink">Sign in to your account</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your credentials to access your workspace.</p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <Field label="Work email" required>
              <Input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-16" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-blue">{show ? "Hide" : "Show"}</button>
              </div>
            </Field>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" defaultChecked className="rounded border-slate-300 accent-brand-blue" /> Remember me</label>
              <button type="button" className="font-semibold text-brand-blue">Forgot password?</button>
            </div>
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:bg-brand-navy">Sign in <ArrowRight size={16} /></button>
          </form>
          <p className="mt-10 text-center text-[11px] text-slate-400">Secure workspace · Internal use only</p>
        </div>
      </section>
    </div>
  );
}
