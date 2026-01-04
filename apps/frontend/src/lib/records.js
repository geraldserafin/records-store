import api from "./api";

export const fetchRecords = async ({ page, genre, section, q }) => {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: "20",
  });

  if (genre) searchParams.append("genreSlug", genre);
  if (section) searchParams.append("section", section);
  if (q) {
    const res = await api
      .get(`records/search`, { searchParams: { q, page, limit: "12" } })
      .json();
    return res;
  }

  return await api.get("records", { searchParams }).json();
};
