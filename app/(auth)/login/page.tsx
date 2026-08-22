import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#0D0D10] px-4">
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl font-semibold tracking-tight text-[#F5F5F7]">LOOP</span>
        <span className="text-sm text-[#98989F]">Stay in the Loop.</span>
      </div>
      <LoginForm />
    </div>
  );
}
