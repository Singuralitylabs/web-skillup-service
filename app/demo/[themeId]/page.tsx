import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageTitle } from "@/app/components/PageTitle";
import { fetchDemoContext } from "@/app/services/api/demo-learning-server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ themeId: string }>;
}

export default async function DemoThemePage({ params }: PageProps) {
  const { themeId } = await params;
  const themeIdNum = Number.parseInt(themeId, 10);

  const { data: ctx } = await fetchDemoContext();

  if (!ctx) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-muted-foreground">デモコンテンツが準備中です。</p>
      </div>
    );
  }

  if (ctx.theme.id !== themeIdNum) {
    redirect(`/demo/${ctx.theme.id}`);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle
        title={ctx.theme.name}
        description={ctx.theme.description ?? undefined}
        breadcrumbs={[
          { label: "デモ学習", href: "/demo" },
          { label: ctx.theme.name },
        ]}
      />

      <div className="grid gap-4">
        <Link href={`/demo/${ctx.theme.id}/${ctx.phase.id}`} className="block group">
          <Card className="transition-all hover:shadow-md hover:border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {ctx.phase.name}
                    </h2>
                    {ctx.phase.description && (
                      <p className="text-sm text-muted-foreground mt-1">{ctx.phase.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    デモ限定
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
