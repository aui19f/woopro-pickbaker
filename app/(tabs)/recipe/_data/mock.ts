export type Recipe = {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  author: { username: string };
  createdAt: string;
  viewCount: number;
  likeCount: number;
};

export const CATEGORY_COLOR: Record<string, string> = {
  케이크: "bg-pink-100 text-pink-600",
  빵: "bg-amber-100 text-amber-700",
  쿠키: "bg-orange-100 text-orange-600",
  타르트: "bg-rose-100 text-rose-600",
  디저트: "bg-purple-100 text-purple-600",
};

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "1",
    category: "케이크",
    title: "촉촉한 초콜릿 가나슈 케이크 — 실패 없는 홈베이킹 완벽 레시피",
    content:
      "카카오 함량 70% 다크 초콜릿과 생크림으로 만든 진한 가나슈를 겹겹이 쌓아 완성한 케이크예요. 반죽에 뜨거운 커피를 넣으면 초콜릿 풍미가 훨씬 깊어진답니다. 오븐마다 온도 차이가 있으니 중간에 꼭 이쑤시개로 확인해주세요. 냉장 보관 시 최대 3일까지 맛이 유지됩니다.",
    tags: ["초콜릿케이크", "가나슈", "홈베이킹", "초코", "케이크레시피", "생일케이크"],
    author: { username: "choco_baker" },
    createdAt: "2026.06.10",
    viewCount: 12840,
    likeCount: 934,
  },
  {
    id: "2",
    category: "빵",
    title: "72시간 저온 발효 바게트",
    content:
      "냉장 저온 발효로 만드는 정통 바게트 레시피입니다. 겉은 바삭하고 속은 기공이 살아있는 그 맛. 반죽할 때 글루텐이 충분히 형성될 때까지 치대는 것이 핵심입니다.",
    tags: ["바게트", "저온발효", "사워도우", "프랑스빵", "홈베이킹"],
    author: { username: "sourdough_kim" },
    createdAt: "2026.06.08",
    viewCount: 8321,
    likeCount: 612,
  },
  {
    id: "3",
    category: "쿠키",
    title: "뉴욕 스타일 두툼한 초코칩 쿠키 — 겉바속촉 완성의 비밀",
    content:
      "브라운버터와 숙성 반죽의 조합으로 만드는 뉴욕 스타일 쿠키예요. 반죽을 냉장에서 최소 24시간 숙성시키면 카라멜향이 더욱 진해집니다. 굽기 직전에 플뢰르 드 셀을 살짝 뿌려주면 단짠의 조화가 완성됩니다. 두툼하게 성형해야 겉은 바삭하고 속은 촉촉한 텍스처가 나와요.",
    tags: ["쿠키", "초코칩쿠키", "뉴욕쿠키", "브라운버터", "겉바속촉", "홈카페"],
    author: { username: "cookie_studio" },
    createdAt: "2026.06.05",
    viewCount: 21053,
    likeCount: 1847,
  },
  {
    id: "4",
    category: "타르트",
    title: "레몬 커드 타르트",
    content:
      "새콤달콤한 레몬 커드를 바삭한 파트 슈크레 셸에 채운 타르트입니다. 레몬즙은 반드시 신선한 레몬을 직접 짜서 사용하세요.",
    tags: ["레몬타르트", "타르트", "레몬커드", "구움과자"],
    author: { username: "tart_maker" },
    createdAt: "2026.06.01",
    viewCount: 5678,
    likeCount: 423,
  },
  {
    id: "5",
    category: "디저트",
    title: "노오븐 망고 치즈케이크 — 오븐 없이 만드는 여름 디저트의 정석",
    content:
      "젤라틴을 활용해 오븐 없이 완성하는 망고 치즈케이크예요. 크림치즈와 생크림의 비율이 포인트! 냉동 망고를 활용하면 계절에 관계없이 즐길 수 있어요. 글루텐 프리 베이스로 만들면 더 건강하게 즐길 수 있습니다.",
    tags: ["노오븐", "망고치즈케이크", "냉장디저트", "여름디저트", "글루텐프리"],
    author: { username: "nomnom_dessert" },
    createdAt: "2026.05.28",
    viewCount: 9412,
    likeCount: 778,
  },
];
