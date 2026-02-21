import  { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";

type Initial = {
  fullName?: string;
  age?: string | number;
  phone?: string;
  gender?: string;
  [k: string]: any;
};

type Props = {
  open: boolean;
  initial?: Initial | null;
  onCancel: () => void;
  onCreateAndSave: (payload: {
    fullName?: string;
    age?: number | string;
    phone?: string;
    gender?: string;
    [k: string]: any;
  }) => void;
  loading?: boolean;
  title?: string;
  description?: string;
};

export default function NoPatientFoundDialog({
  open,
  initial = null,
  onCancel,
  onCreateAndSave,
  loading = false,
  title = "No patient found",
  description = "No existing patient matched the extracted details. Edit these details to create a new patient and attach the note.",
}: Props) {
  const [fullName, setFullName] = useState<string>(initial?.fullName ?? "");
  const [age, setAge] = useState<string | number>(initial?.age ?? "");
  const [phone, setPhone] = useState<string>(initial?.phone ?? "");
  const [gender, setGender] = useState<string>(initial?.gender ?? "");
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  useEffect(() => {
    if (open) {
      setFullName(initial?.fullName ?? "");
      setAge(initial?.age ?? "");
      setPhone(initial?.phone ?? "");
      setGender(initial?.gender ?? "");
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const e: typeof errors = {};
    if (!fullName?.trim()) e.fullName = "Full name is required";
    if (phone && phone.replace(/\D/g, "").length < 8) e.phone = "Enter a valid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;

    const normalizedPhone = phone ? String(phone).replace(/\D/g, "") : undefined;
    const normalizedAge =
      age === "" ? undefined : isNaN(Number(age)) ? age : Number(age);

    onCreateAndSave({
      fullName: fullName.trim(),
      age: normalizedAge,
      phone: normalizedPhone,
      gender: gender?.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <Box>
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="h6" className="font-semibold">
            {title}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 2 }}>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <TextField
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              size="small"
              error={!!errors.fullName}
              helperText={errors.fullName}
              slotProps={{ inputLabel: { shrink: true } }}

            />

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Age"
                value={String(age ?? "")}
                onChange={(e) => setAge(e.target.value)}
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}

              />

              <TextField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                size="small"
                placeholder="digits only"
                error={!!errors.phone}
                helperText={errors.phone}
                slotProps={{ inputLabel: { shrink: true } }}

              />
            </Box>

            <TextField
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}

            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
            disabled={loading}
            sx={{ minWidth: 170 }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Create new & Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
