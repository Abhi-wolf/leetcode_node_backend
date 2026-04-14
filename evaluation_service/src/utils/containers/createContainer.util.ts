import logger from "../../config/logger.config";
import Docker from "dockerode";

export interface CreateContainerOptions {
  imageName: string;
  cmdExecutable: string[];
  memoryLimitMB: number;
}

export async function ensureImage(
  docker: Docker,
  image: string,
): Promise<void> {
  try {
    // Check if image already exists
    console.log(`Checking if image ${image} exists...`);

    await docker.getImage(image).inspect();
    return;
  } catch (error: any) {
    // If error is NOT "image not found", rethrow

    console.log(`Image ${image} not found locally. Pulling from registry...`);
    if (error?.statusCode !== 404) {
      throw error;
    }
  }

  // Pull image if not found
  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) {
        return reject(err);
      }

      docker.modem.followProgress(
        stream,
        (pullErr: Error | null) => {
          if (pullErr) {
            console.log(`Error pulling image ${image}:`, pullErr);
            return reject(pullErr);
          }

          console.log(`Image ${image} pulled successfully.`);
          resolve();
        },
        (event: any) => {
          // Optional: you can log progress here
          // console.log(event);
          console.log("image pull event status", event.status);
        },
      );
    });
  });
}

export async function createNewDockerContainer(
  options: CreateContainerOptions,
) {
  // Implementation for creating a new Docker container

  try {
    // const docker = new Docker();

    console.log("Creating Docker container with options:", options);

    const docker = new Docker({
      host: "dind",
      port: 2375,
    });

    await ensureImage(docker, options.imageName);

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
