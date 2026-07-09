import { useState } from "react";
import toast from "react-hot-toast";
import { Bell, Mic, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import Card from "../components/Card";
import Button from "../components/Button";

function ToggleRow({ icon: Icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-sm font-medium text-ink-900">{label}</p>
          <p className="text-sm text-ink-500">{description}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary-600" : "bg-ink-900/15"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [voiceByDefault, setVoiceByDefault] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-ink-500">
        These preferences are stored on this device only — the backend doesn't have a settings
        table or endpoint yet, so nothing here syncs across devices.
      </p>

      <Card className="mt-8 divide-y divide-ink-900/5">
        <ToggleRow
          icon={Bell}
          label="Email reminders"
          description="Get reminded to keep up your interview practice."
          checked={notifications}
          onChange={(val) => {
            setNotifications(val);
            toast.success(val ? "Reminders on" : "Reminders off");
          }}
        />
        <ToggleRow
          icon={Mic}
          label="Prefer voice answers"
          description="Default to voice recording instead of typing in interviews."
          checked={voiceByDefault}
          onChange={(val) => {
            setVoiceByDefault(val);
            toast.success(val ? "Voice answers preferred" : "Text answers preferred");
          }}
        />
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-ink-900">Account</h2>
        <Button variant="danger" icon={LogOut} className="mt-4" onClick={handleLogout}>
          Log out
        </Button>
      </Card>
    </div>
  );
}
