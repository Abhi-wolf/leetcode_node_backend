import { CPP_IMAGE, PYTHON_IMAGE, NODE_IMAGE } from "../utils/constants";

export const LANGUAGE_CONFIG = {
  python: {
    timeout: 40000,
    imageName: PYTHON_IMAGE,
  },
  cpp: {
    timeout: 10000,
    imageName: CPP_IMAGE,
  },
  js: {
    timeout: 20000,
    imageName: NODE_IMAGE,
  },
};
