# Image Upload API - Quick Reference

## Upload Images to Property

**Endpoint:** `POST /api/properties/:id/images`

**Authentication:** Required (Bearer token)

**Authorization:** Agent or Admin only (must own the property)

**Content-Type:** `multipart/form-data`

**Request:**
```bash
# Using curl (PowerShell)
$token = "YOUR_JWT_TOKEN"
$propertyId = "YOUR_PROPERTY_ID"

Invoke-WebRequest -Uri "http://localhost:5000/api/properties/$propertyId/images" `
  -Method Post `
  -Headers @{Authorization="Bearer $token"} `
  -Form @{
    images = Get-Item "C:\path\to\image1.jpg"
    images = Get-Item "C:\path\to\image2.jpg"
  }
```

**Parameters:**
- `images` - One or more image files (max 10)
- Supported formats: JPEG, JPG, PNG, GIF, WebP
- Max file size: 5MB per image

**Response:**
```json
{
  "message": "Images uploaded successfully",
  "images": [
    "/uploads/properties/villa-1234567890.jpg",
    "/uploads/properties/villa-9876543210.jpg"
  ],
  "uploadedCount": 2
}
```

---

## Delete Property Image

**Endpoint:** `DELETE /api/properties/:id/images`

**Authentication:** Required (Bearer token)

**Authorization:** Agent or Admin only (must own the property)

**Request Body:**
```json
{
  "imageUrl": "/uploads/properties/villa-1234567890.jpg"
}
```

**Response:**
```json
{
  "message": "Image deleted successfully",
  "images": [
    "/uploads/properties/villa-9876543210.jpg"
  ]
}
```

---

## Access Uploaded Images

**Endpoint:** `GET /uploads/properties/:filename`

**Public:** Yes

**Example:**
```
http://localhost:5000/uploads/properties/villa-1234567890.jpg
```

---

## Upload Limits & Validation

- **Maximum files per upload:** 10 images
- **File size limit:** 5MB per image
- **Allowed formats:** JPEG, JPG, PNG, GIF, WebP
- **Storage location:** `uploads/properties/`
- **Filename format:** `originalname-timestamp-random.ext`

---

## Error Responses

**400 Bad Request:**
```json
{
  "error": "No files uploaded",
  "message": "Please select at least one image to upload"
}
```

**400 Bad Request (Invalid file type):**
```json
{
  "error": "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "User not authenticated"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to update this property"
}
```

**404 Not Found:**
```json
{
  "error": "Property not found",
  "message": "The requested property does not exist"
}
```

---

## Usage Example (Complete Flow)

### 1. Login to get token
```bash
POST /api/auth/login
{
  "email": "agent@example.com",
  "password": "password123"
}
```

### 2. Create a property
```bash
POST /api/properties
Authorization: Bearer YOUR_TOKEN
{
  "title": "Luxury Villa",
  "city": "Malibu",
  ...
}
# Returns property with ID
```

### 3. Upload images
```bash
POST /api/properties/{propertyId}/images
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Form data:
- images: [file1.jpg, file2.jpg, file3.jpg]
```

### 4. View property with images
```bash
GET /api/properties/{propertyId}
# Returns property with images array:
{
  "property": {
    "id": "...",
    "title": "Luxury Villa",
    "images": [
      "/uploads/properties/villa-123.jpg",
      "/uploads/properties/villa-456.jpg"
    ],
    ...
  }
}
```

### 5. Access image directly
```
http://localhost:5000/uploads/properties/villa-123.jpg
```
