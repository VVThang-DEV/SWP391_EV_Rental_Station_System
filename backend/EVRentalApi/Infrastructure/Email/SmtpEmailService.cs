using System.Net;
using System.Net.Mail;
using EVRentalApi.Application.Services;

namespace EVRentalApi.Infrastructure.Email;

public sealed class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;

    public SmtpEmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        await SendWithAttachmentsAsync(toEmail, subject, htmlBody, null, ct);
    }

    public async Task SendWithAttachmentsAsync(string toEmail, string subject, string htmlBody, List<EmailAttachment>? attachments = null, CancellationToken ct = default)
    {
        var smtp = _config.GetSection("Smtp");
        var host = smtp["Host"]!;
        var port = int.Parse(smtp["Port"]!);
        var enableSsl = bool.Parse(smtp["EnableSsl"] ?? "true");
        var user = smtp["User"]!;
        var pass = smtp["Password"]!;
        var fromConfig = smtp["From"];

        string fromEmail = user;
        string fromName = "EVRentals";
        if (!string.IsNullOrWhiteSpace(fromConfig))
        {
            try
            {
                if (fromConfig.Contains('<') && fromConfig.Contains('>'))
                {
                    var start = fromConfig.IndexOf('<') + 1;
                    var end = fromConfig.IndexOf('>');
                    var addr = fromConfig.Substring(start, end - start).Trim();
                    var name = fromConfig.Substring(0, start - 1).Trim().TrimEnd('"');
                    if (addr.Contains("@")) { fromEmail = addr; }
                    if (!string.IsNullOrWhiteSpace(name)) { fromName = name; }
                }
                else if (fromConfig.Contains("@"))
                {
                    fromEmail = fromConfig.Trim();
                }
                else
                {
                    fromName = fromConfig.Trim();
                }
            }
            catch
            {
            }
        }

        using var client = new SmtpClient(host, port)
        {
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = enableSsl
        };

        using var message = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(toEmail));

        // Add attachments if provided
        if (attachments != null && attachments.Count > 0)
        {
            foreach (var attachment in attachments)
            {
                if (File.Exists(attachment.FilePath))
                {
                    var mailAttachment = new Attachment(attachment.FilePath)
                    {
                        Name = attachment.FileName,
                        ContentType = new System.Net.Mime.ContentType(attachment.ContentType)
                    };
                    message.Attachments.Add(mailAttachment);
                }
            }
        }

        await client.SendMailAsync(message, ct);
    }
}


