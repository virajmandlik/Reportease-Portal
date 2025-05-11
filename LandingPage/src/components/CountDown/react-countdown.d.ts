declare module 'react-countdown' {
    export interface CountdownRenderProps {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
      completed: boolean;
    }
  
    const Countdown: React.ComponentType<{
      date: number;
      renderer: (props: CountdownRenderProps) => React.ReactNode;
    }>;
    
    export default Countdown;
  }
  