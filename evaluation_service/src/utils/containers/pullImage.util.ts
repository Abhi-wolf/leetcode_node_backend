import Docker from "dockerode";
import logger from "../../config/logger.config";
import { CPP_IMAGE, PYTHON_IMAGE } from "../constants";

export async function pullImage(imageName: string) {
  const docker = new Docker();

  return new Promise((resolve, reject) => {
    docker.pull(imageName, (err: Error, stream: NodeJS.ReadableStream) => {
      if (err) return err;

      docker.modem.followProgress(stream, onFinished);

      function onFinished(err: any, output: any) {
        if (err) {
          reject(err);
        } else {
          resolve(output);
        }
      }

      //   function onProgress(event: any) {
      //     console.log(imageName, " Progress event:", event.status);
      //   }
    });
  });
}

export async function pullAllImages() {
  const images = [PYTHON_IMAGE, CPP_IMAGE];

  const pullPromises = images.map((image) => pullImage(image));

  try {
    await Promise.all(pullPromises);
    logger.info("All images pulled successfully");
  } catch (error) {
    logger.error("Error pulling images:", error);
  }
}
