export interface BookingData {
    id: string;
    vehicleId: string;
    vehicle: string;
    vehicleBrand: string;
    vehicleYear: number;
    vehicleImage: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    rentalDuration: "hourly" | "daily";
    pickupLocation: string;
    status: "active" | "upcoming" | "completed";
    totalCost: number;
    baseCost: number;
    deposit: number;
    duration: string;
    customerInfo: {
        fullName: string;
        email: string;
        phone: string;
        driverLicense: string;
    };
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
}

class BookingStorageService {
    private readonly STORAGE_KEY = 'user_bookings';

    // Lấy tất cả bookings từ localStorage
    getAllBookings(): BookingData[] {
        try {
            // Tự động cập nhật status khi lấy dữ liệu
            this.updateBookingStatuses();
            // Lấy lại dữ liệu sau khi update
            return this.getAllBookingsRaw();
        } catch (error) {
            console.error('Error reading bookings from storage:', error);
            return [];
        }
    }

    // Thêm booking mới
    addBooking(bookingData: Omit<BookingData, 'id' | 'createdAt' | 'updatedAt'>): BookingData {
        const bookings = this.getAllBookingsRaw();
        const newBooking: BookingData = {
            ...bookingData,
            id: `BK${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        bookings.unshift(newBooking); // Thêm vào đầu danh sách
        this.saveBookings(bookings);
        return newBooking;
    }

    // Cập nhật booking
    updateBooking(id: string, updates: Partial<BookingData>): BookingData | null {
        const bookings = this.getAllBookingsRaw();
        const index = bookings.findIndex(b => b.id === id);

        if (index === -1) return null;

        bookings[index] = {
            ...bookings[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        this.saveBookings(bookings);
        return bookings[index];
    }

    // Lấy booking theo ID
    getBookingById(id: string): BookingData | null {
        const bookings = this.getAllBookings();
        return bookings.find(b => b.id === id) || null;
    }

    // Lấy booking theo status
    getBookingsByStatus(status: string): BookingData[] {
        const bookings = this.getAllBookings();
        return bookings.filter(b => b.status === status);
    }

    // Lưu bookings vào localStorage
    private saveBookings(bookings: BookingData[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
        } catch (error) {
            console.error('Error saving bookings to storage:', error);
        }
    }

    // Xóa booking
    deleteBooking(id: string): boolean {
        const bookings = this.getAllBookingsRaw();
        const filteredBookings = bookings.filter(b => b.id !== id);

        if (filteredBookings.length === bookings.length) return false;

        this.saveBookings(filteredBookings);
        return true;
    }
    // Thêm method mới để cập nhật status tự động
    // Thêm method mới để cập nhật status tự động
    updateBookingStatuses(): void {
        const bookings = this.getAllBookingsRaw(); // Sử dụng method raw để tránh infinite loop
        const now = new Date();
        let hasUpdates = false;

        bookings.forEach(booking => {
            // Sửa logic để xử lý đúng daily rental
            const startDateTime = booking.rentalDuration === 'hourly'
                ? new Date(`${booking.startDate}T${booking.startTime}`)
                : new Date(`${booking.startDate}T00:00:00`);

            const endDateTime = booking.rentalDuration === 'hourly'
                ? new Date(`${booking.endDate}T${booking.endTime}`)
                : new Date(`${booking.endDate}T23:59:59`);

            let newStatus: "active" | "upcoming" | "completed";

            if (now >= startDateTime && now <= endDateTime) {
                newStatus = "active";
            } else if (now < startDateTime) {
                newStatus = "upcoming";
            } else {
                newStatus = "completed";
            }

            if (booking.status !== newStatus) {
                booking.status = newStatus;
                booking.updatedAt = new Date().toISOString();
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            this.saveBookings(bookings);
        }
    }

    // Method private để lấy dữ liệu thô không update status
    private getAllBookingsRaw(): BookingData[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading bookings from storage:', error);
            return [];
        }
    }
    // Tính toán stats cho dashboard
    getDashboardStats(): {
        totalRentals: number;
        totalSpent: number;
        hoursRented: number;
        co2Saved: number;
    } {
        const bookings = this.getAllBookings();
        const completedBookings = bookings.filter(b => b.status === 'completed');

        const totalRentals = completedBookings.length;
        const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalCost, 0);

        // Tính tổng giờ thuê
        let hoursRented = 0;
        completedBookings.forEach(booking => {
            if (booking.rentalDuration === 'hourly' && booking.startTime && booking.endTime) {
                const start = new Date(`${booking.startDate}T${booking.startTime}`);
                const end = new Date(`${booking.endDate}T${booking.endTime}`);
                hoursRented += Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
            } else {
                // Daily rental - tính theo ngày * 24h
                const start = new Date(booking.startDate);
                const end = new Date(booking.endDate);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                hoursRented += days * 24;
            }
        });

        // Ước tính CO2 tiết kiệm (kg) - 0.4kg CO2 per km, giả sử 50km/hour
        const co2Saved = Math.round(hoursRented * 50 * 0.4);

        return {
            totalRentals,
            totalSpent,
            hoursRented,
            co2Saved,
        };
    }

    // Lấy current rental (booking đang active)
    getCurrentRental(): BookingData | null {
        const bookings = this.getAllBookings();
        return bookings.find(b => b.status === 'active') || null;
    }

    // Lấy recent rentals (3 booking gần nhất đã completed)
    getRecentRentals(limit: number = 3): BookingData[] {
        const bookings = this.getAllBookings();
        const completedBookings = bookings.filter(b => b.status === 'completed');
        return completedBookings.slice(0, limit);
    }
}

// Export singleton instance
export const bookingStorage = new BookingStorageService();