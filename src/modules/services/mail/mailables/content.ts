import { join } from "path"
import handlebars from "handlebars"
import { existsSync, readFileSync } from "fs"

/**
 * Shape of content that can be provided for an email
 */
type ContentType = {
  html?: string // view name (e.g., "welcome" or "mail.welcome")
  text?: string // plain text version of the message
  with?: Record<string, any> // data passed into templates
}

/**
 * Represents the body content of an email.
 *
 * Supports either:
 * - A template-based HTML view (compiled with Handlebars),
 * - A plain text message,
 * - Or both.
 */
export class Content {
  public html?: string
  public text?: string
  public with?: Record<string, any>

  /**
   * Default base directory for view templates.
   * Templates are expected to be in `src/views`.
   */
  private readonly viewsPath = join(process.cwd(), "src", "views")

  constructor(data: ContentType) {
    this.html = data.html
    this.text = data.text
    this.with = data.with
  }

  /**
   * Build the email body by compiling HTML templates or returning raw text.
   *
   * - If `html` is provided, it looks for a `.html`, `.hbs`, or `.handlebars` file
   *   under the `views` directory, compiles it with Handlebars, and injects variables.
   * - If `text` is provided, it simply returns it as the plain-text content.
   * - If neither is found, it returns an empty object.
   */
  public build(): { html?: string; text?: string } {
    if (this.html) {
      const templatePath = this.resolveViewPath(this.html)
      const fileContent = readFileSync(templatePath, "utf8")
      const template = handlebars.compile(fileContent)
      const rendered = template(this.with || {})
      return { html: rendered }
    }

    if (this.text) {
      return { text: this.text }
    }

    return {}
  }

  /**
   * Resolve a template name into a file path.
   *
   * Example:
   *  - "mail.test" → "src/views/mail/test.html" (or .hbs / .handlebars)
   *
   * Tries extensions in order: `.html`, `.hbs`, `.handlebars`.
   * Throws an error if the template file does not exist.
   */
  private resolveViewPath(view: string): string {
    const relativePath = view.replace(/\./g, "/")

    if (existsSync(join(this.viewsPath, relativePath + ".html"))) {
      return join(this.viewsPath, relativePath + ".html")
    } else if (existsSync(join(this.viewsPath, relativePath + ".hbs"))) {
      return join(this.viewsPath, relativePath + ".hbs")
    } else if (existsSync(join(this.viewsPath, relativePath + ".handlebars"))) {
      return join(this.viewsPath, relativePath + ".handlebars")
    }

    throw new Error("content view not found")
  }
}
