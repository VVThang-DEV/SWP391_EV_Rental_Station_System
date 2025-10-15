# Software Requirements Specification (SRS)
## EV Battery Swap Station Management System

### 1. Introduction

#### 1.1 Purpose
This document specifies the requirements for the EV Battery Swap Station Management System, a comprehensive platform for managing electric vehicle charging stations, customers, vehicles, and charging sessions.

#### 1.2 Scope
The system manages the complete lifecycle of EV charging operations including customer registration, vehicle management, station operations, charging sessions, pricing, and reporting.

#### 1.3 Definitions, Acronyms, and Abbreviations
- **EV**: Electric Vehicle
- **SRS**: Software Requirements Specification
- **ERD**: Entity Relationship Diagram
- **API**: Application Programming Interface
- **UI**: User Interface
- **OTP**: One-Time Password

### 2. Overall Description

#### 2.1 Product Perspective
The system consists of:
- **Backend API**: .NET Core Web API for business logic and data management
- **Frontend**: React-based web application for user interface
- **Database**: SQL Server for data persistence
- **External Services**: Email service for OTP verification

#### 2.2 Product Functions
Based on the ERD analysis, the system provides:

1. **Customer Management**
   - Customer registration and authentication
   - Profile management
   - OTP-based email verification

2. **Vehicle Management**
   - Vehicle registration by customers
   - Connector type compatibility management
   - Vehicle status tracking

3. **Station Management**
   - Charging station administration
   - Charging point and port management
   - Real-time status monitoring

4. **Charging Session Management**
   - Session initiation and termination
   - Energy consumption tracking
   - Cost calculation and billing

5. **Pricing Management**
   - Dynamic pricing configuration
   - Penalty fee management
   - Historical pricing tracking

6. **Reporting and Analytics**
   - Monthly vehicle statistics
   - Revenue and utilization reports
   - Performance metrics

### 3. Specific Requirements

#### 3.1 Functional Requirements

##### 3.1.1 Customer Management (FR-001 to FR-010)

**FR-001: Customer Registration**
- The system shall allow new customers to register with email, password, full name, phone, and address
- The system shall validate email uniqueness and password strength
- The system shall send OTP to customer email for verification

**FR-002: Customer Authentication**
- The system shall provide login functionality with email and password
- The system shall support role-based access (Customer, Staff, Admin)
- The system shall generate JWT tokens for authenticated sessions

**FR-003: Profile Management**
- The system shall allow customers to update personal information
- The system shall validate phone number uniqueness
- The system shall track profile update history

**FR-004: Password Management**
- The system shall provide forgot password functionality
- The system shall send password reset links via email
- The system shall enforce password complexity rules

##### 3.1.2 Vehicle Management (FR-011 to FR-020)

**FR-011: Vehicle Registration**
- The system shall allow customers to register their vehicles
- The system shall capture vehicle name, type, battery capacity, and license plate
- The system shall validate vehicle information completeness

**FR-012: Connector Compatibility**
- The system shall manage vehicle-connector type relationships
- The system shall allow multiple connector types per vehicle
- The system shall validate compatibility before charging sessions

**FR-013: Vehicle Status Management**
- The system shall track vehicle status (Active, Block)
- The system shall provide vehicle status update functionality
- The system shall maintain vehicle status history

##### 3.1.3 Station Management (FR-021 to FR-030)

**FR-021: Charging Station Management**
- The system shall manage charging station information
- The system shall track station location (latitude, longitude)
- The system shall maintain station status and availability

**FR-022: Charging Point Management**
- The system shall manage charging points within stations
- The system shall track point availability and status
- The system shall support multiple points per station

**FR-023: Charging Port Management**
- The system shall manage individual charging ports
- The system shall track port status (Available, InUse, Fault)
- The system shall associate ports with connector types

##### 3.1.4 Charging Session Management (FR-031 to FR-040)

**FR-031: Session Initiation**
- The system shall allow customers to start charging sessions
- The system shall validate vehicle-port compatibility
- The system shall reserve the charging port during session

