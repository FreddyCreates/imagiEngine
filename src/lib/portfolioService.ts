import { db, auth, handleFirestoreError, OperationType, getCurrentUserId } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  updateDoc, 
  getDoc,
  where
} from 'firebase/firestore';
import { GeneratedImage, PortfolioCollection } from '../types/creator';

/**
 * Fetch all portfolios from Firestore sorted by createdAt descending.
 */
export async function fetchPortfolios(): Promise<PortfolioCollection[]> {
  try {
    const userId = getCurrentUserId();
    const q = query(collection(db, 'portfolios'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const list: PortfolioCollection[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as PortfolioCollection);
    });
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, 'portfolios');
    return [];
  }
}

/**
 * Create a new portfolio collection in Firestore.
 */
export async function createPortfolio(
  name: string, 
  description: string = 'Curated generative AI creative collection', 
  initialItems: GeneratedImage[] = []
): Promise<PortfolioCollection> {
  const userId = getCurrentUserId();
  const newPortfolioData = {
    name,
    description,
    items: initialItems,
    createdAt: Date.now(),
    userId
  };

  try {
    const docRef = await addDoc(collection(db, 'portfolios'), newPortfolioData);
    return {
      id: docRef.id,
      ...newPortfolioData
    };
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, 'portfolios');
    throw e;
  }
}

/**
 * Add a generated image asset to a specific portfolio collection in Firestore.
 */
export async function addImageToPortfolio(
  portfolioId: string, 
  image: GeneratedImage
): Promise<boolean> {
  try {
    const portfolioRef = doc(db, 'portfolios', portfolioId);
    const docSnap = await getDoc(portfolioRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentItems: GeneratedImage[] = data.items || [];

      // Avoid duplicates
      if (!currentItems.some((item: any) => item.id === image.id || item.url === image.url)) {
        const updatedItems = [image, ...currentItems];
        await updateDoc(portfolioRef, { items: updatedItems });
      }
      return true;
    }
    return false;
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `portfolios/${portfolioId}`);
    return false;
  }
}

/**
 * Automatically save image to default "Main Studio Portfolio" (creates if doesn't exist).
 */
export async function autoSaveToDefaultPortfolio(image: GeneratedImage): Promise<void> {
  try {
    const portfolios = await fetchPortfolios();
    let defaultPortfolio = portfolios.find((p) => p.name === 'Main Studio Portfolio' || p.name === 'General Portfolio');

    if (!defaultPortfolio) {
      defaultPortfolio = await createPortfolio(
        'Main Studio Portfolio', 
        'Default automated collection for generated studio assets', 
        [image]
      );
    } else {
      await addImageToPortfolio(defaultPortfolio.id, image);
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'portfolios');
  }
}

/**
 * Remove an item from a specific portfolio.
 */
export async function removeImageFromPortfolio(
  portfolioId: string, 
  imageId: string
): Promise<boolean> {
  try {
    const portfolioRef = doc(db, 'portfolios', portfolioId);
    const docSnap = await getDoc(portfolioRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentItems: GeneratedImage[] = data.items || [];
      const updatedItems = currentItems.filter((item: any) => item.id !== imageId);
      await updateDoc(portfolioRef, { items: updatedItems });
      return true;
    }
    return false;
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `portfolios/${portfolioId}`);
    return false;
  }
}

/**
 * Delete an entire portfolio collection.
 */
export async function deletePortfolio(portfolioId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'portfolios', portfolioId));
    return true;
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `portfolios/${portfolioId}`);
    return false;
  }
}

