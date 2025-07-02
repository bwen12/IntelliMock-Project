import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Props for the DeleteSessionDialog component.
 * 
 * @property {boolean} open - Whether the dialog is visible.
 * @property {() => void} onConfirm - Callback to execute when the user confirms deletion.
 * @property {() => void} onCancel - Callback to execute when the dialog is dismissed or canceled.
 * @property {string} [interviewTitle] - The name of the interview to be displayed in the confirmation message.
 */
interface DeleteSessionDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  interviewTitle?: string;
  isLoading?: boolean;
}

/**
 * DeleteSessionDialog is a modal dialog that prompts the user to confirm deletion of an interview session.
 * 
 * Features:
 * - Blurred dark backdrop for modern contrast
 * - Rounded dialog with deep shadow for elevation
 * - Cancel and Delete buttons with themed styling
 * 
 * Accessibility:
 * - Provides clear, actionable text and fallback for undefined titles
 * 
 * @param {DeleteSessionDialogProps} props - Component props.
 * @returns {JSX.Element} The rendered dialog component.
 */
export const DeleteSessionDialog = ({
  open,
  onConfirm,
  onCancel,
  interviewTitle,
  isLoading,
}: DeleteSessionDialogProps) => {

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(6px)",
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          backgroundColor: "#121212",
          color: "#ffffff",
          px: 4,
          py: 3,
          maxWidth: 420,
          boxShadow: "0 30px 80px rgba(0, 0, 0, 1)",
        },
      }}
    >
      {/* Dialog title */}
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
        Delete Interview
      </DialogTitle>

      {/* Dialog body content */}
      <DialogContent sx={{ pt: 1 }}>
        <Typography sx={{ mb: 1 }}>
          Are you sure you want to permanently delete{" "}
          <strong>{interviewTitle || "this interview session"}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: "#cccccc" }}>
          This action cannot be undone. All associated data (answers, score, summary) will be lost.
        </Typography>
      </DialogContent>

      {/* Action buttons */}
      <DialogActions sx={{ justifyContent: "flex-end", pt: 2 }}>
        {/* Cancel Button */}
        <Button
          onClick={onCancel}
          variant="text"
          sx={{
            color: "#ffffff",
            backgroundColor: "transparent",
            fontWeight: 500,
            ":hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          Cancel
        </Button>

        {/* Confirm Delete Button */}
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={isLoading}
          sx={{
            backgroundColor: "#8b5cf6",
            color: "#ffffff",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            width: 120,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            ":hover": {
              backgroundColor: "#7c3aed",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Delete"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
