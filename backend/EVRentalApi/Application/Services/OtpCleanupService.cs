using EVRentalApi.Infrastructure.Repositories;

namespace EVRentalApi.Application.Services;

public sealed class OtpCleanupService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly IConfiguration _config;

    public OtpCleanupService(IServiceProvider services, IConfiguration config)
    {
        _services = services;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalSeconds = int.TryParse(_config.GetSection("Otp")["CleanupIntervalSeconds"], out var s) ? s : 300;
        var delay = TimeSpan.FromSeconds(Math.Max(60, intervalSeconds));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _services.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<OTPRepository>();
                await repo.CleanupExpiredOTPsAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OTP Cleanup] Error: {ex.Message}");
            }

            await Task.Delay(delay, stoppingToken);
        }
    }
}



