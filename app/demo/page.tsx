import { BookOpen, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageTitle } from "@/app/components/PageTitle";
import { fetchDemoContext } from "@/app/services/api/demo-learning-server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function DemoRootPage() {
  const { data: ctx } = await fetchDemoContext();

  if (!ctx) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-muted-foreground">
          デモコンテンツが準備中です。しばらくお待ちください。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle title="デモ学習" description="デモで体験できる学習テーマです" />

      <div className="grid gap-6 sm:grid-cols-2">
        <Link href={`/demo/${ctx.theme.id}`} className="block group">
          <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 h-full">
            <div className="relative aspect-video bg-linear-to-br from-primary/5 to-primary/15">
              {ctx.theme.image_url ? (
                <Image
                  src={ctx.theme.image_url}
                  alt={ctx.theme.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/30" />
                </div>
              )}
              <Badge className="absolute top-2 right-2 text-xs" variant="secondary">
                デモ限定
              </Badge>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {ctx.theme.name}
                </h2>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
              {ctx.theme.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ctx.theme.description}
                </p>
              )}
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
