# วิธีการปรับ Required/Optional Fields ใน Zod Schema

## 1. Required Field (บังคับกรอก)

### String Required
```typescript
// ต้องกรอก และต้องมีอย่างน้อย 1 ตัวอักษร
licensePlate: z.string().min(1, "License plate is required")

// ต้องกรอก และต้องมีความยาว 17 ตัวอักษร
vin: z.string().length(17, "VIN must be exactly 17 characters")
```

### Enum Required
```typescript
truckStatus: z.enum(["active", "inactive", "maintenance"], {
    message: "Truck status is required"
})
```

### Number Required
```typescript
// ต้องกรอก และต้องเป็นตัวเลข
price: z.number().min(0, "Price must be positive")
```

---

## 2. Optional Field (ไม่บังคับกรอก)

### String Optional
```typescript
// ไม่บังคับกรอก
notes: z.string().optional()

// ไม่บังคับกรอก แต่ถ้ากรอกต้องมีอย่างน้อย 5 ตัวอักษร
description: z.string().min(5, "Description must be at least 5 characters").optional()

// ไม่บังคับกรอก และมีค่า default
notes: z.string().optional().default("")
```

### Number Optional
```typescript
// ใช้ helper function ที่มีอยู่แล้ว
engineCapacity: optionalNumber(0, 20000, "Engine capacity")

// หรือใช้แบบตรงๆ
price: z.number().optional()
price: z.number().min(0).optional()
```

---

## 3. เปลี่ยนจาก Required เป็น Optional

### ตัวอย่างที่ 1: driver field
```typescript
// เดิม (Required)
driver: z.string().min(1, "Driver is required")

// เปลี่ยนเป็น (Optional)
driver: z.string().min(1, "Driver is required").optional()
// หรือ
driver: z.string().optional()
```

### ตัวอย่างที่ 2: registrationDate field
```typescript
// เดิม (Required)
registrationDate: z.string().min(1, "Registration date is required")

// เปลี่ยนเป็น (Optional)
registrationDate: z.string().min(1, "Registration date is required").optional()
```

---

## 4. เปลี่ยนจาก Optional เป็น Required

### ตัวอย่างที่ 1: notes field
```typescript
// เดิม (Optional)
notes: z.string().optional()

// เปลี่ยนเป็น (Required)
notes: z.string().min(1, "Notes is required")
```

### ตัวอย่างที่ 2: engineCapacity field
```typescript
// เดิม (Optional)
engineCapacity: optionalNumber(0, 20000, "Engine capacity")

// เปลี่ยนเป็น (Required) - ต้องสร้าง helper ใหม่
engineCapacity: z.preprocess(
    (val) => {
        if (val === "" || val === null || val === undefined) {
            throw new Error("Engine capacity is required");
        }
        if (typeof val === "string") {
            const num = parseFloat(val);
            if (isNaN(num)) throw new Error("Engine capacity must be a number");
            return num;
        }
        return typeof val === "number" ? val : undefined;
    },
    z.number()
        .min(0, "Engine capacity must be at least 0")
        .max(20000, "Engine capacity cannot exceed 20000")
)
```

---

## 5. Conditional Required (Required เมื่อเงื่อนไขเป็นจริง)

```typescript
// Required เมื่อ field อื่นมีค่า
truckSchema = z.object({
    hasInsurance: z.boolean(),
    insuranceNumber: z.string().optional(),
}).refine(
    (data) => {
        // ถ้า hasInsurance เป็น true ต้องกรอก insuranceNumber
        if (data.hasInsurance && !data.insuranceNumber) {
            return false;
        }
        return true;
    },
    {
        message: "Insurance number is required when truck has insurance",
        path: ["insuranceNumber"]
    }
)
```

---

## 6. Nullable Field (รับค่า null ได้)

```typescript
// รับค่า null ได้ แต่ถ้ากรอกต้องเป็น string
description: z.string().nullable()

// รับค่า null หรือ undefined ได้
description: z.string().nullable().optional()

// รับค่า null ได้ และมี default เป็น null
description: z.string().nullable().default(null)
```

---

## 7. ตัวอย่างการใช้งานจริง

### เปลี่ยน driver จาก Required เป็น Optional
```typescript
// ใน truckSchema.ts
export const truckSchema = z.object({
    // ... other fields
    driver: z.string().min(1, "Driver is required").optional(), // เพิ่ม .optional()
    // ... other fields
});

// ใน truckDefaultValues
export const truckDefaultValues: TruckFormValues = {
    // ... other fields
    driver: "", // หรือ undefined
    // ... other fields
};
```

### เปลี่ยน notes จาก Optional เป็น Required
```typescript
// ใน truckSchema.ts
export const truckSchema = z.object({
    // ... other fields
    notes: z.string().min(1, "Notes is required"), // ลบ .optional()
    // ... other fields
});

// ใน truckDefaultValues
export const truckDefaultValues: TruckFormValues = {
    // ... other fields
    notes: "", // ต้องมีค่า default
    // ... other fields
};
```

---

## สรุป

- **Required**: ไม่ต้องใส่ `.optional()` และต้องมี validation (เช่น `.min(1)`)
- **Optional**: ใส่ `.optional()` ท้ายสุด
- **Nullable**: ใส่ `.nullable()` ก่อน `.optional()`
- **Default**: ใส่ `.default(value)` สำหรับค่าเริ่มต้น
