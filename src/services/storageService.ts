import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
  /**
   * Upload a file to Firebase Storage
   * @param file The file to upload
   * @param path The path in storage (e.g., 'users/123/profile.jpg')
   */
  uploadFile: async (file: File, path: string): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
};
