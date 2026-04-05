import { LogoIcon } from "../ui/logo";

export default function Footer (){
  return (
    <footer className="py-10 px-6"
      style={{ background: "#05080F", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
         <div
        className="px-5 py-5 shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <LogoIcon size={28} />
          <span
            className="text-sm font-bold text-white tracking-tight"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Bill<span style={{ color: '#60A5FA', fontWeight: 400 }}>Metry</span>
          </span>
        </div>
      </div>
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Billmetry. Built for African freelancers.
        </p>
        <div className="flex gap-6 text-xs text-slate-600">
          <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
          <a href="mailto:hello@invoiceflow.ng" className="hover:text-slate-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}