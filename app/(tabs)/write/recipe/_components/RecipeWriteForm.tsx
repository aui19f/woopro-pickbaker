"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createRecipe } from "../_actions";

/* ─── Types ─────────────────────────────────────── */

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

interface Ingredient {
  id: string;
  name: string;
  amount: string;
}

interface Step {
  id: string;
  content: string;
  imageFile?: File;
  imagePreview?: string;
}

/* ─── Constants ──────────────────────────────────── */

const CATEGORIES = [
  { value: "BREAD",        label: "빵" },
  { value: "CAKE",         label: "케이크" },
  { value: "COOKIE",       label: "쿠키·구움과자" },
  { value: "PASTRY",       label: "페이스트리" },
  { value: "TART",         label: "타르트" },
  { value: "DONUT",        label: "도넛" },
  { value: "MUFFIN_SCONE", label: "머핀·스콘" },
  { value: "ETC",          label: "기타" },
] as const;

const uid = () => `${Date.now()}-${Math.random()}`;

/* ─── Icons ─────────────────────────────────────── */

const XSmIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const UpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

const DownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const UploadIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
    <path d="M16 5v6M13 8h6" strokeWidth={1.8} />
  </svg>
);

/* ─── Section Card ───────────────────────────────── */

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-3">{title}</p>
        {children}
      </div>
    </div>
  );
}

/* ─── RecipeWriteForm ────────────────────────────── */

