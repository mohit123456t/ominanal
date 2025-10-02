import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individuals starting out.',
    features: [
      { text: 'Connect up to 3 social media accounts', included: true },
      { text: '10 scheduled posts per month', included: true },
      { text: 'Limited AI generator usage', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Advanced Profile Analytics', included: false },
      { text: 'Team member collaboration', included: false },
      { text: 'Priority customer support', included: false },
    ],
    isPopular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'For professionals and small businesses.',
    features: [
      { text: 'Connect up to 10 social media accounts', included: true },
      { text: 'Unlimited scheduled posts', included: true },
      { text: 'High-priority AI generator usage', included: true },
      { text: 'Advanced Profile Analytics', included: true },
      { text: 'Team member collaboration', included: false },
      { text: 'Priority customer support', included: false },
    ],
    isPopular: true,
  },
  {
    name: 'Agency / Business',
    price: '$49',
    description: 'For large teams and agencies.',
    features: [
      { text: 'Connect UNLIMITED social media accounts', included: true },
      { text: 'All features from the Pro Plan', included: true },
      { text: 'Team member collaboration', included: true },
      { text: 'Priority customer support', included: true },
    ],
    isPopular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">Find the perfect plan</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Start for free, then upgrade as you grow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn('flex flex-col', plan.isPopular && 'border-primary ring-2 ring-primary')}>
            {plan.isPopular && <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">Most Popular</div>}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-sm font-semibold text-muted-foreground">/month</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                    )}
                    <span className={cn(!feature.included && "text-muted-foreground")}>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'}>
                {plan.name === 'Free' ? 'Get Started' : 'Choose Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
