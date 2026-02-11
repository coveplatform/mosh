import Link from "next/link";
import { MoshLogo } from "@/components/logo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/">
            <MoshLogo size="md" />
          </Link>
          <Link href="/" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Back to home
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-10">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="space-y-8 text-sm text-[var(--muted-foreground)] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">1. Acceptance of Terms</h2>
            <p>By using Mosh, you agree to these terms. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">2. Service Description</h2>
            <p>Mosh is an AI-powered service that makes phone calls on your behalf in multiple languages. We act as an intermediary and make best efforts to complete your requested tasks accurately.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating tasks. You agree not to use the service for illegal, fraudulent, or harmful purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">4. Credits & Billing</h2>
            <p>Tasks consume credits based on your plan. Unused credits may roll over depending on your plan tier. Paid subscriptions are billed monthly and can be cancelled at any time. Refunds are handled on a case-by-case basis.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">5. Limitations</h2>
            <p>Mosh makes best efforts but cannot guarantee specific outcomes from phone calls. Call success depends on the availability and cooperation of the receiving party. We are not liable for outcomes of calls made on your behalf.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">6. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through your dashboard settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">7. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:hello@mosh.app" className="text-[var(--accent)] hover:underline">hello@mosh.app</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
