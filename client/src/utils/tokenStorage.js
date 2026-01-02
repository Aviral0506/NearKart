// IndexedDB helper for storing tokens persistently on mobile
const DB_NAME = 'NearKartDB';
const STORE_NAME = 'tokens';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveTokens = async (accesstoken, refreshToken) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Save to IndexedDB (persistent)
    store.put(accesstoken, 'accesstoken');
    store.put(refreshToken, 'refreshToken');
    
    // Also save to localStorage as backup
    localStorage.setItem('accesstoken', accesstoken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
};

export const getTokens = async () => {
  try {
    // Try IndexedDB first (persistent on mobile)
    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const accesstoken = await new Promise((resolve, reject) => {
        const request = store.get('accesstoken');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const refreshToken = await new Promise((resolve, reject) => {
        const request = store.get('refreshToken');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (accesstoken && refreshToken) {
        console.log('Tokens retrieved from IndexedDB');
        return { accesstoken, refreshToken };
      }
    } catch (err) {
      console.log('IndexedDB failed, trying localStorage:', err);
    }
    
    // Fallback to localStorage
    const accesstoken = localStorage.getItem('accesstoken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accesstoken && refreshToken) {
      console.log('Tokens retrieved from localStorage');
      return { accesstoken, refreshToken };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting tokens:', error);
    return null;
  }
};

export const clearTokens = async () => {
  try {
    // Clear IndexedDB
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    
    // Clear localStorage
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('refreshToken');
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error clearing tokens:', error);
    throw error;
  }
};
