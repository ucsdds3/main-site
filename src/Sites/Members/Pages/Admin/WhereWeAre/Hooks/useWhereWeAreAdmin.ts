import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "src/Utils/supabase";
import type { cardData } from "src/Utils/types";
import {
  memberToWhereWeAreCard,
  type WhereWeAreMemberFields,
} from "src/Utils/whereWeAre";

const MEMBER_SELECT =
  "id, full_name, profile_picture, experiences, testimonial, graduation_year, teams";

type WhereWeAreRow = {
  member_id: number;
  order_number: number;
  Members: WhereWeAreMemberFields | WhereWeAreMemberFields[] | null;
};

export function useWhereWeAreAdmin() {
  const [selectedMembers, setSelectedMembers] = useState<WhereWeAreMemberFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSelection = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("WhereWeAre")
      .select(`member_id, order_number, Members(${MEMBER_SELECT})`)
      .order("order_number", { ascending: true });

    if (error) {
      toast.error(error.message);
      setSelectedMembers([]);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as WhereWeAreRow[];
    const members = rows
      .map(row => {
        const member = Array.isArray(row.Members) ? row.Members[0] : row.Members;
        if (!member) return null;
        return { ...member, id: row.member_id } as WhereWeAreMemberFields;
      })
      .filter((m): m is WhereWeAreMemberFields => m !== null);

    setSelectedMembers(members);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSelection();
  }, [loadSelection]);

  const previewCards = useMemo(
    () => selectedMembers.map(m => memberToWhereWeAreCard(m)),
    [selectedMembers]
  );

  const addMember = (member: WhereWeAreMemberFields) => {
    if (selectedMembers.some(m => m.id === member.id)) {
      toast.error("Member is already in the list");
      return;
    }
    setSelectedMembers(prev => [...prev, member]);
  };

  const removeMember = (id: number) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== id));
  };

  const moveMember = (id: number, direction: -1 | 1) => {
    setSelectedMembers(prev => {
      const idx = prev.findIndex(m => m.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[nextIdx]] = [copy[nextIdx], copy[idx]];
      return copy;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("WhereWeAre")
        .select("member_id");
      if (fetchError) throw fetchError;
      if (existing && existing.length > 0) {
        const memberIds = existing.map(row => row.member_id as number);
        const { error: deleteError } = await supabase
          .from("WhereWeAre")
          .delete()
          .in("member_id", memberIds);
        if (deleteError) throw deleteError;
      }

      if (selectedMembers.length > 0) {
        const rows = selectedMembers.map((m, order_number) => ({
          member_id: m.id,
          order_number,
        }));
        const { error: insertError } = await supabase.from("WhereWeAre").insert(rows);
        if (insertError) throw insertError;
      }

      toast.success("Where We Are section saved");
      await loadSelection();
    } catch (err) {
      toast.error((err as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return {
    selectedMembers,
    previewCards: previewCards as cardData[],
    loading,
    saving,
    addMember,
    removeMember,
    moveMember,
    save,
    reload: loadSelection,
  };
}

export async function searchWhereWeAreMembers(
  query: string,
  excludeIds: Set<number>
): Promise<WhereWeAreMemberFields[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  let request = supabase
    .from("Members")
    .select(MEMBER_SELECT)
    .or("deleted.is.null,deleted.eq.false")
    .ilike("full_name", `%${q}%`)
    .order("full_name", { ascending: true })
    .limit(20);

  const { data, error } = await request;
  if (error) throw new Error(error.message);

  return ((data ?? []) as WhereWeAreMemberFields[]).filter(m => !excludeIds.has(m.id));
}
