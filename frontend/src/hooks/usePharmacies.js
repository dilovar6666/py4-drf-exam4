import { useEffect, useState } from "react";
import api from "../api/axios";

export default function usePharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    Promise.all([api.get("pharmacies/"), api.get("reviews/")]).then(([pharmacyResponse, reviewResponse]) => {
      if (!active) return;
      const reviewData = reviewResponse.data;
      setReviews(reviewData);
      setPharmacies(pharmacyResponse.data.map((pharmacy) => {
        const related = reviewData.filter((review) => review.pharmacy === pharmacy.id);
        const rating = related.length ? related.reduce((sum, review) => sum + review.rating, 0) / related.length : null;
        return { ...pharmacy, rating, reviewCount: related.length };
      }));
      setStatus("ready");
    }).catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, []);
  return { pharmacies, reviews, status };
}
