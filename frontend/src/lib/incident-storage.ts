export interface IncidentData {
  id: string;
  reservationId: number;
  vehicleId: string;
  stationId: string;
  customerId: string;
  customerName: string;
  type: string;
  description: string;
  status: 'reported' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reportedAt: string;
  resolvedAt?: string;
  staffNotes?: string;
}

class IncidentStorageService {
  private readonly STORAGE_KEY = 'station_incidents';

  // Lấy tất cả incidents
  getAllIncidents(): IncidentData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading incidents from storage:', error);
      return [];
    }
  }

  // Thêm incident mới
  addIncident(incidentData: Omit<IncidentData, 'id' | 'reportedAt'>): IncidentData {
    const incidents = this.getAllIncidents();
    const newIncident: IncidentData = {
      ...incidentData,
      id: `INC${Date.now().toString().slice(-6)}`,
      reportedAt: new Date().toISOString(),
    };

    incidents.unshift(newIncident); // Thêm vào đầu danh sách
    this.saveIncidents(incidents);
    return newIncident;
  }

  // Lấy incidents theo station
  getIncidentsByStation(stationId: string): IncidentData[] {
    const incidents = this.getAllIncidents();
    return incidents.filter(incident => incident.stationId === stationId);
  }

  // Lấy incidents chưa xử lý theo station
  getPendingIncidentsByStation(stationId: string): IncidentData[] {
    return this.getIncidentsByStation(stationId).filter(
      incident => incident.status === 'reported'
    );
  }

  // Cập nhật incident
  updateIncident(id: string, updates: Partial<IncidentData>): IncidentData | null {
    const incidents = this.getAllIncidents();
    const index = incidents.findIndex(i => i.id === id);

    if (index === -1) return null;

    incidents[index] = {
      ...incidents[index],
      ...updates,
    };

    this.saveIncidents(incidents);
    return incidents[index];
  }

  // Lưu incidents
  private saveIncidents(incidents: IncidentData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(incidents));
    } catch (error) {
      console.error('Error saving incidents to storage:', error);
    }
  }

  // Đánh dấu incident đã đọc
  markAsRead(id: string): void {
    this.updateIncident(id, { status: 'in_progress' });
  }
}

export const incidentStorage = new IncidentStorageService();
