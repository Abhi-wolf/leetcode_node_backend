import { marked } from "marked";
import logger from "../config/logger.config";
import sanitizeHtml from "sanitize-html";
import TurndownService from "turndown";

export const sanitizeMarkdown = async (markdown: string): Promise<string> => {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  try {
    // convert markdown to html
    const convertedHtml = await marked.parse(markdown);

    // sanitize the html (no form, script tags allowed)
    const sanitizedHtml = sanitizeHtml(convertedHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "code",
        "pre",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt", "title"],
        code: ["class"],
        pre: ["class"],
        a: ["href", "title"],
      },
      allowedSchemes: ["http", "https"],
      allowedSchemesByTag: {
        img: ["http", "https"],
      },
    });

    const tds = new TurndownService();

    return tds.turndown(sanitizedHtml); // again convert sanitized html back to markdown
  } catch (error) {
    logger.error("Error sanitizing markdown:", error);
    return "";
  }
};