**FR-032: Session Monitoring**
- The system shall track session start and end times
- The system shall monitor energy consumption in real-time
- The system shall calculate session costs dynamically

**FR-033: Session Termination**
- The system shall allow customers to end charging sessions
- The system shall release charging ports upon termination
- The system shall generate session completion reports

##### 3.1.5 Pricing Management (FR-041 to FR-050)

**FR-041: Price Configuration**
- The system shall manage price per kWh rates
- The system shall configure penalty fees per minute
- The system shall support time-based pricing validity

**FR-042: Dynamic Pricing**
- The system shall apply current pricing to active sessions
- The system shall handle pricing changes during sessions
- The system shall maintain pricing history

##### 3.1.6 Reporting and Analytics (FR-051 to FR-060)

**FR-051: Monthly Reports**
- The system shall generate monthly vehicle statistics
- The system shall track total sessions, energy, and costs per vehicle
- The system shall calculate payment amounts and status

**FR-052: Revenue Analytics**
- The system shall provide revenue reporting by station
- The system shall track utilization rates
- The system shall generate performance metrics

#### 3.2 Non-Functional Requirements

##### 3.2.1 Performance Requirements (NFR-001 to NFR-005)

**NFR-001: Response Time**
- The system shall respond to user requests within 2 seconds
- Database queries shall complete within 500ms
- API endpoints shall handle concurrent requests efficiently

**NFR-002: Throughput**
- The system shall support 1000 concurrent users
- The system shall handle 10,000 charging sessions per day
- The system shall process 100,000 API requests per hour

**NFR-003: Scalability**
- The system shall support horizontal scaling
- The system shall handle increasing station and port capacity
- The system shall support geographic distribution

##### 3.2.2 Security Requirements (NFR-006 to NFR-010)

**NFR-006: Authentication**
- The system shall implement secure password hashing (SHA-256)
- The system shall use JWT tokens for session management
- The system shall enforce session timeouts

**NFR-007: Authorization**
- The system shall implement role-based access control
- The system shall restrict access based on user roles
- The system shall validate permissions for each operation

**NFR-008: Data Protection**
- The system shall encrypt sensitive customer data
- The system shall implement secure communication (HTTPS)
- The system shall protect against SQL injection attacks

##### 3.2.3 Reliability Requirements (NFR-011 to NFR-015)

**NFR-011: Availability**
- The system shall maintain 99.9% uptime
- The system shall implement fault tolerance mechanisms
- The system shall provide backup and recovery procedures

**NFR-012: Data Integrity**
- The system shall ensure data consistency across transactions
- The system shall implement data validation rules
- The system shall maintain referential integrity

##### 3.2.4 Usability Requirements (NFR-016 to NFR-020)

**NFR-016: User Interface**
- The system shall provide intuitive web interface
- The system shall support responsive design for mobile devices
- The system shall provide multi-language support (Vietnamese/English)

**NFR-017: User Experience**
- The system shall provide clear navigation and workflows
- The system shall display real-time charging session status
- The system shall provide helpful error messages and guidance

### 4. Data Requirements

#### 4.1 Logical Data Model

The system's logical data model is based on the Entity Relationship Diagram (ERD) and represents the core business entities and their relationships:

**Core Entities and Relationships:**

1. **Customer** (1) ←→ (M) **Vehicle**
   - One customer can own multiple vehicles
   - Each vehicle belongs to exactly one customer

2. **Vehicle** (M) ←→ (M) **ConnectorType** (via **VehicleConnectorType**)
   - Many-to-many relationship between vehicles and connector types
   - Junction table: VehicleConnectorType

3. **ChargingStation** (1) ←→ (M) **ChargingPoint**
   - One station contains multiple charging points
   - Each charging point belongs to exactly one station

4. **ChargingPoint** (1) ←→ (M) **ChargingPort**
   - One charging point contains multiple charging ports
   - Each charging port belongs to exactly one charging point

5. **ChargingPort** (M) ←→ (1) **ConnectorType**
   - Many charging ports can use the same connector type
   - Each charging port has exactly one connector type

