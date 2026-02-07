import AboutContent from "@/components/AboutContent";

export default function AboutPage() {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <h1 className="text-3xl font-semibold">About Lumi Noir</h1>
      <AboutContent />
    </div>
  );
}
