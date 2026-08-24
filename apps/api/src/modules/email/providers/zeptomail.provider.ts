import {
  IEmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from "../email.interface.js";
import { config } from "../../../config/env.js";

export class ZeptoMailEmailProvider implements IEmailProvider {
  readonly name = "ZeptoMail";

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!config.email.zeptomailApiKey) {
      return {
        success: false,
        provider: this.name,
        error: "ZeptoMail API key not configured",
      };
    }

    try {
      const toRecipients = Array.isArray(options.to)
        ? options.to.map((t) =>
            typeof t === "string"
              ? { email_address: { address: t } }
              : { email_address: { address: t.email, name: t.name } },
          )
        : [
            typeof options.to === "string"
              ? { email_address: { address: options.to } }
              : {
                  email_address: {
                    address: options.to.email,
                    name: options.to.name,
                  },
                },
          ];

      const fromAddress = options.from || config.email.zeptomailFromEmail;

      const payload = {
        from: {
          address: fromAddress.includes("<")
            ? fromAddress.replace(/^.*<([^>]+)>.*$/, "$1").trim()
            : fromAddress,
          name: fromAddress.includes("<")
            ? fromAddress.replace(/<.*>/, "").trim()
            : "DAIH Workspace Hub",
        },
        to: toRecipients,
        subject: options.subject,
        htmlbody: options.html,
        textbody: options.text,
      };

      const response = await fetch(config.email.zeptomailApiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `SendMail-Token ${config.email.zeptomailApiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as any;

      if (!response.ok) {
        return {
          success: false,
          provider: this.name,
          error: data?.message || `ZeptoMail HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data?.data?.[0]?.message_id || data?.request_id,
        provider: this.name,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        error: err?.message || "Unknown error occurred in ZeptoMail provider",
      };
    }
  }
}