export default function RecipeWriteForm() {
  const router = useRouter();

  // 이미지
  const recipeImgInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 기본 정보
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState("");
  // 재료
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: uid(), name: "", amount: "" },
  ]);

  // 레시피 순서
  const stepImgInputRef    = useRef<HTMLInputElement>(null);
  const stepImgTargetIdx   = useRef(-1);
  const [steps, setSteps]  = useState<Step[]>([
    { id: uid(), content: "" },
  ]);

  // 메모 / 링크
  const [memo, setMemo] = useState("");
  const [link, setLink] = useState("");

  // UI 상태
  const [error, setError]           = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading]   = useState(false);

  /* ── 유틸 ── */
  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 3500);
  }

  function moveItem<T>(arr: T[], from: number, dir: -1 | 1): T[] {
    const to = from + dir;
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  }

  /* ── 이미지 ── */
  const handleRecipeImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    const remaining = 10 - images.length;
    setImages((prev) => [
      ...prev,
      ...files.slice(0, remaining).map((f) => ({ id: uid(), file: f, preview: URL.createObjectURL(f) })),
    ]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (currentImgIdx >= next.length) setCurrentImgIdx(Math.max(0, next.length - 1));
      return next;
    });
  };

  /* ── 재료 ── */
  const addIngredient = () =>
    setIngredients((prev) => [...prev, { id: uid(), name: "", amount: "" }]);

  const removeIngredient = (id: string) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));

  const updateIngredient = (id: string, field: "name" | "amount", value: string) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const moveIngredient = (idx: number, dir: -1 | 1) =>
    setIngredients((prev) => moveItem(prev, idx, dir));

  /* ── 스텝 ── */
  const addStep = () =>
    setSteps((prev) => [...prev, { id: uid(), content: "" }]);

  const removeStep = (id: string) =>
    setSteps((prev) => prev.filter((s) => s.id !== id));

  const updateStepContent = (id: string, value: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, content: value } : s)));

  const moveStep = (idx: number, dir: -1 | 1) =>
    setSteps((prev) => moveItem(prev, idx, dir));

  const openStepImage = (idx: number) => {
    stepImgTargetIdx.current = idx;
    stepImgInputRef.current?.click();
  };

  const handleStepImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const idx = stepImgTargetIdx.current;
    if (!file || idx < 0) return;
    setSteps((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, imageFile: file, imagePreview: URL.createObjectURL(file) } : s,
      ),
    );
  };

  const removeStepImage = (idx: number) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, imageFile: undefined, imagePreview: undefined } : s)));

  /* ── 유효성 검사 ── */
  const validate = () => {
    if (!title.trim())  { showError("제목을 입력해주세요."); return false; }
    if (!category)      { showError("카테고리를 선택해주세요."); return false; }
    if (!steps.some((s) => s.content.trim())) { showError("레시피 순서를 1개 이상 입력해주세요."); return false; }
    return true;
  };

  /* ── 업로드 ── */
  const handleUpload = async () => {
    setShowConfirm(false);
    setUploading(true);

    try {
      // 업로드할 파일 목록 구성 (레시피 이미지 + 스텝 이미지)
      type FileEntry = { file: File; name: string };
      const recipeFiles: FileEntry[] = images.map((m, i) => ({ file: m.file, name: `recipe-img-${i}.jpg` }));
      const stepFiles:   (FileEntry & { stepIdx: number })[] = [];
      steps.forEach((s, i) => {
        if (s.imageFile) stepFiles.push({ file: s.imageFile, name: `step-img-${i}.jpg`, stepIdx: i });
      });

      const allFiles = [...recipeFiles, ...stepFiles];

      let recipeImageUrls: { url: string; order: number }[] = [];
      const stepImageUrlMap: Record<number, string> = {};

      if (allFiles.length > 0) {
        const presignRes = await fetch("/api/presigned-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: allFiles.map((f) => ({ name: f.name })) }),
        });
        if (!presignRes.ok) throw new Error("presigned URL 요청 실패");
        const { results } = await presignRes.json();

        await Promise.all(
          allFiles.map(async (entry, i) => {
            const res = await fetch(results[i].signedUrl, {
              method: "PUT",
              body: entry.file,
              headers: { "Content-Type": entry.file.type },
            });
            if (!res.ok) throw new Error("파일 업로드 실패");
          }),
        );

        recipeImageUrls = recipeFiles.map((_, i) => ({ url: results[i].publicUrl, order: i }));
        stepFiles.forEach((sf, i) => {
          stepImageUrlMap[sf.stepIdx] = results[recipeFiles.length + i].publicUrl;
        });
      }

      await createRecipe({
        title: title.trim(),
        category,
        memo,
        link,
        images: recipeImageUrls,
        ingredients: ingredients.map((ing, i) => ({ name: ing.name, amount: ing.amount, order: i })),
        steps: steps.map((s, i) => ({ content: s.content, imageUrl: stepImageUrlMap[i], order: i })),
      });

      router.push("/recipe");
    } catch (err) {
      setUploading(false);
      showError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    }
  };

  const hasAddSlide    = images.length < 10;
  const totalSlides    = images.length + (hasAddSlide ? 1 : 0);
  const isOnImgSlide   = currentImgIdx < images.length;

  return (
    <>
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-stone-100 flex items-center px-5 h-14 z-10">
        <button onClick={() => router.back()} className="text-sm text-stone-400 font-medium w-10">
          취소
        </button>
        <p className="flex-1 text-center text-sm font-bold text-stone-800">레시피 글쓰기</p>
        <button
          onClick={() => { if (validate()) setShowConfirm(true); }}
          className="text-sm text-point font-bold w-14 text-right"
        >
          업로드
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3.5 pb-12">

        {/* 에러 */}
        {error && (
          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* ── 이미지 ── */}
        <input ref={recipeImgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleRecipeImages} />

        {images.length === 0 ? (
          <button
            onClick={() => recipeImgInputRef.current?.click()}
            className="w-full aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-3 text-stone-300 active:bg-stone-100"
          >
            <UploadIcon />
            <span className="text-sm font-medium">대표 이미지 추가</span>
            <span className="text-xs">최대 10장 · 첫 번째가 썸네일</span>
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-stone-900">
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory overflow-x-scroll"
              style={{ scrollbarWidth: "none" }}
              onScroll={() => {
                const el = carouselRef.current;
                if (el) setCurrentImgIdx(Math.round(el.scrollLeft / el.clientWidth));
              }}
            >
              {images.map((item) => (
                <div key={item.id} className="snap-start shrink-0 w-full aspect-square relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(item.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white z-10"
                  >
                    <XSmIcon />
                  </button>
                </div>
              ))}
              {hasAddSlide && (
                <div className="snap-start shrink-0 w-full aspect-square bg-stone-800 flex items-center justify-center">
                  <button
                    onClick={() => recipeImgInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 text-stone-400"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                      <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
                    </svg>
                    <span className="text-xs font-medium">{images.length} / 10</span>
                  </button>
                </div>
              )}
            </div>
            {isOnImgSlide && (
              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/40 text-white text-xs font-semibold tabular-nums pointer-events-none">
                {currentImgIdx + 1} / {images.length}
                {currentImgIdx === 0 && <span className="ml-1.5 text-[10px] opacity-80">썸네일</span>}
              </div>
            )}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-200 ${i === currentImgIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
              ))}
            </div>
          </div>
        )}

        {/* ── 제목 ── */}
        <SectionCard title="제목">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="레시피 제목을 입력하세요"
            className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent pb-2"
          />
        </SectionCard>

        {/* ── 카테고리 ── */}
        <SectionCard title="카테고리">
          <div className="flex flex-wrap gap-2 pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  category === cat.value
                    ? "bg-point text-white border-point"
                    : "bg-white text-stone-500 border-stone-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── 재료 ── */}
        <SectionCard title="재료">
          <div className="space-y-2 pb-1">
            {ingredients.map((ing, idx) => (
              <div key={ing.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                  placeholder="재료명"
                  className="flex-1 min-w-0 text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-stone-50 rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(ing.id, "amount", e.target.value)}
                  placeholder="양"
                  className="w-20 text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-stone-50 rounded-lg px-3 py-2"
                />
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveIngredient(idx, -1)}
                    disabled={idx === 0}
                    className="p-0.5 text-stone-300 disabled:opacity-30"
                  >
                    <UpIcon />
                  </button>
                  <button
                    onClick={() => moveIngredient(idx, 1)}
                    disabled={idx === ingredients.length - 1}
                    className="p-0.5 text-stone-300 disabled:opacity-30"
                  >
                    <DownIcon />
                  </button>
                </div>
                <button
                  onClick={() => removeIngredient(ing.id)}
                  disabled={ingredients.length === 1}
                  className="p-1 text-stone-300 disabled:opacity-20 shrink-0"
                >
                  <XSmIcon />
                </button>
              </div>
            ))}
            <button
              onClick={addIngredient}
              className="flex items-center gap-1.5 text-xs text-point font-medium mt-1"
            >
              <PlusIcon />
              재료 추가
            </button>
          </div>
        </SectionCard>

        {/* ── 레시피 순서 ── */}
        <input ref={stepImgInputRef} type="file" accept="image/*" className="hidden" onChange={handleStepImage} />

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-3">레시피 순서</p>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={step.id} className="relative">
                  {/* 스텝 번호 + 위아래 + 삭제 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-point">Step {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="p-0.5 text-stone-300 disabled:opacity-30">
                        <UpIcon />
                      </button>
                      <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} className="p-0.5 text-stone-300 disabled:opacity-30">
                        <DownIcon />
                      </button>
                      <button onClick={() => removeStep(step.id)} disabled={steps.length === 1} className="p-1 text-stone-300 disabled:opacity-20">
                        <XSmIcon />
                      </button>
                    </div>
                  </div>

                  {/* 텍스트 */}
                  <textarea
                    value={step.content}
                    onChange={(e) => updateStepContent(step.id, e.target.value)}
                    placeholder={`${idx + 1}번째 순서를 입력하세요`}
                    rows={3}
                    className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-stone-50 rounded-xl px-3 py-2.5 resize-none"
                  />

                  {/* 스텝 이미지 */}
                  {step.imagePreview ? (
                    <div className="relative mt-2 rounded-xl overflow-hidden aspect-video bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={step.imagePreview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeStepImage(idx)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white"
                      >
                        <XSmIcon />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openStepImage(idx)}
                      className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mt-2"
                    >
                      <ImageIcon />
                      사진 추가 (선택)
                    </button>
                  )}

                  {/* 구분선 */}
                  {idx < steps.length - 1 && <div className="mt-4 border-t border-stone-100" />}
                </div>
              ))}

              <button
                onClick={addStep}
                className="flex items-center gap-1.5 text-xs text-point font-medium"
              >
                <PlusIcon />
                순서 추가
              </button>
            </div>
          </div>
        </div>

        {/* ── 메모 ── */}
        <SectionCard title="메모 (선택)">
          <textarea
            value={memo}
            onChange={(e) => { if (e.target.value.length <= 500) setMemo(e.target.value); }}
            placeholder="레시피에 대한 추가 메모를 입력하세요"
            rows={4}
            className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent resize-none pb-1"
          />
          <div className="flex justify-end pb-1">
            <span className={`text-[11px] tabular-nums ${memo.length >= 450 ? "text-red-400" : "text-stone-300"}`}>
              {memo.length} / 500
            </span>
          </div>
        </SectionCard>

        {/* ── 링크 ── */}
        <SectionCard title="링크 (선택)">
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent pb-2"
          />
        </SectionCard>

        {/* 업로드 버튼 */}
        <button
          onClick={() => { if (validate()) setShowConfirm(true); }}
          className="w-full h-13 rounded-2xl bg-point text-white font-bold text-sm shadow-sm active:opacity-90"
        >
          업로드
        </button>
      </div>

      {/* ── 업로드 확인 모달 ── */}
      {showConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowConfirm(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-5 pt-6 pb-10 shadow-xl">
            <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-5" />
            <h3 className="text-[1rem] font-bold text-stone-800 mb-1.5">업로드 하시겠습니까?</h3>
            <p className="text-sm text-stone-400 mb-6">레시피가 업로드됩니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 h-12 rounded-xl border border-stone-200 text-sm text-stone-500 font-medium">
                취소
              </button>
              <button onClick={handleUpload} className="flex-1 h-12 rounded-xl bg-point text-white text-sm font-bold">
                업로드
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── 업로드 로딩 ── */}
      {uploading && (
        <div className="fixed inset-0 bg-white z-300 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full border-[3px] border-stone-200 border-t-point animate-spin" />
          <p className="text-sm font-semibold text-stone-500">업로드 중...</p>
          <p className="text-xs text-stone-300">잠시만 기다려주세요</p>
        </div>
      )}
    </>
  );
}
