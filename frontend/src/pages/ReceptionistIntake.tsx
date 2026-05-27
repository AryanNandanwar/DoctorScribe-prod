import { type FormEvent, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import ResponsiveAppBar from "../components/navbar";
import api from "../lib/api";
import { clearAuth } from "../lib/auth";
import { useRequireAuth } from "../hooks/use-require-auth";

const emptyForm = {
  fullName: "",
  gender: "",
  age: "",
  weight: "",
  phone: "",
};

export default function ReceptionistIntakePage() {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { authorized } = useRequireAuth({
    requiredRole: "receptionist",
    wrongRoleRedirect: "/",
  });

  const updateField = (key: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!form.fullName.trim()) {
      setError("Patient name is required.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/intake/patients", {
        fullName: form.fullName.trim(),
        gender: form.gender || undefined,
        age: form.age.trim() || undefined,
        weight: form.weight.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      setMessage("Patient added to the doctor's queue.");
      setForm(emptyForm);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }

      setError(err?.response?.data?.message || "Failed to save patient intake.");
    } finally {
      setSaving(false);
    }
  };

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ResponsiveAppBar />

      <main className="pt-24 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <Typography variant="h5" className="font-semibold text-slate-800 mb-4">
            Patient Intake
          </Typography>

          <Card className="shadow-sm border">
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <TextField
                  label="Name"
                  fullWidth
                  required
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                />

                <TextField
                  label="Gender"
                  select
                  fullWidth
                  value={form.gender}
                  onChange={(event) => updateField("gender", event.target.value)}
                >
                  <MenuItem value="">Not specified</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Age"
                    value={form.age}
                    onChange={(event) => updateField("age", event.target.value)}
                  />
                  <TextField
                    label="Weight"
                    value={form.weight}
                    onChange={(event) => updateField("weight", event.target.value)}
                    placeholder="e.g. 72 kg"
                  />
                  <TextField
                    label="Contact"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </div>

                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={saving}
                    sx={{ textTransform: "none" }}
                  >
                    Save
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
