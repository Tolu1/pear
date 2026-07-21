import { useMutation } from "@tanstack/react-query";
import { runScenario } from "@/core/playground/run-scenario";

export function useRunScenario() {
  return useMutation({ mutationFn: runScenario });
}
