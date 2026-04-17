const SHEET_URL =
  "https://script.google.com/macros/s/AKfycby-e0DKn3rehoTaYcHmSmtwcF9mdld7NUn6c77a6y7c6pPHfPvSxsyV5v7k8scstzQ6/exec";

interface TrackData {
  gender: string;
  birthYear: string;
  name1: string;
  name2: string;
  name3: string;
  weakElements: string;
  event: "view" | "share";
}

export function trackEvent(data: TrackData) {
  try {
    // Google Apps Script는 POST 후 302 리다이렉트를 하므로
    // GET + query string 방식이 브라우저 CORS에서 가장 안정적
    const params = new URLSearchParams(
      data as unknown as Record<string, string>,
    );
    const img = new Image();
    img.src = `${SHEET_URL}?${params.toString()}`;
  } catch {
    // 실패해도 사용자 경험에 영향 없음
  }
}
