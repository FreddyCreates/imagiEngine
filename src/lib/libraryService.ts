import { db, auth, handleFirestoreError, OperationType, getCurrentUserId } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { GeneratedImage, UserLibraryItem } from '../types/creator';



/**
 * Save an image to the user's persistent library collection in Firestore.
 */
export async function saveImageToLibrary(
  img: GeneratedImage, 
  notes: string = '', 
  tags: string[] = []
): Promise<UserLibraryItem> {
  const userId = getCurrentUserId();
  const libraryData = {
    imageId: img.id,
    userId,
    url: img.url,
    prompt: img.prompt,
    caption: img.caption || img.prompt,
    style: img.style,
    aspectRatio: img.aspectRatio,
    savedAt: Date.now(),
    createdAt: img.createdAt || Date.now(),
    tags: tags.length > 0 ? tags : (img.tags || []),
    notes,
    version: img.version || 1,
    metadata: img.metadata || {},
    marketingOverlay: img.marketingOverlay || null
  };

  try {
    const docRef = await addDoc(collection(db, 'user_library'), libraryData);
    const createdItem: UserLibraryItem = {
      id: docRef.id,
      ...libraryData
    };

    // Also update generated_images if it has a matching doc
    if (img.id && !img.id.startsWith('img_sample_')) {
      try {
        await updateDoc(doc(db, 'generated_images', img.id), {
          savedToLibrary: true,
          savedAt: Date.now(),
          userId
        });
      } catch (e) {
        // Safe fallback if doc doesn't exist in generated_images yet
      }
    }

    return createdItem;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'user_library');
    throw error;
  }
}

/**
 * Remove an item from the user's persistent library collection in Firestore.
 */
export async function removeFromLibrary(libraryDocIdOrImageId: string): Promise<boolean> {
  const userId = getCurrentUserId();
  try {
    // Check if passed string is directly the library document ID
    const directDocRef = doc(db, 'user_library', libraryDocIdOrImageId);
    try {
      await deleteDoc(directDocRef);
      return true;
    } catch {
      // Query by imageId + userId if direct doc delete fails
      const q = query(
        collection(db, 'user_library'),
        where('userId', '==', userId),
        where('imageId', '==', libraryDocIdOrImageId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'user_library', docSnap.id));
      });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `user_library`);
    return false;
  }
}

/**
 * Fetch all items saved in the user's persistent Firebase library.
 */
export async function fetchUserLibrary(): Promise<UserLibraryItem[]> {
  const userId = getCurrentUserId();
  try {
    const q = query(
      collection(db, 'user_library'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const list: UserLibraryItem[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as UserLibraryItem);
    });

    // Sort client-side by savedAt descending
    return list.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'user_library');
    return [];
  }
}

/**
 * Update notes or tags for a library item in Firestore.
 */
export async function updateLibraryNotes(
  libraryItemId: string,
  notes: string,
  tags?: string[]
): Promise<void> {
  try {
    const itemRef = doc(db, 'user_library', libraryItemId);
    const payload: any = { notes };
    if (tags) payload.tags = tags;
    await updateDoc(itemRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `user_library/${libraryItemId}`);
  }
}

