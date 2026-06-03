import Page from "src/Shared/Page/Page";
import SlideshowCarousel from "src/Sites/Main/Pages/Home/Components/SlideshowCarousel";

import MemberSearchPicker from "./Components/MemberSearchPicker";
import SelectedMembersList from "./Components/SelectedMembersList";
import { useWhereWeAreAdmin } from "./Hooks/useWhereWeAreAdmin";

export default function WhereWeAreAdmin() {
  const {
    selectedMembers,
    previewCards,
    loading,
    saving,
    addMember,
    removeMember,
    moveMember,
    save,
  } = useWhereWeAreAdmin();

  return (
    <Page>
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8 font-body">
        <header className="mb-8">
          <h1 className="m-0 text-2xl font-semibold text-(--obs-text-primary)">Where We Are</h1>
          <p className="mt-2 max-w-2xl text-sm text-(--obs-text-muted)">
            Choose members for the homepage slideshow. List order is display order. Each card uses
            the top experience as the title, the second above Class of, and their most important
            team role in the byline.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="flex flex-col gap-4 rounded-2xl border border-(--obs-border) bg-(--obs-surface) p-5">
            <h2 className="m-0 text-lg font-medium text-(--obs-text-primary)">Add members</h2>
            <MemberSearchPicker
              excludeMemberIds={selectedMembers.map(m => m.id)}
              onSelect={addMember}
            />
            <h2 className="m-0 mt-4 text-lg font-medium text-(--obs-text-primary)">
              Selected ({selectedMembers.length})
            </h2>
            {loading ? (
              <p className="text-sm text-(--obs-text-muted)">Loading current selection…</p>
            ) : (
              <SelectedMembersList
                members={selectedMembers}
                onRemove={removeMember}
                onMove={moveMember}
              />
            )}
            <button
              type="button"
              className="btn btn-primary mt-2 w-full max-w-xs self-start font-body disabled:opacity-50"
              disabled={saving || loading}
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Save to main site"}
            </button>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-(--obs-border) bg-(--obs-surface) p-5">
            <h2 className="m-0 text-lg font-medium text-(--obs-text-primary)">Preview</h2>
            <p className="m-0 text-sm text-(--obs-text-muted)">
              Matches the main site &quot;Where We Are&quot; slideshow (first slide shown; use arrows
              in preview to browse).
            </p>
            {previewCards.length > 0 ? (
              <div className="w-full min-w-0">
                <SlideshowCarousel images={previewCards} />
              </div>
            ) : (
              <p className="text-sm italic text-(--obs-text-faint)">
                Add members to see a preview.
              </p>
            )}
          </section>
        </div>
      </div>
    </Page>
  );
}
