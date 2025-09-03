import React, { useState } from 'react';
import { deleteFileByUrl } from '../services/uploadService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

/**
 * Example component demonstrating UploadThing file deletion functionality.
 * This is for demonstration purposes - remove from production builds.
 */
const FileDeleteExample = () => {
  const [fileUrl, setFileUrl] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [results, setResults] = useState(null);

  const handleDeleteByUrl = async () => {
    if (!fileUrl.trim()) {
      toast.error('Please enter a file URL');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteFileByUrl(fileUrl.trim());
      setResults(result);
      
      if (result.success) {
        toast.success(result.message || 'File deleted successfully!');
        setFileUrl('');
      } else {
        toast.error(result.message || 'Failed to delete file');
      }
    } catch (error) {
      toast.error('Failed to delete file');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>UploadThing File Deletion Examples</CardTitle>
          <CardDescription>
            Test the file deletion functionality. Make sure you have VITE_UPLOADTHING_SECRET set in your environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Delete by URL */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Delete File by URL</h3>
            <p className="text-sm text-muted-foreground">
              Enter the UploadThing file URL that you have stored in your database
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://utfs.io/f/your-file-key.jpg"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleDeleteByUrl}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete File'}
              </Button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Results</h3>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Usage Examples */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Usage Examples</h3>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">In your components:</p>
              <pre className="text-xs overflow-auto">
{`import { deleteFileByUrl } from '../services/uploadService';

// Delete a hotel photo
const handleDeletePhoto = async (photoUrl) => {
  const result = await deleteFileByUrl(photoUrl);
  if (result.success) {
    // Update your state, show success message
    toast.success('Photo deleted!');
    // Remove from your local state
    setPhotos(prev => prev.filter(photo => photo.url !== photoUrl));
  } else {
    toast.error(result.message);
  }
};

// Delete verification document
const handleDeleteDocument = async (documentUrl) => {
  const result = await deleteFileByUrl(documentUrl);
  if (result.success) {
    toast.success('Document deleted!');
    // Update your form state
    setFormData(prev => ({ ...prev, documentUrl: null }));
  }
};`}
              </pre>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default FileDeleteExample;