6. **ChargingSession** relationships:
   - **ChargingSession** (M) ←→ (1) **Vehicle**
   - **ChargingSession** (M) ←→ (1) **ChargingPort**
   - **ChargingSession** (M) ←→ (1) **PriceTable**

7. **VehiclePerMonth** relationships:
   - **VehiclePerMonth** (M) ←→ (1) **Vehicle**
   - **VehiclePerMonth** (M) ←→ (1) **MonthlyPeriod**

**Data Model Characteristics:**
- Hierarchical structure: Station → Point → Port
- Many-to-many relationships for vehicle-connector compatibility
- Time-based entities for reporting and pricing
- Session-based tracking for charging operations

#### 4.2 Data Dictionary

**Customer Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| CustomerID | VARCHAR | 100 | Alphanumeric | PK, NOT NULL | Unique customer identifier |
| FullName | VARCHAR | 100 | Text | NOT NULL | Customer's full name |
| Email | VARCHAR | 100 | Email format | NOT NULL, UNIQUE | Customer's email address |
| Phone | VARCHAR | 15 | Phone format | UNIQUE | Customer's phone number |
| Address | VARCHAR | 255 | Text | NULL | Customer's address |

**Vehicle Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| VehicleID | INT | - | Integer | PK, AUTO_INCREMENT | Unique vehicle identifier |
| CustomerID | VARCHAR | 100 | Alphanumeric | FK, NOT NULL | Reference to customer |
| VehicleName | VARCHAR | 100 | Text | NOT NULL | Vehicle model name |
| VehicleType | VARCHAR | 100 | Text | NOT NULL | Type of vehicle |
| BatteryCapacity | FLOAT | - | Decimal | NOT NULL | Battery capacity in kWh |
| LicensePlate | VARCHAR | 20 | Alphanumeric | NULL | Vehicle license plate |
| Status | ENUM | - | Enum | NOT NULL | Active, Block |

**ConnectorType Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| ConnectorTypeID | INT | - | Integer | PK, AUTO_INCREMENT | Unique connector type ID |
| ConnectorName | VARCHAR | 50 | Text | NOT NULL | Name of connector type |

**ChargingStation Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| StationID | INT | - | Integer | PK, AUTO_INCREMENT | Unique station identifier |
| StationName | VARCHAR | 100 | Text | NOT NULL | Station name |
| Location | VARCHAR | 255 | Text | NOT NULL | Station address |
| Latitude | FLOAT | - | Decimal | NULL | GPS latitude |
| Longitude | FLOAT | - | Decimal | NULL | GPS longitude |

**ChargingPoint Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| PointID | VARCHAR | 100 | Alphanumeric | PK, NOT NULL | Unique charging point ID |
| StationID | INT | - | Integer | FK, NOT NULL | Reference to station |

**ChargingPort Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| PortID | VARCHAR | 100 | Alphanumeric | PK, NOT NULL | Unique charging port ID |
| PointID | VARCHAR | 100 | Alphanumeric | FK, NOT NULL | Reference to charging point |
| ConnectorTypeID | INT | - | Integer | FK, NOT NULL | Reference to connector type |
| Power | INT | - | Integer | NULL | Power rating in kW |
| Status | ENUM | - | Enum | NOT NULL | Available, InUse, Fault |

**PriceTable Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| PriceID | INT | - | Integer | PK, AUTO_INCREMENT | Unique price identifier |
| PricePerKWh | FLOAT | - | Decimal | NOT NULL | Price per kWh in VND |
| PenaltyFeePerMinute | FLOAT | - | Decimal | NOT NULL | Penalty fee per minute |
| ValidFrom | DATE | - | Date | NOT NULL | Price validity start date |
| ValidTo | DATE | - | Date | NULL | Price validity end date |
| Status | ENUM | - | Enum | NOT NULL | Active, Deactive |

