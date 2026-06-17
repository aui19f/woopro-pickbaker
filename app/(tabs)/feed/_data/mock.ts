export type PostMedia = {
  id: string;
  preview?: string;       // blob URL or base64 (local posts)
  type?: "image" | "video";
};

export type Post = {
  id: string;
  author: { username: string };
  content: string;
  media: PostMedia[];
  tags?: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

export type Comment = {
  id: string;
  username: string;
  content: string;
  time: string;
};

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: { username: "sourdough_kim" },
    content:
      "오늘 첫 사워도우 성공!! 72시간 발효 끝에 드디어 원하던 기공이 나왔어요. 껍질은 바삭하고 속은 쫄깃쫄깃 🍞 다음엔 통밀 버전도 도전해볼게요. 정말 오래 기다렸는데 이 결과물이 나왔을 때 눈물이 날 뻔했어요. 베이킹은 과학이자 예술인 것 같아요.",
    media: [{ id: "1-1" }, { id: "1-2" }, { id: "1-3" }],
    likeCount: 142,
    commentCount: 23,
    createdAt: "방금 전",
  },
  {
    id: "2",
    author: { username: "croissant_lover" },
    content:
      "크루아상 3차 시도. 버터 레이어가 드디어 보이기 시작했어요! 1차는 버터 녹음, 2차는 모양 실패였는데 이번엔 제법 그럴듯하죠? 다음 목표는 아몬드 크루아상입니다. 이 과정이 힘들지만 완성됐을 때의 기쁨은 정말 말로 표현할 수가 없어요. 베이킹은 역시 끈기가 전부인 것 같아요. 여러분도 포기하지 마세요! 버터는 항상 차갑게 유지하는 게 핵심이에요.",
    media: [{ id: "2-1" }, { id: "2-2" }],
    likeCount: 89,
    commentCount: 15,
    createdAt: "2시간 전",
  },
  {
    id: "3",
    author: { username: "bread_studio" },
    content: "오늘의 베이킹 🥖",
    media: [{ id: "3-1" }, { id: "3-2" }, { id: "3-3" }, { id: "3-4" }, { id: "3-5" }],
    likeCount: 214,
    commentCount: 41,
    createdAt: "5시간 전",
  },
  {
    id: "4",
    author: { username: "homecafe_recipe" },
    content:
      "스콘 레시피 공유해요! 버터는 항상 차갑게, 오버믹스는 절대 금지. 이 두 가지만 지키면 바삭한 스콘 완성!",
    media: [],
    likeCount: 367,
    commentCount: 58,
    createdAt: "어제",
  },
];

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  "1": [
    { id: "c1", username: "bread_studio", content: "기공 정말 예쁘게 나왔네요! 발효 온도는 어떻게 하셨어요?", time: "방금 전" },
    { id: "c2", username: "croissant_lover", content: "72시간이나요?? 대단하세요 👏", time: "1분 전" },
    { id: "c3", username: "homecafe_recipe", content: "저도 도전해봐야겠어요!", time: "5분 전" },
  ],
  "2": [
    { id: "c4", username: "sourdough_kim", content: "버터는 어떤 거 쓰세요?", time: "1시간 전" },
    { id: "c5", username: "bread_studio", content: "레이어 너무 이쁘다 😍", time: "2시간 전" },
  ],
  "3": [],
  "4": [
    { id: "c6", username: "baking_pro", content: "버터 온도 중요하죠!", time: "3시간 전" },
    { id: "c7", username: "newbie_baker", content: "몇 도에서 얼마나 굽나요?", time: "2시간 전" },
    { id: "c8", username: "bread_studio", content: "180도 20분이요!", time: "2시간 전" },
  ],
};
