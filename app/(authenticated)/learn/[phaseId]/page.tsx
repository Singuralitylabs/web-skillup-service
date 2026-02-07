import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/app/components/PageTitle";
import { fetchPhaseById, fetchWeeksByPhaseId } from "@/app/services/api/learning-server";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ phaseId: string }>;
}

export default async function PhasePage({ params }: PageProps) {
  const { phaseId } = await params;
  const phaseIdNum = Number.parseInt(phaseId, 10);

  if (Number.isNaN(phaseIdNum)) {
    notFound();
  }

  const [{ data: phase }, { data: weeks }] = await Promise.all([
    fetchPhaseById(phaseIdNum),
    fetchWeeksByPhaseId(phaseIdNum),
  ]);

  if (!phase) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle
        title={phase.name}
        description={phase.description || undefined}
        breadcrumbs={[{ label: "学習コンテンツ", href: "/learn" }, { label: phase.name }]}
      />

      {!weeks || weeks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">このフェーズにはまだ週が登録されていません。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {weeks.map((week) => (
            <Link key={week.id} href={`/learn/${phaseIdNum}/${week.id}`} className="block group">
              <Card className="transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {week.name}
                        </h2>
                        {week.description && (
                          <p className="text-sm text-muted-foreground mt-1">{week.description}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
