import { commands } from "./commands.util";
import { createNewDockerContainer } from "./createContainer.util";

export interface RunCodeOptions {
  code: string;
  language: "python" | "cpp" | "js"; // e.g., "python", "javascript", etc.
  timeout?: number; // in milliseconds
  imageName: string;
  input: string; // Optional input for the code
}

export async function runCode(options: RunCodeOptions) {
  console.log("Running code with options:", options);

  const { code, language, timeout, imageName, input } = options;

  const container = await createNewDockerContainer({
    imageName: imageName,
    cmdExecutable: commands[language](code, input),
    memoryLimitMB: 1024 * 1024 * 1024,
  });

  let isTimeLimitExceeded = false;
  const timeLimitExceeded = setTimeout(() => {
    console.log("Time limit exceeded. Stopping the container...");
    isTimeLimitExceeded = true;
    container?.kill();
  }, timeout);

  // TODO  : add check when container not created
  console.log("Container created successfully:", container?.id);

  await container?.start();

  const status = await container?.wait();

  console.log("Container exi6982c0ce3e837cfa0a8f1c45ted with status:", status);

  if (isTimeLimitExceeded) {
    await container?.remove();
    return {
      status: "time_limit_exceeded",
      output: "Time limit exceeded",
    };
  }

  const logs = await container?.logs({
    stdout: true,
    stderr: true,
  });

  console.log("Container logs: ", logs?.toString());

  const containerLogs = processLogs(logs);

  await container?.remove();

  clearTimeout(timeLimitExceeded);

  if (status?.StatusCode === 0) {
    console.log("Code executed successfully.");
    return {
      status: "success",
      output: containerLogs,
    };
  } else {
    console.log("Code execution failed.");
    return {
      status: "failed",
      output: containerLogs,
    };
  }
}

function processLogs(logs: Buffer | undefined) {
  return logs
    ?.toString("utf8")
    .replace(/\x00/g, "") // Remove null bytes
    .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "") // Remove control characters except \n (0x0A)
    .trim();
}
