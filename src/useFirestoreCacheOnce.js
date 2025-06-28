import { useEffect, useState, useCallback } from "react";
import {
  collection,
  orderBy,
  query,
  getDocs,
  limit,
  startAfter,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";

export function useFirestoreCacheOnce(collectionName, pageSize = 10) {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisibleDocs, setLastVisibleDocs] = useState({}); // Lưu doc cuối mỗi trang

  // Helper: Tạo key cache chung cho collection
  const getCacheKey = useCallback(() => `cache_${collectionName}`, [collectionName]);

  // Lấy tổng số lượng document để tính totalPages
  useEffect(() => {
    async function fetchTotal() {
      const q = query(collection(db, collectionName));
      const snapshot = await getDocs(q);
      setTotalPages(Math.max(1, Math.ceil(snapshot.size / pageSize)));
    }
    fetchTotal();
  }, [collectionName, pageSize]);

  // Lấy dữ liệu trang hiện tại từ localStorage hoặc Firestore
  useEffect(() => {
    const cacheKey = getCacheKey();
    const cachedRaw = localStorage.getItem(cacheKey);
    let cachedObj = {};
    if (cachedRaw) {
      try {
        cachedObj = JSON.parse(cachedRaw) || {};
      } catch {
        cachedObj = {};
      }
    }
    if (cachedObj[currentPage]) {
      setData(cachedObj[currentPage]);
      return;
    }
    // Nếu chưa có cache thì lấy từ Firestore
    async function fetchPage() {
      let q = query(collection(db, collectionName), orderBy("updatedAt", "desc"), limit(pageSize));
      // Nếu không phải trang đầu, cần startAfter doc cuối của trang trước
      if (currentPage > 1 && lastVisibleDocs[currentPage - 1]) {
        q = query(q, startAfter(lastVisibleDocs[currentPage - 1]));
      }
      const snapshot = await getDocs(q);
      const docsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(docsData);
      // Lưu cache toàn bộ các trang vào 1 object
      const newCache = { ...cachedObj, [currentPage]: docsData };
      localStorage.setItem(cacheKey, JSON.stringify(newCache));
      // Lưu doc cuối cùng của trang này để phân trang tiếp
      setLastVisibleDocs((prev) => ({ ...prev, [currentPage]: snapshot.docs[snapshot.docs.length - 1] }));
    }
    fetchPage();
    // eslint-disable-next-line
  }, [collectionName, currentPage, pageSize]);

  // Lắng nghe sự kiện chuyển tab (storage event)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === getCacheKey()) {
        const cachedRaw = localStorage.getItem(e.key);
        let cachedObj = {};
        try {
          cachedObj = JSON.parse(cachedRaw) || {};
        } catch {
          cachedObj = {};
        }
        setData(cachedObj[currentPage] || []);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [collectionName, currentPage, getCacheKey]);

  // Các hàm phân trang
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Thêm tài liệu mới
  const addItem = async (item) => {
    const ref = doc(collection(db, collectionName));
    const newItem = { ...item, updatedAt: { seconds: Math.floor(Date.now() / 1000) } };
    await setDoc(ref, newItem);
    // Xóa cache chung để lần tới sẽ fetch lại
    localStorage.removeItem(getCacheKey());
    setCurrentPage(1); // Quay về trang đầu
    return ref.id;
  };

  // Sửa tài liệu theo id
  const updateItem = async (id, updates) => {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, { ...updates, updatedAt: { seconds: Math.floor(Date.now() / 1000) } });
    localStorage.removeItem(getCacheKey());
    setCurrentPage(1);
  };

  // Xóa tài liệu theo id
  const deleteItem = async (id) => {
    const ref = doc(db, collectionName, id);
    await deleteDoc(ref);
    localStorage.removeItem(getCacheKey());
    setCurrentPage(1);
  };

  // Lấy toàn bộ cache (dữ liệu tất cả các trang)
  const getAllCache = () => {
    const cacheKey = getCacheKey();
    const cachedRaw = localStorage.getItem(cacheKey);
    try {
      return JSON.parse(cachedRaw) || {};
    } catch {
      return {};
    }
  };

  return {
    data,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    pageSize,
    refresh: () => {
      localStorage.removeItem(getCacheKey());
      setCurrentPage(1);
    },
    addItem,
    updateItem,
    deleteItem,
    getAllCache,
  };
}