**ChargingSession Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| SessionID | INT | - | Integer | PK, AUTO_INCREMENT | Unique session identifier |
| VehicleID | INT | - | Integer | FK, NOT NULL | Reference to vehicle |
| PortID | VARCHAR | 100 | Alphanumeric | FK, NOT NULL | Reference to charging port |
| PriceID | INT | - | Integer | FK, NOT NULL | Reference to price table |
| StartTime | DATETIME | - | DateTime | NOT NULL | Session start time |
| EndTime | DATETIME | - | DateTime | NULL | Session end time |
| EnergyConsumed | FLOAT | - | Decimal | NULL | Energy consumed in kWh |
| TotalCost | FLOAT | - | Decimal | NULL | Total cost in VND |
| Status | ENUM | - | Enum | NOT NULL | Charging, Completed |

**MonthlyPeriod Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| PeriodID | INT | - | Integer | PK, AUTO_INCREMENT | Unique period identifier |
| Month | INT | - | Integer | NOT NULL | Month (1-12) |
| Year | INT | - | Integer | NOT NULL | Year |

**VehiclePerMonth Entity**
| Attribute | Data Type | Length | Format | Constraints | Description |
|-----------|-----------|--------|--------|-------------|-------------|
| VehicleMonthID | INT | - | Integer | PK, AUTO_INCREMENT | Unique identifier |
| VehicleID | VARCHAR | 100 | Alphanumeric | FK, NOT NULL | Reference to vehicle |
| PeriodID | INT | - | Integer | FK, NOT NULL | Reference to monthly period |
| TotalSessions | INT | - | Integer | NULL | Total charging sessions |
| TotalEnergy | FLOAT | - | Decimal | NULL | Total energy consumed |
| TotalCost | FLOAT | - | Decimal | NULL | Total cost incurred |
| AmountPaid | FLOAT | - | Decimal | NULL | Amount paid by customer |

#### 4.3 Reports

**4.3.1 Monthly Vehicle Report**
- **Purpose**: Track monthly charging statistics for each vehicle
- **Content**: Total sessions, energy consumption, costs, payment status
- **Sort Sequence**: By vehicle, then by month/year
- **Totaling Levels**: Vehicle level, customer level, system level
- **Frequency**: Generated monthly, available for historical periods

**4.3.2 Station Utilization Report**
- **Purpose**: Monitor charging station performance and usage
- **Content**: Station utilization rates, revenue per station, port availability
- **Sort Sequence**: By station, then by time period
- **Totaling Levels**: Port level, point level, station level
- **Frequency**: Generated daily, weekly, monthly

**4.3.3 Revenue Analytics Report**
- **Purpose**: Financial analysis and revenue tracking
- **Content**: Revenue by station, pricing effectiveness, customer spending patterns
- **Sort Sequence**: By revenue amount, then by time period
- **Totaling Levels**: Session level, vehicle level, customer level, station level
- **Frequency**: Generated monthly, quarterly, annually

**4.3.4 Customer Activity Report**
- **Purpose**: Customer behavior analysis and engagement tracking
- **Content**: Customer charging frequency, preferred stations, spending patterns
- **Sort Sequence**: By customer, then by activity date
- **Totaling Levels**: Session level, customer level
- **Frequency**: Generated monthly, available on-demand

**4.3.5 System Performance Report**
- **Purpose**: System health monitoring and performance metrics
- **Content**: Session success rates, system uptime, error rates, response times
- **Sort Sequence**: By time period, then by metric type
- **Totaling Levels**: Hourly, daily, monthly aggregations
- **Frequency**: Generated daily, weekly

#### 4.4 Data Acquisition, Integrity, Retention, and Disposal

**4.4.1 Data Acquisition**
- **Customer Data**: Acquired through registration forms and profile updates
- **Vehicle Data**: Acquired through vehicle registration by customers
- **Station Data**: Acquired through administrative setup and configuration
- **Session Data**: Acquired through real-time charging session monitoring
- **Pricing Data**: Acquired through administrative pricing configuration

