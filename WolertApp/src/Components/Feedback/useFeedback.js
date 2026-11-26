import { useContext } from "react";
import { FeedbackContext } from "./feedbackContext";

export function useFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error("useFeedback debe usarse dentro de FeedbackProvider.");
  return value;
}
