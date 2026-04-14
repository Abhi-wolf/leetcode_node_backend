import { ProblemController } from "../controllers/problem.controller";
import { ProblemRepository } from "../repositories/problem.repository";
import { ProblemService } from "../services/problem.service";

export class ProblemFactory {
  private static problemRepository: ProblemRepository;
  private static problemService: ProblemService;
  private static problemController: ProblemController;

  /**
   * Factory method to get the singleton instance of ProblemRepository
   * @returns {ProblemRepository} The singleton instance of ProblemRepository
   */
  static getProblemRepository(): ProblemRepository {
    if (!this.problemRepository) {
      this.problemRepository = new ProblemRepository();
    }
    return this.problemRepository;
  }

  /**
   * Factory method to get the singleton instance of ProblemService
   * @returns {ProblemService} The singleton instance of ProblemService
   */
  static getProblemService(): ProblemService {
    if (!this.problemService) {
      this.problemService = new ProblemService(this.getProblemRepository());
    }
    return this.problemService;
  }

  /**
   * Factory method to get the singleton instance of ProblemController
   * @returns {ProblemController} The singleton instance of ProblemController
   */
  static getProblemController(): ProblemController {
    if (!this.problemController) {
      this.problemController = new ProblemController(this.getProblemService());
    }
    return this.problemController;
  }
}
