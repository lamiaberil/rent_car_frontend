export interface Office {
  id: string;
  officeCode: string;
  name: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  email: string;
  workingHours: string;
  openingDate: string;
  status: 'Aktif' | 'Pasif';
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  maintenanceCars: number;
  activeReservations: number;
  todayReservations: number;
  manager: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  notes: string[];
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  segment: string;
  transmission: 'Manuel' | 'Otomatik';
  fuelType: 'Benzin' | 'Dizel' | 'Elektrik' | 'Hibrit';
  doors: number;
  trunkCapacity: number;
  passengerCapacity: number;
  engineCapacity?: string;
  horsepower?: number;
  mileage: number;
  dailyPrice: number;
  status: 'Müsait' | 'Kirada' | 'Bakımda';
  isFavorite?: boolean;
  isFrequentlyRented?: boolean;
  imageUrl: string;
  images?: string[];
  officeId: string;
  viewCount?: number;
  rating?: number;
  ratingCount?: number;
  lastViewedAt?: string;
}

export interface DashboardStatistics {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  maintenanceCars: number;
  favoriteCars: number;
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  totalOffices: number;
  totalUsers: number;
  totalMaintenances?: number;
  pendingMaintenances?: number;
  inProgressMaintenances?: number;
  monthlyMaintenanceCost?: number;
}

export interface Maintenance {
  id: string;
  carId: string;
  carBrand: string;
  carModel: string;
  plate: string;
  maintenanceType: 'Periyodik bakım' | 'Yağ değişimi' | 'Lastik değişimi' | 'Fren bakımı' | 'Motor bakımı' | 'Diğer';
  maintenanceDate: string;
  mileage: number;
  description: string;
  cost: number;
  status: 'Bekliyor' | 'Devam Ediyor' | 'Tamamlandı';
  createdAt: string;
}

export interface Damage {
  id: string;
  carId: string;
  area: string;
  description: string;
  date: string;
  photoUrl: string;
  status: 'Onarıldı' | 'Bekliyor' | 'İşlemde';
}

export interface Document {
  id: string;
  carId: string;
  type: 'Ruhsat' | 'Trafik Sigortası' | 'Kasko' | 'Muayene' | 'Egzoz Muayenesi';
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl: string;
  status: 'Geçerli' | 'Yakında Bitiyor' | 'Süresi Dolmuş';
}
export interface Reservation {
  id: string;
  pnr: string;
  status: 'Beklemede' | 'Onaylandı' | 'Aktif Kullanımda' | 'Tamamlandı' | 'İptal Edildi';
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerDob: string;
  customerLicense: string;
  customerLicenseExp: string;
  carId: string;
  pickupOfficeId: string;
  dropoffOfficeId: string;
  startDate: string;
  endDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickupTerminal: string;
  dropoffTerminal: string;
  supplier?: {
    name: string;
    logoUrl: string;
  };
  pricing: {
    dailyRate: number;
    totalDays: number;
    carTotal: number;
    extrasTotal: number;
    taxes: number;
    discount: number;
    totalAmount: number;
    paidAmount: number;
    payAtOffice: number;
  };
  extras: string[];
  payment: {
    method: string;
    cardLast4: string;
    date: string;
  };
  conditions: {
    fuelPolicy: string;
    mileageLimit: string;
    deposit: string;
    cancellation: string;
    ageLimit: string;
    extraDriver: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  licenseNumber: string;
  licenseExp: string;
  address?: string;
  createdAt: string;
}

export interface User {
  id: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tcNo: string;
  driverLicenseClass: string;
  driverLicenseNo: string;
  driverLicenseExp: string;
  birthDate: string;
  address: string;
  city: string;
  membershipDate: string;
  status: "Aktif" | "Pasif" | "Kara Liste";
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  canceledReservations: number;
  totalSpent: number;
  lastRentalDate?: string;
  notes?: string;
}

export interface KabisNotification {
  id: string;
  notificationNo: string;
  reservationId: string;
  reservationPnr: string;
  customerId: string;
  customerName: string;
  customerTc: string;
  customerPhone: string;
  customerEmail: string;
  customerLicense: string;
  customerDob: string;
  carId: string;
  carBrand: string;
  carModel: string;
  carPlate: string;
  carSegment: string;
  pickupDate: string;
  dropoffDate: string;
  office: string;
  status: 'Bekliyor' | 'Gönderildi' | 'Başarısız';
  sentDate?: string;
  apiResponse?: string;
  errorMessage?: string;
}

export interface KabisStats {
  pending: number;
  successful: number;
  failed: number;
  sentToday: number;
}
