using Microsoft.AspNetCore.Mvc;
using EVRentalApi.Application.Services;
using EVRentalApi.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace EVRentalApi.Application.Controllers
{
    [ApiController]
    [Route("api/admin/customers")]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        /// <summary>
        /// Get all customers (Admin only)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllCustomers()
        {
            try
            {
                // Check if user is admin
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    return Forbid("Only admin can view customers");
                }

                var customers = await _customerService.GetAllCustomersAsync();
                return Ok(new { success = true, customers = customers });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving customers", error = ex.Message });
            }
        }

        /// <summary>
        /// Get customer by ID (Admin only)
        /// </summary>
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetCustomerById(int userId)
        {
            try
            {
                // Check if user is admin
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    return Forbid("Only admin can view customer details");
                }

                var customer = await _customerService.GetCustomerDetailAsync(userId);
                if (customer == null)
                {
                    return NotFound(new { message = "Customer not found" });
                }

                return Ok(new { success = true, customer = customer });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving customer", error = ex.Message });
            }
        }

        /// <summary>
        /// Update customer (Admin only)
        /// </summary>
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateCustomer(int userId, [FromBody] UpdateCustomerRequest request)
        {
            try
            {
                // Check if user is admin
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    return Forbid("Only admin can update customers");
                }

                var success = await _customerService.UpdateCustomerAsync(userId, request);
                if (!success)
                {
                    return BadRequest(new { message = "Failed to update customer or no changes provided" });
                }

                return Ok(new { success = true, message = "Customer updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating customer", error = ex.Message });
            }
        }
    }
}

