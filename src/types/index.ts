export interface CarProfile {
  year: number
  engine: string
  transmission: string
  plate: string
  vin: string
  mileage: number
  purchaseDate: string
}

export interface MaintenanceRecord {
  id: string
  date: string // ISO
  mileage: number
  typeId: string // id из регламента или 'custom'
  note: string
  cost: number
}

export interface FuelRecord {
  id: string
  date: string
  mileage: number
  liters: number
  pricePerLiter: number
  fullTank: boolean
}

export type ExpenseCategory =
  | 'service'
  | 'parts'
  | 'insurance'
  | 'tax'
  | 'parking'
  | 'wash'
  | 'tolls'
  | 'other'

export interface ExpenseRecord {
  id: string
  date: string
  category: ExpenseCategory
  description: string
  amount: number
}

export interface MaintenanceType {
  id: string
  name: string
  intervalKm: number | null // интервал по пробегу
  intervalMonths: number | null // интервал по времени
  note: string
}
