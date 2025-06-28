import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
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
  }, [collectionName, localKey, pageSize]);

  // Lắng nghe sự kiện storage để tự động cập nhật khi localStorage thay đổi ở tab khác
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === localKey) {
        const cachedRaw = localStorage.getItem(localKey);
        const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
        setData(cached);
        setHasMore(cached.length > pageSize);
        setPage(1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [localKey, pageSize]);

  // Chỉ kiểm tra và cập nhật nếu có dữ liệu mới trên Firestore
  const checkNeedUpdate = useCallback(async () => {
    const cachedRaw = localStorage.getItem(localKey);
    const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
    const latestLocal = cached[0]?.updatedAt?.seconds || 0;

    // Lấy updatedAt mới nhất trên server
    const q = query(
      collection(db, collectionName),
      orderBy("updatedAt", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    const latestServer = snapshot.docs[0]?.data()?.updatedAt?.seconds || 0;

    if (latestServer > latestLocal) {
      // Có dữ liệu mới, lấy toàn bộ và cập nhật localStorage
      const allQ = query(
        collection(db, collectionName),
        orderBy("updatedAt", "desc")
      );
      const allSnap = await getDocs(allQ);
      const serverData = allSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      localStorage.setItem(localKey, JSON.stringify(serverData));
      setData(serverData);
      setHasMore(serverData.length > pageSize);
      setPage(1);
    }
    // Nếu không có dữ liệu mới thì không làm gì, giữ nguyên local
  }, [collectionName, localKey, pageSize]);

  useEffect(() => {
    checkNeedUpdate();
    // eslint-disable-next-line
  }, [collectionName]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkNeedUpdate();
    }, 30000); // Kiểm tra mỗi 30 giây
    return () => clearInterval(interval);
  }, [collectionName, checkNeedUpdate]);

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
    await checkNeedUpdate();
    return ref.id;
  };

  // Sửa tài liệu theo id
  const updateItem = async (id, updates) => {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, { ...updates, updatedAt: { seconds: Math.floor(Date.now() / 1000) } });
    await checkNeedUpdate();
  };

  // Xóa tài liệu theo id
  const deleteItem = async (id) => {
    const ref = doc(db, collectionName, id);
    await deleteDoc(ref);
    await checkNeedUpdate();
  };

  return {
    data: pagedData,
    loadMore,
    hasMore,
    refresh: checkNeedUpdate,
    addItem,
    updateItem,
    deleteItem,
  };
}
