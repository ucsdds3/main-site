import { useEffect, useState } from "react";

import { supabase } from "src/Utils/supabase";
import type { cardData } from "src/Utils/types";
import {
  memberToWhereWeAreCard,
  type WhereWeAreMemberFields,
} from "src/Utils/whereWeAre";

import fallbackCards from "../Data/testimonials.json";

type WhereWeAreRow = {
  member_id: number;
  order_number: number;
  Members: WhereWeAreMemberFields | WhereWeAreMemberFields[] | null;
};

export function useWhereWeAreCards() {
  const [cards, setCards] = useState<cardData[]>(fallbackCards as cardData[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data, error } = await supabase
        .from("WhereWeAre")
        .select(
          "member_id, order_number, Members(id, full_name, profile_picture, experiences, testimonial, graduation_year, teams)"
        )
        .order("order_number", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.warn("WhereWeAre fetch failed, using fallback:", error.message);
        setCards(fallbackCards as cardData[]);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as WhereWeAreRow[];
      if (rows.length === 0) {
        setCards(fallbackCards as cardData[]);
        setLoading(false);
        return;
      }

      const next = rows
        .map(row => {
          const member = Array.isArray(row.Members) ? row.Members[0] : row.Members;
          if (!member) return null;
          return memberToWhereWeAreCard({ ...member, id: row.member_id });
        })
        .filter((c): c is cardData => c !== null);

      setCards(next.length > 0 ? next : (fallbackCards as cardData[]));
      setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { cards, loading };
}
