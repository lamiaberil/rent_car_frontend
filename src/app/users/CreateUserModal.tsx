import { useState } from "react"
import { z } from "zod"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { userService } from "@/services/user"

const userSchema = z.object({
  firstName: z.string().min(1, "Ad alanı zorunludur"),
  lastName: z.string().min(1, "Soyad alanı zorunludur"),
  phone: z.string().min(1, "Telefon alanı zorunludur"),
  email: z.string().email("Geçersiz e-posta formatı"),
  tcNo: z.string().length(11, "TC Kimlik No 11 haneli olmalıdır"),
  birthDate: z.string().min(1, "Doğum Tarihi zorunludur"),
  address: z.string().min(1, "Adres zorunludur"),
  city: z.string().min(1, "Şehir zorunludur"),
  driverLicenseNo: z.string().min(1, "Ehliyet No zorunludur"),
  driverLicenseClass: z.string().min(1, "Ehliyet Sınıfı zorunludur"),
  driverLicenseExp: z.string().min(1, "Ehliyet Bitiş Tarihi zorunludur"),
  status: z.enum(["Aktif", "Pasif", "Kara Liste"]),
})

type UserFormData = z.infer<typeof userSchema>

interface CreateUserModalProps {
  onSuccess: () => void
}

export function CreateUserModal({ onSuccess }: CreateUserModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})

  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    tcNo: "",
    birthDate: "",
    address: "",
    city: "",
    driverLicenseNo: "",
    driverLicenseClass: "",
    driverLicenseExp: "",
    status: "Aktif",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for the field being edited
    if (errors[name as keyof UserFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (value: string | null) => {
    if (!value) return;
    setFormData((prev) => ({ ...prev, status: value as "Aktif" | "Pasif" | "Kara Liste" }))
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      tcNo: "",
      birthDate: "",
      address: "",
      city: "",
      driverLicenseNo: "",
      driverLicenseClass: "",
      driverLicenseExp: "",
      status: "Aktif",
    })
    setErrors({})
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    setOpen(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form
      const validData = userSchema.parse(formData)

      setLoading(true)

      // Map frontend fields to backend DTO fields before sending
      const backendData = {
        firstName: validData.firstName,
        lastName: validData.lastName,
        phone: validData.phone,
        email: validData.email,
        identityNumber: validData.tcNo, // mapping tcNo -> identityNumber
        birthDate: validData.birthDate,
        address: validData.address,
        city: validData.city,
        driverLicenseNumber: validData.driverLicenseNo, // mapping driverLicenseNo -> driverLicenseNumber
        driverLicenseClass: validData.driverLicenseClass,
        driverLicenseExpiry: validData.driverLicenseExp, // mapping driverLicenseExp -> driverLicenseExpiry
        // Map status
        status: validData.status === "Aktif" ? "ACTIVE" : validData.status === "Pasif" ? "PASSIVE" : "BLACKLIST",
      }

      await userService.createUser(backendData as any)

      toast.success("✅ Kullanıcı başarıyla oluşturuldu.")
      onSuccess()
      setOpen(false)
      resetForm()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        const zodError = error as z.ZodError<any>;
        zodError.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      } else {
        toast.error("Kayıt oluşturulurken bir hata oluştu.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="shadow-sm gap-2" />}>
        <UserPlus className="w-4 h-4" />
        Yeni Kullanıcı
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
          <DialogDescription>
            Sisteme yeni müşteri ekleyin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ad</label>
                <Input name="firstName" value={formData.firstName} onChange={handleChange} />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Soyad</label>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon</label>
                <Input name="phone" placeholder="+90..." value={formData.phone} onChange={handleChange} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-posta</label>
                <Input name="email" type="email" placeholder="ornek@email.com" value={formData.email} onChange={handleChange} />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">TC Kimlik No</label>
                <Input name="tcNo" maxLength={11} value={formData.tcNo} onChange={handleChange} />
                {errors.tcNo && <p className="text-xs text-red-500">{errors.tcNo}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Doğum Tarihi</label>
                <Input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
                {errors.birthDate && <p className="text-xs text-red-500">{errors.birthDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Şehir</label>
                <Input name="city" value={formData.city} onChange={handleChange} />
                {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adres</label>
                <Input name="address" value={formData.address} onChange={handleChange} />
                {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Ehliyet Bilgileri</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ehliyet No</label>
                <Input name="driverLicenseNo" value={formData.driverLicenseNo} onChange={handleChange} />
                {errors.driverLicenseNo && <p className="text-xs text-red-500">{errors.driverLicenseNo}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sınıf</label>
                <Input name="driverLicenseClass" placeholder="B" value={formData.driverLicenseClass} onChange={handleChange} />
                {errors.driverLicenseClass && <p className="text-xs text-red-500">{errors.driverLicenseClass}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bitiş Tarihi</label>
                <Input name="driverLicenseExp" type="date" value={formData.driverLicenseExp} onChange={handleChange} />
                {errors.driverLicenseExp && <p className="text-xs text-red-500">{errors.driverLicenseExp}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Hesap Durumu</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <Select value={formData.status as string} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Pasif">Pasif</SelectItem>
                  <SelectItem value="Kara Liste">Kara Liste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
