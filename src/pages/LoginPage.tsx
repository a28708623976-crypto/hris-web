import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Mail, ShieldCheck } from "lucide-react";
import { AppleActionButton } from "../components/ui/AppleActionButton";
import { api, errorMessage } from "../api/client";
import { loadSession } from "../api/session";
import { isInternalPath } from "../utils/navigation";
import { useAuthStore } from "../store/auth";
export function LoginPage() {
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [stage, setStage] = useState<"email" | "code">("email"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const status = useAuthStore((state) => state.status);
  const location = useLocation(),
    navigate = useNavigate();
  if (status === "authenticated") return <Navigate to="/dashboard" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (stage === "email") {
        await api("/auth/request-code", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        setStage("code");
      } else {
        await api("/auth/verify", {
          method: "POST",
          body: JSON.stringify({ email, code }),
        });
        await loadSession();
        const next = location.state?.next;
        navigate(
          isInternalPath(next) && next !== "/login" ? next : "/dashboard",
          { replace: true },
        );
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_24px_60px_rgba(0,0,0,0.08)] max-w-md w-full p-8 space-y-6">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            PEOPLEOS · WORKSPACE
          </div>
          <h1 className="text-[28px] font-bold tracking-tight mt-2">
            登录 PeopleOS
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-2">
            使用已开通账号的邮箱验证码登录，无需密码。
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-[#6E6E73] mb-1.5"
            >
              工作邮箱
            </label>
            <input
              id="login-email"
              autoComplete="email"
              type="email"
              required
              value={email}
              disabled={busy || stage === "code"}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-[#F5F5F7] text-sm outline-none focus:ring-2 focus:ring-[#0071E3]/20"
            />
          </div>
          {stage === "code" && (
            <div>
              <p className="text-xs text-[#86868B] mb-4">
                如该邮箱已开通账号，验证码将发送至邮箱。验证码 10 分钟内有效。
              </p>
              <label
                htmlFor="login-code"
                className="block text-xs font-medium text-[#6E6E73] mb-1.5"
              >
                6 位验证码
              </label>
              <input
                id="login-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3.5 py-3 rounded-xl bg-[#F5F5F7] text-base tracking-widest font-mono outline-none focus:ring-2 focus:ring-[#0071E3]/20"
              />
            </div>
          )}
          {error && (
            <p role="alert" className="text-xs text-[#D70015] leading-relaxed">
              {error}
            </p>
          )}
          <AppleActionButton
            type="submit"
            variant="primary"
            icon={stage === "email" ? Mail : ShieldCheck}
            disabled={busy}
          >
            {busy ? "请稍候…" : stage === "email" ? "获取验证码" : "验证并登录"}
          </AppleActionButton>
          {stage === "code" && (
            <button
              type="button"
              disabled={busy}
              className="text-xs text-[#0071E3] ml-4"
              onClick={() => {
                setStage("email");
                setCode("");
                setError("");
              }}
            >
              重新获取 / 更换邮箱
            </button>
          )}
        </form>
        <p className="text-[11px] text-[#86868B]">请勿向他人透露验证码。</p>
      </div>
    </div>
  );
}
