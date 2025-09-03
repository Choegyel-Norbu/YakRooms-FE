# UploadThing File Deletion Guide

## Overview

This guide provides comprehensive solutions for deleting files from UploadThing, including both client-side and server-side approaches.

## 🔧 Client-Side Implementation (Current)

The `uploadService.jsx` now includes a simple and focused delete function:

### Available Functions

1. **`deleteFileByUrl(fileUrl)`** - Delete by UploadThing URL (Main method)
2. **`extractFileKeyFromUrl(url)`** - Extract file key from URL (Helper function)

### Usage Examples

```javascript
import { deleteFileByUrl } from '../shared/services/uploadService';

// Delete by URL (this is what you'll use most)
const result = await deleteFileByUrl('https://utfs.io/f/abc123_image.jpg');

if (result.success) {
  console.log('File deleted successfully!');
  // Update your UI state
} else {
  console.error('Failed to delete:', result.message);
}
```

## 🛡️ Server-Side Implementation (Recommended)

For production applications, it's **strongly recommended** to implement file deletion on the server side to keep your UploadThing secret secure.

### Spring Boot Backend Implementation

Create a new controller in your Spring Boot backend:

```java
@RestController
@RequestMapping("/api/uploadthing")
@CrossOrigin(origins = "*")
public class UploadThingController {
    
    @Value("${uploadthing.secret}")
    private String uploadThingSecret;
    
    private final RestTemplate restTemplate;
    
    public UploadThingController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteFile(@RequestBody DeleteFileRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Uploadthing-Api-Key", uploadThingSecret);
            
            Map<String, String> body = new HashMap<>();
            body.put("fileKey", request.getFileKey());
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                "https://api.uploadthing.com/api/deleteFile",
                HttpMethod.DELETE,
                entity,
                String.class
            );
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "File deleted successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Failed to delete file: " + e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<?> deleteMultipleFiles(@RequestBody DeleteMultipleFilesRequest request) {
        List<Map<String, Object>> results = new ArrayList<>();
        int successCount = 0;
        
        for (String fileKey : request.getFileKeys()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("X-Uploadthing-Api-Key", uploadThingSecret);
                
                Map<String, String> body = new HashMap<>();
                body.put("fileKey", fileKey);
                
                HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
                
                restTemplate.exchange(
                    "https://api.uploadthing.com/api/deleteFile",
                    HttpMethod.DELETE,
                    entity,
                    String.class
                );
                
                results.add(Map.of(
                    "fileKey", fileKey,
                    "success", true,
                    "message", "File deleted successfully"
                ));
                successCount++;
                
            } catch (Exception e) {
                results.add(Map.of(
                    "fileKey", fileKey,
                    "success", false,
                    "message", "Failed to delete file: " + e.getMessage()
                ));
            }
        }
        
        return ResponseEntity.ok().body(Map.of(
            "success", successCount == request.getFileKeys().size(),
            "message", String.format("Deleted %d/%d files", successCount, request.getFileKeys().size()),
            "results", results
        ));
    }
}

// Request DTOs
class DeleteFileRequest {
    private String fileKey;
    
    public String getFileKey() { return fileKey; }
    public void setFileKey(String fileKey) { this.fileKey = fileKey; }
}

class DeleteMultipleFilesRequest {
    private List<String> fileKeys;
    
    public List<String> getFileKeys() { return fileKeys; }
    public void setFileKeys(List<String> fileKeys) { this.fileKeys = fileKeys; }
}
```

### Frontend Service Update

Update your frontend service to use the backend endpoint:

```javascript
// Add to uploadService.jsx
export const deleteFileViaBackend = async (fileUrl) => {
  try {
    const response = await api.delete('/uploadthing/delete', {
      data: { fileUrl } // Send the URL directly
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete file via backend:', error);
    throw error;
  }
};
```

## 🔑 Environment Variables

### Frontend (.env.local)
```bash
VITE_UPLOADTHING_SECRET=your_uploadthing_secret_here
```

### Backend (application.properties)
```properties
uploadthing.secret=your_uploadthing_secret_here
```

## 📋 UploadThing API Endpoints

- **Delete Single File**: `DELETE https://api.uploadthing.com/api/deleteFile`
- **Headers Required**: 
  - `Content-Type: application/json`
  - `X-Uploadthing-Api-Key: your_secret_key`
- **Request Body**: `{ "fileKey": "your_file_key" }`

## 🚨 Security Considerations

1. **Never expose your UploadThing secret in frontend code** for production
2. **Use server-side deletion** for production applications
3. **Implement proper authentication** before allowing file deletion
4. **Validate file ownership** before deletion
5. **Log all deletion attempts** for audit purposes

## 🔄 Integration with Your App

### Hotel Photo Management Example

```javascript
// In your hotel management component
const handleDeletePhoto = async (photoUrl) => {
  try {
    const result = await deleteFileByUrl(photoUrl);
    
    if (result.success) {
      // Update your local state
      setPhotos(prev => prev.filter(photo => photo.url !== photoUrl));
      
      // Show success message
      toast.success('Photo deleted successfully');
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    toast.error('Failed to delete photo');
    console.error('Delete error:', error);
  }
};
```

### Document Management Example

```javascript
// Delete verification documents
const handleDeleteDocument = async (documentUrl) => {
  try {
    const result = await deleteFileByUrl(documentUrl);
    
    if (result.success) {
      // Update form state
      setFormData(prev => ({ 
        ...prev, 
        documentUrl: null,
        documentName: null 
      }));
      
      toast.success('Document deleted successfully');
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    toast.error('Failed to delete document');
    console.error('Delete error:', error);
  }
};
```

## 🧪 Testing

Test the deletion functionality:

```javascript
// Test file key extraction
const testUrl = 'https://utfs.io/f/abc123_test.jpg';
const fileKey = extractFileKeyFromUrl(testUrl);
console.log('Extracted key:', fileKey); // Should log: abc123_test.jpg

// Test deletion (use a test file)
const result = await deleteFileByUrl(testUrl);
console.log('Deletion result:', result);

// Test with your actual database URLs
const photoUrl = 'https://utfs.io/f/your-actual-file-key.jpg';
const result = await deleteFileByUrl(photoUrl);
if (result.success) {
  console.log('✅ File deleted successfully');
} else {
  console.log('❌ Deletion failed:', result.message);
}
```

## 📚 Additional Resources

- [UploadThing Documentation](https://docs.uploadthing.com/)
- [UploadThing API Reference](https://docs.uploadthing.com/api-reference)
- [Spring Boot REST Template](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/client/RestTemplate.html)
