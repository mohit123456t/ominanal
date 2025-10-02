'use client';

import { useState } from 'react';
import { Lightbulb, Sparkles, LoaderCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  generateCampaignIdeas,
  type AICampaignIdeaOutput,
} from '@/ai/flows/ai-campaign-idea-generation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CampaignIdeasPage() {
  const [goal, setGoal] = useState('');
  const [ideas, setIdeas] = useState<AICampaignIdeaOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    setIsLoading(true);
    setError(null);
    setIdeas(null);

    try {
      const result = await generateCampaignIdeas({ goal });
      setIdeas(result);
    } catch (err) {
      setError('Failed to generate campaign ideas. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <Lightbulb className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-headline font-bold tracking-tight text-foreground sm:text-4xl">
          AI Campaign Idea Generator
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Stuck in a creative rut? Describe your goal and let our AI brainstorm brilliant campaign ideas for you.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <Input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder='e.g., "New product launch" or "Holiday sale"'
              className="flex-grow text-base"
              aria-label="Campaign Goal"
            />
            <Button type="submit" disabled={isLoading || !goal} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Ideas
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {ideas && (
        <div className="space-y-8">
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Campaign Concept</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{ideas.campaignConcept}</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
             <h2 className="font-headline text-2xl font-semibold">Post Ideas</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ideas.postIdeas.map((idea, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                        <p>{idea}</p>
                        </CardContent>
                    </Card>
                ))}
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
