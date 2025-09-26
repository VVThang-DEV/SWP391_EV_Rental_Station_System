using System.Net;
using System.Net.Mail;

namespace EVRentalApi.Application.Services;

public sealed class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendVerificationEmailAsync(string toEmail, string verificationLink)
    {
        var smtp = _config.GetSection("Smtp");
        var host = smtp["Host"]!;
        var port = int.Parse(smtp["Port"] ?? "587");
        var user = smtp["User"]!;
        var pass = smtp["Pass"]!;
        var from = smtp["From"] ?? user;

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(user, pass)
        };

        using var msg = new MailMessage(from, toEmail)
        {
            Subject = "Verify your EV Rental account",
            Body = $"Please verify your email by clicking the link: {verificationLink}",
            IsBodyHtml = false
        };

        await client.SendMailAsync(msg);
    }
}

public class EmailService
{
    public async Task SendVerificationEmailAsync(string toEmail, string verificationLink)
    {
        // Use SMTP or a third-party provider here
        // Example: SmtpClient, SendGrid, etc.
    }
}