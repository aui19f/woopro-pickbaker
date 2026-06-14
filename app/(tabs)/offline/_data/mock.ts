export type OfflineEvent = {
  id: string;
  title: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  startTime: string; // "HH:MM"
  endTime: string;
  location: string;
  links: {
    website?: string;
    instagram?: string;
    facebook?: string;
  };
};

export type EventStatus = "ongoing" | "upcoming" | "past";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")} (${DAYS[date.getDay()]})`;
}

export function getEventStatus(startDate: string, endDate: string): EventStatus {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  if (today > end) return "past";
  if (today < start) return "upcoming";
  return "ongoing";
}

export const MOCK_EVENTS: OfflineEvent[] = [
  {
    id: "1",
    title: "서울 베이킹 페스티벌 2026",
    startDate: "2026-06-20",
    endDate: "2026-06-22",
    startTime: "10:00",
    endTime: "18:00",
    location: "코엑스 A홀, 서울 강남구",
    links: {
      website: "https://example.com",
      instagram: "https://instagram.com/bakingfest",
    },
  },
  {
    id: "2",
    title: "부산 빵 문화 축제",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    startTime: "09:00",
    endTime: "20:00",
    location: "벡스코, 부산 해운대구",
    links: {
      instagram: "https://instagram.com/busanbread",
      facebook: "https://facebook.com/busanbread",
    },
  },
  {
    id: "3",
    title: "강남 디저트 위크",
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    startTime: "11:00",
    endTime: "21:00",
    location: "청담동 일대, 서울 강남구",
    links: {
      website: "https://example.com",
      instagram: "https://instagram.com/dessertweek",
    },
  },
  {
    id: "4",
    title: "한국 베이커리 박람회",
    startDate: "2026-06-12",
    endDate: "2026-06-16",
    startTime: "10:00",
    endTime: "17:00",
    location: "킨텍스 제2전시장, 경기 고양시",
    links: {
      website: "https://example.com",
      facebook: "https://facebook.com/kbakery",
    },
  },
];