**4.4.2 Data Integrity Requirements**
- **Referential Integrity**: All foreign key relationships must be maintained
- **Data Validation**: Input validation for all user-entered data
- **Constraint Enforcement**: Database constraints for data type, length, and format
- **Transaction Integrity**: ACID properties for all database transactions
- **Concurrent Access**: Row-level locking for session management
- **Data Consistency**: Real-time synchronization between charging ports and sessions

**4.4.3 Data Retention Policies**
- **Customer Data**: Retained indefinitely for account management
- **Vehicle Data**: Retained while vehicle is active, archived for 5 years after deactivation
- **Charging Sessions**: Retained for 7 years for billing and audit purposes
- **Monthly Reports**: Retained permanently for historical analysis
- **Pricing History**: Retained for 10 years for regulatory compliance
- **System Logs**: Retained for 1 year, then archived for 3 years
- **OTP Codes**: Retained for 24 hours, then automatically purged

**4.4.4 Data Disposal Procedures**
- **Secure Deletion**: All deleted data must be permanently removed from all storage systems
- **Data Anonymization**: Customer data anonymized before disposal for research purposes
- **Backup Cleanup**: Regular cleanup of temporary backups and cache files
- **Archive Management**: Systematic disposal of archived data according to retention policies
- **Compliance**: Disposal procedures must comply with Vietnamese data protection regulations

**4.4.5 Data Protection Measures**
- **Backup Strategy**: Daily incremental backups, weekly full backups
- **Disaster Recovery**: 24-hour recovery time objective (RTO), 1-hour recovery point objective (RPO)
- **Data Encryption**: Encryption at rest and in transit
- **Access Control**: Role-based access control with audit logging
- **Data Masking**: Sensitive data masked in non-production environments
- **Monitoring**: Continuous monitoring of data access and modifications

### 5. System Architecture

#### 5.1 Database Schema
Based on the ERD, the system includes the following main entities:

1. **Customer** - Customer information and authentication
2. **Vehicle** - Electric vehicles owned by customers
3. **ConnectorType** - Types of charging connectors
4. **VehicleConnectorType** - Many-to-many relationship between vehicles and connector types
5. **ChargingStation** - Physical charging stations
6. **ChargingPoint** - Charging points within stations
7. **ChargingPort** - Individual charging ports with specific connector types
8. **PriceTable** - Pricing information for charging services
9. **MonthlyPeriod** - Time periods for reporting
10. **VehiclePerMonth** - Monthly statistics per vehicle
11. **ChargingSession** - Individual charging sessions

#### 5.2 API Endpoints
The system provides RESTful APIs for:

- Authentication: `/auth/login`, `/auth/register`, `/auth/forgot-password`
- Customer Management: `/customers/*`
- Vehicle Management: `/vehicles/*`
- Station Management: `/stations/*`
- Charging Sessions: `/sessions/*`
- Pricing: `/pricing/*`
- Reports: `/reports/*`

### 6. Constraints and Assumptions

#### 6.1 Constraints
- The system must integrate with existing email services
- The system must comply with Vietnamese data protection regulations
- The system must support Vietnamese language and currency

#### 6.2 Assumptions
- Customers have reliable internet connectivity
- Charging stations have stable power supply
- Staff members are trained on system operations
- Email services are available for OTP delivery

### 7. Acceptance Criteria

#### 7.1 Functional Acceptance
- All functional requirements (FR-001 to FR-060) are implemented and tested
- System handles all user scenarios successfully
- Data integrity is maintained across all operations

#### 7.2 Non-Functional Acceptance
- Performance requirements are met under load testing
- Security requirements are validated through penetration testing
- Usability requirements are confirmed through user acceptance testing

### 8. Appendices

#### 8.1 ERD Diagram
The Entity Relationship Diagram shows the complete database schema with all entities, attributes, and relationships.

#### 8.2 API Documentation
Detailed API documentation will be provided separately.

#### 8.3 User Interface Mockups
UI mockups and wireframes will be provided in separate documents.

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Prepared By**: [Your Name]  
**Reviewed By**: [Reviewer Name]  
**Approved By**: [Approver Name]
