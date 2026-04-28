import { Request, Response } from "express";
import { InstanceService } from "../services/instance.service";

export class InstanceController {
  constructor(private instanceService: InstanceService) {}

  // addServiceInstance = async (req: Request, res: Response) => {
  //   const { serviceName, instanceId, host, port } = req.body;

  //   const result = this.instanceService.addServiceInstanceToCache(
  //     serviceName,
  //     instanceId,
  //     host,
  //     port,
  //   );

  //   res.status(200).json({
  //     message: "Service instance registered successfully",
  //     success: true,
  //     data: result,
  //   });
  // };

  getAllServices = async (req: Request, res: Response) => {
    const result = this.instanceService.getAllServicesFromCache();

    res.status(200).json({
      message: "Services fetched successfully",
      success: true,
      data: result,
    });
  };
}
