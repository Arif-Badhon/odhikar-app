import { NextResponse } from "next/server";
import { KNOWLEDGE_ARTICLES, getSourcesForArticle } from "@/lib/odhikar/knowledge";

export async function GET() {
  const payload = KNOWLEDGE_ARTICLES.flatMap((article) => {
    // Get sources for this article
    const sources = getSourcesForArticle(article);
    
    // If an article has no sources, we still want to ingest it, but Rust expects a source.
    const mappedSources = sources.length > 0 ? sources : [{
      titleBn: "সাধারণ আইনি জ্ঞান",
      titleEn: "General Legal Knowledge",
      authority: "Legal Experts",
      officialUrl: "",
      status: "verification-required"
    }];

    return mappedSources.map(source => {
      // Helper to extract section points by kind
      const getSection = (kind: string) => {
        const sec = article.sections.find(s => s.kind === kind);
        return sec ? sec.points.join("\n") : "";
      };

      // Best effort extraction of act year from English title (e.g. "Muslim Family Laws Ordinance, 1961")
      const yearMatch = source.titleEn.match(/\b(19|20)\d{2}\b/);
      const actYear = yearMatch ? parseInt(yearMatch[0], 10) : 0;

      return {
        source_title: source.titleEn,
        issuing_authority: source.authority,
        document_type: "Statute",
        act_name: source.titleEn,
        act_year: actYear,
        section_reference: "",
        official_url: source.officialUrl || "",
        article_slug: article.slug,
        category: article.categoryId,
        title_bn: article.titleBn,
        title_en: article.titleEn,
        summary_bn: article.summaryBn,
        summary_en: "", 
        what_this_means_bn: getSection("meaning"),
        what_you_need_bn: getSection("need"),
        common_documents_bn: getSection("documents"),
        when_to_seek_help_bn: getSection("human-help"),
        where_to_get_help_bn: getSection("where"),
      };
    });
  });

  return NextResponse.json(payload);
}
