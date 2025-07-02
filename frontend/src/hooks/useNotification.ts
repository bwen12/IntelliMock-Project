import { useSnackbar, VariantType, OptionsObject } from "notistack";

/**
 * Custom hook to manage toast notifications using the notistack library.
 * 
 * This hook provides utility functions to display different types of notifications 
 * (success, error, info, warning) using the `enqueueSnackbar` method from notistack. 
 * It offers a simple interface for showing notifications with customizable messages 
 * and variants (such as success, error, info, warning). The hook also supports additional 
 * options through `OptionsObject` for customization of the notification appearance and behavior.
 * 
 * @hook useNotification
 * 
 * @returns {Object} - Returns an object with methods for displaying notifications.
 *    - `showSuccess(message: string, options?: OptionsObject)`: Displays a success message.
 *    - `showError(message: string, options?: OptionsObject)`: Displays an error message.
 *    - `showInfo(message: string, options?: OptionsObject)`: Displays an info message.
 *    - `showWarning(message: string, options?: OptionsObject)`: Displays a warning message.
 */
export function useNotification() {
  const { enqueueSnackbar } = useSnackbar();

  const show = (
    message: string,
    variant: VariantType = "default",
    options?: OptionsObject
  ) => {
    enqueueSnackbar(message, { variant, ...options });
  };

  return {
    showSuccess: (msg: string, options?: OptionsObject) => show(msg, "success", options),
    showError: (msg: string, options?: OptionsObject) => show(msg, "error", options),
    showInfo: (msg: string, options?: OptionsObject) => show(msg, "info", options),
    showWarning: (msg: string, options?: OptionsObject) => show(msg, "warning", options),
  };
}
