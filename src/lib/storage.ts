import { getToken } from './auth';

export const uploadImage = async (
  file: File, 
  userId: string, 
  bucket: string = 'blog-images'
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (userId) formData.append('userId', userId);

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Upload failed' } }));
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Error uploading image. Please try again.');
    return null;
  }
};

export const deleteImage = async (path: string, bucket: string = 'blog-images'): Promise<boolean> => {
  try {
    const token = getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/storage/delete', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ path, bucket }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Delete failed' } }));
      throw new Error(error.error?.message || 'Delete failed');
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};