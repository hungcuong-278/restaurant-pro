# Form Validation Guide

## 📋 Overview

Hệ thống validation nâng cao cho các form đặt bàn và đặt món, đảm bảo dữ liệu hợp lệ và trải nghiệm người dùng tốt hơn.

## 🎯 Features

### 1. **Real-time Validation**
- Validation khi người dùng rời khỏi field (onBlur)
- Hiển thị lỗi ngay lập tức
- Clear error khi người dùng sửa

### 2. **Vietnamese Phone Validation**
Hỗ trợ các định dạng:
- `0xxxxxxxxx` (VD: 0987654321)
- `+84xxxxxxxxx` (VD: +84987654321)
- `84xxxxxxxxx` (VD: 84987654321)

Đầu số hợp lệ: 03, 05, 07, 08, 09

### 3. **Email Validation**
- RFC 5322 compliant regex
- Kiểm tra độ dài (max 254 ký tự)
- User-friendly error messages

### 4. **Party Size Validation**
- Range: 1-20 người
- Thông báo liên hệ trực tiếp cho nhóm lớn hơn 20

### 5. **Business Hours Validation**
- Giờ mở cửa: 11:00 AM - 10:00 PM
- Đóng cửa: Thứ Hai
- Không cho phép đặt bàn trong quá khứ
- Đặt trước ít nhất 30 phút
- Đặt trước tối đa 90 ngày

### 6. **Special Instructions Validation**
- Max 500 ký tự
- Character counter hiển thị số ký tự đã nhập
- XSS prevention (basic)
- Optional field

### 7. **Name Validation**
- Min 2 ký tự
- Max 100 ký tự
- Hỗ trợ ký tự tiếng Việt
- Chỉ chấp nhận chữ cái và khoảng trắng

## 🔧 Usage

### Import Validation Functions

```typescript
import {
  validateName,
  validateEmail,
  validateVietnamesePhone,
  validatePartySize,
  validateBusinessHours,
  validateSpecialInstructions,
  formatVietnamesePhone
} from '../utils/validation';
```

### Basic Validation Example

```typescript
const nameResult = validateName('Nguyễn Văn A');
if (!nameResult.valid) {
  console.error(nameResult.message);
}

const phoneResult = validateVietnamesePhone('0987654321');
if (!phoneResult.valid) {
  console.error(phoneResult.message);
}
```

### Real-time Validation in Forms

```typescript
const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  const result = validateName(value);
  
  if (!result.valid) {
    setErrors(prev => ({
      ...prev,
      [name]: result.message
    }));
  }
};

<input
  name="customer_name"
  onBlur={handleBlur}
  className={errors.customer_name ? 'border-red-500' : 'border-gray-300'}
/>
```

### Combining Multiple Validations

```typescript
import { combineValidations } from '../utils/validation';

const nameResult = validateName(name);
const emailResult = validateEmail(email);
const phoneResult = validateVietnamesePhone(phone);

const finalResult = combineValidations(nameResult, emailResult, phoneResult);

if (!finalResult.valid) {
  console.error(finalResult.message); // First error encountered
}
```

## 📊 Validation Results

All validation functions return a `ValidationResult` object:

```typescript
interface ValidationResult {
  valid: boolean;
  message?: string;
}
```

- `valid`: `true` if validation passed, `false` otherwise
- `message`: Error message (only present when `valid` is `false`)

## 🎨 UI Components

### Error Display

```tsx
{formErrors.customer_name && (
  <p className="text-red-500 text-sm mt-1">
    {formErrors.customer_name}
  </p>
)}
```

### Character Counter

```tsx
<label>
  Special Requests
  <span className="text-gray-500 text-xs ml-2">
    ({text.length}/500 ký tự)
  </span>
</label>
```

### Input Border Colors

```tsx
<input
  className={`w-full px-4 py-2 border rounded-lg ${
    formErrors.field ? 'border-red-500' : 'border-gray-300'
  }`}
/>
```

## 🌐 Vietnamese Messages

All validation messages are in Vietnamese for better user experience:

