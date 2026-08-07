import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card className="gap-3 py-5">
      <CardContent className="flex items-start justify-between px-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="size-10 rounded-xl" />
      </CardContent>
    </Card>
  );
}
