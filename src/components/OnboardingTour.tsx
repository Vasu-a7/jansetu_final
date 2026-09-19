import { useState, useEffect } from 'react';
import * as JoyrideModule from 'react-joyride';
import { useAuth } from '@/context/AuthContext';

// Vite SSR bypass for missing default export
const Joyride = (JoyrideModule as any).Joyride || JoyrideModule;
const STATUS = (JoyrideModule as any).STATUS || {};

const OnboardingTour = () => {
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useAuth();
  const tourKey = `jansetu-tour-completed:${user?.id || user?.email || 'guest'}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;
    setRun(localStorage.getItem(tourKey) !== 'true');
  }, [isLoading, mounted, tourKey]);

  const steps: any[] = [
    {
      target: '.tour-feed',
      content: 'Feed button: yahan latest civic issues, updates aur community activity dekhein.',
    },
    {
      target: '.tour-report',
      content: 'Report button: AI assistant ki madad se naya civic issue submit karein.',
    },
    {
      target: '.tour-workspace',
      content: 'Workspace button: tasks, capstone projects aur resolution work manage karein.',
    },
    { target: '.tour-schemes', content: 'Schemes button: government schemes aur eligibility information dekhein.' },
    { target: '.tour-directory', content: 'Helplines button: emergency aur public service contacts yahan milenge.' },
    { target: '.tour-header-profile', content: 'Profile shortcut: apna account aur activity manage karein.' },
    { target: '.tour-profile', content: 'Bottom Profile button: account settings aur personal activity kholein.' },
    { target: '.tour-header-search', content: 'Search icon: civic information ko jaldi dhoondhein.' },
    { target: '.tour-notifications', content: 'Bell icon: issue updates aur notifications check karein.' },
    { target: '.tour-quick-report', content: 'Report Issue card: detailed report flow ka shortcut.' },
    { target: '.tour-quick-workspace', content: 'University Hub: capstone aur academic projects browse karein.' },
    { target: '.tour-quick-govt', content: 'Govt Desk: official status aur resolution progress dekhein.' },
    { target: '.tour-feed-search', content: 'Search field: title, keyword ya district se feed filter karein.' },
    { target: '.tour-feed-status', content: 'Status filter se Open, Active, Under Review ya Resolved issues choose karein.' },
    { target: '.tour-feed-categories', content: 'Category chips se issue type ke hisaab se feed filter karein.' },
    { target: '.tour-card-actions', content: 'Card actions: issue sunna, capstone, field audit ya flag karna.' },
    { target: '.tour-upvote', content: 'Thumbs-up button se issue ko endorse karke priority badhayein.' },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, 'finished'];

    if (finishedStatuses.includes(status)) {
      localStorage.setItem(tourKey, 'true');
      setRun(false);
    }
  };

  if (!mounted || !run || !Joyride) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={false}
      hideCloseButton={true}
      disableOverlayClose={true}
      disableCloseOnEsc={true}
      callback={handleJoyrideCallback}
      locale={{ back: 'Back', close: 'Complete tour', last: 'Finish', next: 'Next', skip: 'Skip' }}
      styles={{
        options: {
          primaryColor: '#4F46E5', 
          zIndex: 10000,
        },
      }}
    />
  );
};

export default OnboardingTour;