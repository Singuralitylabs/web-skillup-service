import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageTitle } from "@/app/components/PageTitle";
import { fetchPublishedPhases } from "@/app/services/api/learning-server";
import { getServerAuth } from "@/app/services/auth/server-auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function LearnPage() {
  const { userId } = await getServerAuth();
  const { data: phases } = await fetchPublishedPhases();

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle title="学習コンテンツ" description="フェーズを選択して学習を始めましょう" />

      {!phases || phases.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">学習コンテンツはまだ登録されていません。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {phases.map((phase) => (
            <Link key={phase.id} href={`/learn/${phase.id}`} className="block group">
              <Card className="transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {phase.name}
                        </h2>
                        {phase.description && (
                          <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
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
