import React, { useEffect, useState } from 'react';
import { ScrollArea } from './ui/scroll-area';


interface ActivityItemProps {
  report_name: string;
  report_type: string;
  generated_at: string;
  first_name: string;
  last_name: string;
}


const ActivityItem: React.FC<ActivityItemProps> = ({ report_name, report_type, generated_at, first_name, last_name }) => {
  return (
    <ScrollArea className='max-h-[200px]'>
    <div className="flex items-center w-full my-6 -ml-1.5 hover:bg-muted">
      <div className="w-1/12 z-10">
        <div className="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
      </div>
      <div className="w-11/12">
        <p className="text-sm">
          {first_name} {last_name} generated a report: <strong>{report_name}</strong> of type <strong>{report_type}</strong>.
        </p>
        <p className="text-xs text-gray-500">{new Date(generated_at).toLocaleString()}</p>
      </div>
    </div>
    </ScrollArea>
  );
};


const ActivityLog: React.FC<{ institute_id: number }> = ({ institute_id }) => {
  const [activities, setActivities] = useState<any[]>([]); // Adjust the type as needed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/activity-logs/${institute_id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Data:',data);
        setActivities(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };


    fetchActivities();
  }, [institute_id]);


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  return (
    <div className="flex-1 bg-white rounded-lg shadow-xl mt-4 p-8 dark:bg-black">
      <h4 className="text-xl text-gray-900 font-bold dark:text-gray-500">Activity log</h4>
      <ScrollArea className="relative px-4 max-h-[400px] overflow-y-auto">
        <div className="absolute h-full border border-dashed border-opacity-20 border-secondary"></div>


        {activities.map((activity, index) => (
          <ActivityItem
            key={index}
            report_name={activity.report_name}
            report_type={activity.report_type}
            generated_at={activity.generated_at}
            first_name={activity.first_name}
            last_name={activity.last_name}
          />
        ))}
      </ScrollArea>
    </div>
  );
};


export default ActivityLog;
