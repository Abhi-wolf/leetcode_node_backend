import { Request, Response } from "express";
import { RegistryService } from "../services/registry.service";

export class RegistryController {
  constructor(private registryService: RegistryService) {}

  registerService = async (req: Request, res: Response) => {
    const { serviceName, instanceId, host, port } = req.body;

    const result = this.registryService.registerService(
      serviceName,
      instanceId,
      host,
      port,
    );

    res.status(200).json({
      message: "Service instance registered successfully",
      success: true,
      data: result,
    });
  };

  getAllServices = async (req: Request, res: Response) => {
    const result = this.registryService.getAllServices();

    res.status(200).json({
      message: "Services fetched successfully",
      success: true,
      data: result,
    });
  };

  getServiceInstances = async (req: Request, res: Response) => {
    const { serviceName } = req.params;
    const result = this.registryService.getServiceInstances(serviceName);

    res.status(200).json({
      message: "Service instances fetched successfully",
      success: true,
      data: result,
    });
  };

  updateServiceInstanceHeartbeat = async (req: Request, res: Response) => {
    const { serviceName, instanceId, host, port } = req.body;
    this.registryService.updateServiceInstanceHeartbeat(serviceName, instanceId, host, port);

    res.status(200).json({
      message: "Service instance heartbeat updated successfully",
      success: true,
    });
  };
}
