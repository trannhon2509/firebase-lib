import { useEffect, useState } from "react";
import {
  collection,
  orderBy,
  query,
  onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

export function useFirestoreCacheOnce(collectionName) { 
  const localKey = `cache_${collectionName}`;
  const [data, setData] = useState([]);

  // Luôn lấy dữ liệu từ localStorage khi khởi tạo
  useEffect(() => {
    const cachedRaw = localStorage.getItem(localKey);
    const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
    setData(cached);
    console.log('Lấy từ store');
  }, [collectionName, localKey]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === localKey) {
        const cachedRaw = localStorage.getItem(localKey);
        const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
        setData(cached);
        console.log('Lấy từ store');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [localKey]);

  // Chỉ cập nhật khi có dữ liệu mới trên Firebase
  useEffect(() => {
    // Hàm chỉ lấy các trường cần so sánh (id, updatedAt)
    const extractCompareFields = (arr) =>
      arr.map((item) => ({
        id: item.id,
        updatedAt: item.updatedAt?.seconds || item.updatedAt || null,
      }));
    const q = query(
      collection(db, collectionName),
      orderBy("updatedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serverData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const cachedRaw = localStorage.getItem(localKey);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
      // So sánh chỉ các trường id, updatedAt
      const serverCompare = extractCompareFields(serverData);
      const cachedCompare = extractCompareFields(cached);
      const isDifferent = JSON.stringify(serverCompare) !== JSON.stringify(cachedCompare);
      console.log('So sánh dữ liệu mới với local:', isDifferent);
      if (isDifferent) {
        localStorage.setItem(localKey, JSON.stringify(serverData));
        setData(serverData);
        console.log('Lấy từ firebase');
      }
    });
    return () => unsubscribe();
  }, [collectionName, localKey]);

  // Thêm tài liệu mới
  const addItem = async (item) => {
    const ref = doc(collection(db, collectionName));
    const newItem = { ...item, updatedAt: { seconds: Math.floor(Date.now() / 1000) } };
    await setDoc(ref, newItem);
    return ref.id;
  };

  // Sửa tài liệu theo id
  const updateItem = async (id, updates) => {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, { ...updates, updatedAt: { seconds: Math.floor(Date.now() / 1000) } });
  };

  // Xóa tài liệu theo id
  const deleteItem = async (id) => {
    const ref = doc(db, collectionName, id);
    await deleteDoc(ref);
  };

  return {
    data,
    addItem,
    updateItem,
    deleteItem,
  };
}
