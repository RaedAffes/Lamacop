export default function Footer() {
  return (
    <footer className="mt-16 border-t border-blue-100 bg-white">
      <div className="section-container flex flex-col items-center justify-between gap-3 py-8 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} LaMaCoP - Laboratory of Ceramic and Polymer Composites</p>
        <p className="text-primary">Scientific excellence in advanced materials</p>
      </div>
    </footer>
  );
}
