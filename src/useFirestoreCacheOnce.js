import { useEffect, useState } from "react";
import {
  collection,
  orderBy,
  query,
  onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

export function useFirestoreCacheOnce(collectionName, pageSize = 10) {
  const localKey = `cache_${collectionName}`;
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Luôn lấy dữ liệu từ localStorage khi khởi tạo
  useEffect(() => {
    const cachedRaw = localStorage.getItem(localKey);
    const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
    setData(cached);
    setHasMore(cached.length > pageSize);
    setPage(1);
    console.log('[FirestoreCache] Load from localStorage:', cached);
  }, [collectionName, localKey, pageSize]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === localKey) {
        const cachedRaw = localStorage.getItem(localKey);
        const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
        setData(cached);
        setHasMore(cached.length > pageSize);
        setPage(1);
        console.log('[FirestoreCache] Storage event, load from localStorage:', cached);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [localKey, pageSize]);

  // Lắng nghe realtime Firestore bằng onSnapshot
  useEffect(() => {
    const q = query(
      collection(db, collectionName),
      orderBy("updatedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serverData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      localStorage.setItem(localKey, JSON.stringify(serverData));
      setData(serverData);
      setHasMore(serverData.length > pageSize);
      setPage(1);
      console.log('[FirestoreCache] onSnapshot update:', serverData);
    });
    return () => unsubscribe();
  }, [collectionName, localKey, pageSize]);

  const pagedData = data.slice(0, page * pageSize);

  const loadMore = () => {
    const nextPage = page + 1;
    const nextPaged = data.slice(0, nextPage * pageSize);
    setPage(nextPage);
    setHasMore(nextPaged.length < data.length);
  };

  // Thêm tài liệu mới
  const addItem = async (item) => {
    const ref = doc(collection(db, collectionName));
    const newItem = { ...item, updatedAt: { seconds: Math.floor(Date.now() / 1000) } };
    await setDoc(ref, newItem);
    // Không cần gọi checkNeedUpdate nữa vì đã có onSnapshot
    return ref.id;
  };

  // Sửa tài liệu theo id
  const updateItem = async (id, updates) => {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, { ...updates, updatedAt: { seconds: Math.floor(Date.now() / 1000) } });
    // Không cần gọi checkNeedUpdate nữa
  };

  // Xóa tài liệu theo id
  const deleteItem = async (id) => {
    const ref = doc(db, collectionName, id);
    await deleteDoc(ref);
    // Không cần gọi checkNeedUpdate nữa
  };

  return {
    data: pagedData,
    loadMore,
    hasMore,
    refresh: () => {}, // Không cần refresh thủ công nữa
    addItem,
    updateItem,
    deleteItem,
  };
}
