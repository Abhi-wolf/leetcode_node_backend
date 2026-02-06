import logger from "../../config/logger.config";
import Docker from "dockerode";

export interface CreateContainerOptions {
  imageName: string;
  cmdExecutable: string[];
  memoryLimitMB: number;
}

export async function createNewDockerContainer(
  options: CreateContainerOptions,
) {
  // Implementation for creating a new Docker container

  try {
    const docker = new Docker();

    const container = await docker.createContainer({
      Image: options.imageName,
      Cmd: options.cmdExecutable,
      AttachStderr: true, // to allow capturing stderr
      AttachStdout: true, // to allow capturing stdout
      AttachStdin: true, // to allow input via stdin
      Tty: false, // disable TTY for better stream handling
      HostConfig: {
        Memory: options.memoryLimitMB,
        PidsLimit: 100, // limit the number of processes in the container
        CpuQuota: 50000, // limit CPU usage to 50% of a single CPU core
        CpuPeriod: 100000, // set the CPU period for quota enforcement
        SecurityOpt: ["no-new-privileges"], // prevent privilege escalation
        NetworkMode: "none", // disable networking for security
      },
    });

    console.log("Container created with ID:", container.id);

    return container;
  } catch (error) {
    logger.error("Error creating Docker container:", error);
    return null;
  }
}