| Validation | Error Message |
|-----------|--------------|
| Name required | "Vui lòng nhập tên" |
| Email invalid | "Email không hợp lệ. Ví dụ: example@domain.com" |
| Phone invalid | "Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx" |
| Party size too large | "Số người tối đa là 20. Vui lòng liên hệ trực tiếp cho nhóm lớn hơn" |
| Closed Monday | "Nhà hàng đóng cửa vào thứ Hai. Vui lòng chọn ngày khác" |
| Too early | "Nhà hàng mở cửa từ 11:00 sáng. Vui lòng chọn giờ khác" |
| Too late | "Nhà hàng đóng cửa lúc 10:00 tối. Vui lòng chọn giờ trước đó" |

## 🔒 Security Features

### XSS Prevention

Special instructions validation checks for suspicious patterns:
- `<script>` tags
- `javascript:` protocol
- Event handlers (onclick, onerror, etc.)
- `<iframe>` tags

### Input Sanitization

All text inputs are trimmed before validation and submission.

## 📱 Mobile Responsive

- Touch-friendly error messages
- Appropriate input types (`tel`, `email`, `date`, `time`)
- Clear visual feedback
- Large touch targets

## 🧪 Testing

### Test Cases

```typescript
// Name validation
validateName('A');              // Invalid: too short
validateName('Nguyễn Văn A');   // Valid
validateName('123');            // Invalid: numbers not allowed

// Phone validation
validateVietnamesePhone('0987654321');      // Valid
validateVietnamesePhone('+84987654321');    // Valid
validateVietnamesePhone('123456');          // Invalid: wrong format

// Party size
validatePartySize(1);    // Valid
validatePartySize(20);   // Valid
validatePartySize(21);   // Invalid: too large
validatePartySize(0);    // Invalid: too small

// Business hours
validateBusinessHours(new Date('2025-10-06 14:00')); // Invalid: Monday
validateBusinessHours(new Date('2025-10-07 10:00')); // Invalid: too early
validateBusinessHours(new Date('2025-10-07 22:30')); // Invalid: too late
validateBusinessHours(new Date('2025-10-07 14:00')); // Valid
```

## 🚀 Performance

- **No dependencies**: Lightweight, pure TypeScript
- **Instant validation**: No async operations
- **Minimal re-renders**: Only validate on blur or when error exists
- **Tree-shakeable**: Import only what you need

## 📚 API Reference

### `validateName(name: string): ValidationResult`
Validates customer name (2-100 characters, letters only)

### `validateEmail(email: string): ValidationResult`
Validates email address (RFC 5322 compliant)

### `validateVietnamesePhone(phone: string): ValidationResult`
Validates Vietnamese phone numbers (+84, 84, 0 formats)

### `validatePartySize(size: number | string): ValidationResult`
Validates party size (1-20 range)

### `validateBusinessHours(dateTime: Date | string): ValidationResult`
Validates reservation date/time against business hours

### `validateSpecialInstructions(text: string): ValidationResult`
Validates special instructions (max 500 chars, XSS prevention)

### `validateRequired(value: any, fieldName: string): ValidationResult`
Generic required field validation

### `combineValidations(...results: ValidationResult[]): ValidationResult`
Combines multiple validation results, returns first error

### `formatVietnamesePhone(phone: string): string`
Formats phone number for display (0901234567 → 090 123 4567)

## 🎯 Best Practices

1. **Always validate on blur** for better UX
2. **Clear errors on change** when user starts typing
3. **Show character counters** for limited fields
4. **Use appropriate input types** (tel, email, date)
5. **Provide helpful examples** in placeholders
6. **Display errors immediately** after blur
7. **Use Vietnamese messages** for Vietnamese users

## 🔄 Future Enhancements

- [ ] Credit card validation for payments
- [ ] Address validation
- [ ] Time slot availability validation
- [ ] Custom business hours per day
- [ ] Holiday closure validation
- [ ] Maximum advance booking per user type

## 📝 Notes

- All validation functions are **pure** (no side effects)
- **TypeScript** type safety for all functions
- **Internationalization ready** (easy to add English messages)
- **Accessible** error messages for screen readers
