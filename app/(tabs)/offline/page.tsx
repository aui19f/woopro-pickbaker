import OfflineListView from "./_components/OfflineListView";

export default function OfflinePage() {
  return (
    <div className="pt-2">
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-xl font-bold text-stone-800">오프라인</h1>
      </div>
      <OfflineListView />
    </div>
  );
}
