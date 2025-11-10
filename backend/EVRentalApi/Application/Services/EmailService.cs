namespace EVRentalApi.Application.Services;

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
    Task SendWithAttachmentsAsync(string toEmail, string subject, string htmlBody, List<EmailAttachment>? attachments = null, CancellationToken ct = default);
}

public class EmailAttachment
{
    public string FilePath { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
}
