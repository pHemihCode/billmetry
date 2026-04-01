import Link from "next/link";

function Nav() {
 return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#060A16]">
      <span className="mono text-sm font-semibold tracking-widest text-blue-400 uppercase">
        BillMetry
      </span>
      <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
        <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How it works</a>
        <a href="#features"     className="hover:text-white transition-colors duration-200">Features</a>
        <a href="#pricing"      className="hover:text-white transition-colors duration-200">Pricing</a>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
          Log in
        </Link>
        <Link href="/signup" className="shimmer-btn text-sm font-bold text-white px-5 py-2.5 rounded-full">
          Start free
        </Link>
      </div>
    </nav>
  );
}
export default Nav