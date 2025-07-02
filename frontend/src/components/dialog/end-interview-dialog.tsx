import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

/**
 * Props for the end-interview-dialog component.
 *
 * @property {boolean} open - Whether the dialog is visible.
 * @property {() => void} onConfirm - Callback when the user confirms to end the interview.
 * @property {() => void} onCancel - Callback when the user cancels the action.
 * @property {string} [interviewTitle] - Optional title of the interview session.
 */
interface EndInterviewDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    interviewTitle?: string;
}

/**
 * end-interview-dialog is a modal confirmation dialog that asks the user
 * if they want to end the current interview session.
 *
 * Features:
 * - Dark themed modal with blurred background
 * - Clean confirm/cancel button layout
 * - Optional title injection for context
 *
 * @param {EndInterviewDialogProps} props Component props
 * @returns {JSX.Element} A confirmation modal
 */
export const EndInterviewDialog = ({
    open,
    onConfirm,
    onCancel,
}: EndInterviewDialogProps) => {
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
            <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
                End Interview
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Typography sx={{ mb: 1 }}>
                    Are you sure you want to end this interview session?
                </Typography>
                <Typography variant="body2" sx={{ color: "#cccccc" }}>
                    Once ended, you won't be able to modify your responses.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "flex-end", pt: 2 }}>
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

                <Button
                    onClick={onConfirm}
                    variant="contained"
                    sx={{
                        backgroundColor: "#8b5cf6",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "none",
                        ":hover": {
                            backgroundColor: "#7c3aed",
                        },
                    }}
                >
                    End Interview
                </Button>
            </DialogActions>
        </Dialog>
    );
};
