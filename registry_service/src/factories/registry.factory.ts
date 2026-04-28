import { RegistryRepository } from "../repositories/registry.repository";
import { RegistryService } from "../services/registry.service";
import { RegistryController } from "../controllers/registry.controller";

export class RegistryFactory {
  private static registryRepository: RegistryRepository;
  private static registryService: RegistryService;
  private static registryController: RegistryController;

  static getRegistryRepository(): RegistryRepository {
    if (!this.registryRepository) {
      this.registryRepository = new RegistryRepository();
    }
    return this.registryRepository;
  }

  static getRegistryService(): RegistryService {
    if (!this.registryService) {
      this.registryService = new RegistryService(this.getRegistryRepository());
    }
    return this.registryService;
  }

  static getRegistryController(): RegistryController {
    if (!this.registryController) {
      this.registryController = new RegistryController(
        this.getRegistryService(),
      );
    }
    return this.registryController;
  }
}
