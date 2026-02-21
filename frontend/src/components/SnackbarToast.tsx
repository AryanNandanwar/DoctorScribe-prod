import { Snackbar, Alert } from "@mui/material";
import type { AlertColor } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertColor;
  autoHideDuration?: number;
  anchorOrigin?: { vertical: "top" | "bottom"; horizontal: "left" | "center" | "right" };
};

export default function SnackbarToast({
  open,
  onClose,
  message,
  severity = "success",
  autoHideDuration = 3000,
  anchorOrigin = { vertical: "bottom", horizontal: "center" },
}: Props) {
  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose} anchorOrigin={anchorOrigin}>
      <Alert elevation={6} variant="filled" onClose={onClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
}
