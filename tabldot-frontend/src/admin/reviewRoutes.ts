// Bu dosya 'tabldot-frontend' icinde oldugu icin Express (backend) kodu calismaz.
// Backend'e istek gonderen bir fonksiyon olarak guncellendi.

export const addReview = async (reviewData: any) => {
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    return await response.json();
  } catch (error) {
    console.error('Yorum eklenirken hata:', error);
    throw error;
  }
};