import { useEffect, useState } from "react";
import Button from "src/Shared/Components/Button";
import Section from "src/Shared/Page/Section";
import BrowserCard from "../Components/BrowserCard";

interface Article {
  title: string;
  description: string;
  link: string;
  image: string;
  author: string;
}

const parseFirstParagraph = (htmlContent: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const paragraphs = doc.querySelectorAll("p");

  for (const p of paragraphs) {
    const text = p.textContent?.trim() || "";

    const isShort = text.length < 80;
    const isByline = /^by\s/i.test(text);
    const isHeader = ["H1","H2","H3","H4"].includes(p.previousElementSibling?.tagName || "");

    if (!isShort && !isByline && !isHeader) {
      return text;
    }
  }

  return "";
};

const OnlineContent = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(
          "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/ds3ucsd"
        );
        const data = await response.json();
        console.log(data);

        const formatted = data.items
          .slice(0, 3)
          .filter(Boolean)
          .map((item: any) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(item.content, "text/html");
            const img = doc.querySelector("img");

            return {
              title: item.title,
              description: parseFirstParagraph(item.content),
              link: item.link,
              image: img?.src?.split("?")[0] || "/OnlineContent/default.webp",
              author: item.author,
            };
          });

        setArticles(formatted);
      } catch (error) {
        console.error("Error fetching Medium articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Section title="Online Content" className="gap-0">
      <p className="text-2xl font-light max-w-xl text-center px-10">
        Have something to share or want to explore more? Read our latest articles or submit your own
        for publication!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-10">
        {loading ? (
          <p className="text-center col-span-full">Loading articles...</p>
        ) : (
          articles.map((content, index) => (
            <div key={content.link} className="text-left">  {/* changed text-center to text-left */}
              <BrowserCard
                image={content.image}
                title={
                  <p className="text-3xl line-clamp-2">
                    {content.title}
                  </p>
                }
                description={<span className="line-clamp-4">{content.description}</span>}
                link={content.link}
                delay={index * 0.1}
                linkText="Read"
              />
            </div>
          ))
        )}
      </div>

      <Button
        onClick={() => {
          window.open("https://medium.com/ds3ucsd", "_blank");
        }}
      >
        View All
      </Button>
    </Section>
  );
};

export default OnlineContent;