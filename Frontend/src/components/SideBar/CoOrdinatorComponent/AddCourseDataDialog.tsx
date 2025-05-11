import { FC, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info, Send, XCircle } from 'lucide-react';
import axios from 'axios';

interface Program {
  program_id: number;
  program_name: string;
}

export const AddCourseDataDialog: FC = () => {
  const [courseName, setCourseName] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const userId = 123; // Replace with the actual user ID (e.g., from auth context)

  useEffect(() => {
    console.log('Sending userId to backend:', userId); // Log the userId here
    axios
      .post('/programs', { user_id: userId })
      .then((response) => {
        console.log('API response:', response.data);
        if (Array.isArray(response.data)) {
          setPrograms(response.data);
        } else {
          console.error('API response is not an array:', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching programs:', error);
      });
  }, [userId]);

  const handleAddCourse = () => {
    if (!courseName || !selectedProgram || !semester) {
      alert('All fields are required!');
      return;
    }

    const data = {
      course_name: courseName,
      program_id: selectedProgram,
      semester,
    };

    axios
      .post('/api/add', data)
      .then(() => {
        alert('Course added successfully');
        setCourseName('');
        setSemester('');
        setSelectedProgram(null);
      })
      .catch((error) => {
        console.error('Error adding course:', error);
        alert('Error adding course');
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary text-muted-foreground"
        >
          <Info className="h-4 w-4" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-lg bg-white p-6 shadow-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Add Course
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Course Name
            </label>
            <Input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
              className="mt-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Program
            </label>
            <select
              className="mt-2 w-full p-2 border rounded-md"
              value={selectedProgram || ''}
              onChange={(e) => setSelectedProgram(Number(e.target.value))}
            >
              <option value="" disabled>
                Select a program
              </option>
              {programs.length > 0 ? (
                programs.map((program) => (
                  <option key={program.program_id} value={program.program_id}>
                    {program.program_name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No programs available
                </option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Semester
            </label>
            <Input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="Enter semester"
              className="mt-2 w-full"
            />
          </div>
          <Button
            onClick={handleAddCourse}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Send size={16} /> Add Course
          </Button>
        </div>
        <DialogClose asChild>
          <Button
            className="p-2 rounded-full bg-white text-gray-500 shadow-md hover:bg-red-100 hover:text-red-600 transition-all duration-200 ease-in-out focus:ring focus:ring-red-400 focus:outline-none"
            aria-label="Close"
          >
            <XCircle size={18} />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
