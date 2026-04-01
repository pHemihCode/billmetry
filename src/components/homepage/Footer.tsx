export default function Footer (){
  return (
    <footer className="py-10 px-6"
      style={{ background: "#05080F", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="mono text-sm font-semibold text-blue-400 tracking-widest uppercase">
          BillMetry
        </span>
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