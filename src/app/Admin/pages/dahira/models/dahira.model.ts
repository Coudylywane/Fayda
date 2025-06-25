

export interface CreateDahira{
  dahiraName: string,
  email: string,
  phoneNumber: string,
  location: {
    country: string,
    region: string,
    department: string,
    nationality?: string,
    address: string
  }
}