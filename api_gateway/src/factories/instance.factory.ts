import { InstanceRepository } from "../repositories/instance.repository";
import { InstanceService } from "../services/instance.service";
import { InstanceController } from "../controllers/instance.controller";

export class InstanceFactory {
  private static instanceRepository: InstanceRepository;
  private static instanceService: InstanceService;
  private static instanceController: InstanceController;

  static getInstanceRepository(): InstanceRepository {
    if (!this.instanceRepository) {
      this.instanceRepository = new InstanceRepository();
    }
    return this.instanceRepository;
  }

  static getInstanceService(): InstanceService {
    if (!this.instanceService) {
      this.instanceService = new InstanceService(this.getInstanceRepository());
    }
    return this.instanceService;
  }

  static getInstanceController(): InstanceController {
    if (!this.instanceController) {
      this.instanceController = new InstanceController(
        this.getInstanceService(),
      );
    }
    return this.instanceController;
  }
}
