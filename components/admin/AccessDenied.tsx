import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Shown to authenticated users whose profile role is not 'admin'.
 * No admin data or structure is revealed.
 */
export function AccessDenied() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are signed in, but your account does not have permission to
            access this area.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Back to Website</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
