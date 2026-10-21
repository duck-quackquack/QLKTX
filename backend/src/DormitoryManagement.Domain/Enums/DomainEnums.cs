namespace DormitoryManagement.Domain.Enums;

public enum UserRole
{
    Admin = 1,
    Staff = 2,
    Student = 3
}

public enum RoomStatus
{
    Available = 1,
    Full = 2,
    Maintenance = 3
}

public enum BedStatus
{
    Available = 1,
    Occupied = 2,
    Maintenance = 3
}

public enum ContractStatus
{
    Pending = 1,
    Active = 2,
    Expired = 3,
    Terminated = 4
}

public enum RegistrationStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4
}

public enum InvoiceStatus
{
    Unpaid = 1,
    PartiallyPaid = 2,
    Paid = 3,
    Overdue = 4,
    Cancelled = 5
}

public enum PaymentMethod
{
    Cash = 1,
    BankTransfer = 2,
    VNPay = 3,
    MoMo = 4
}

public enum PaymentStatus
{
    Pending = 1,
    Completed = 2,
    Failed = 3
}

public enum RepairPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4
}

public enum RepairStatus
{
    Pending = 1,
    Processing = 2,
    Completed = 3,
    Cancelled = 4
}

public enum ViolationStatus
{
    Pending = 1,
    Processed = 2,
    Paid = 3,
    Cancelled = 4
}

public enum NotificationType
{
    General = 1,
    Invoice = 2,
    Contract = 3,
    Repair = 4,
    Violation = 5,
    Registration = 6
}

