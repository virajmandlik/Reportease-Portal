import { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@radix-ui/react-label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  photoURL: string | null;
  institute_id: number | null;
  type_id: number | null;
  is_active: boolean;
  gender: string;
}

export const CreateCourseDialog: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [program, setProgram] = useState('');
  const [dept, setDept] = useState('');
  const [departments, setDepartments] = useState<{ dept_name: string }[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'single' | 'bulk'>('single');
  const [courseName, setCourseName] = useState('');
  const [courseSemester, setCourseSemester] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/acadDepartmentNames/${user?.institute_id}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      }
    };

    if (user?.institute_id) {
      fetchDepartments();
    }
  }, [user?.institute_id]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        alert('Session expired. Please login again.');
        Cookies.remove('token');
        navigate('/login');
        return;
      }

      const userDetails: User = {
        username: decoded.username,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        email: decoded.email,
        institute_id: decoded.institute_id,
        type_id: decoded.type_id,
        gender: decoded.gender,
      };

      setUser(userDetails);
    } catch (err) {
      navigate('/login');
      console.error(err);
    }
  }, [navigate]);

  const fetchPrograms = async (departmentName: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/programs?department=${departmentName}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      const data = await response.json();
      setPrograms(
        data.map((program: { prog_name: string }) => program.prog_name)
      );
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    }
  };

  const handleDeptChange = (value: string) => {
    setDept(value);
    fetchPrograms(value);
  };

  const handleCourseSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/course/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instituteId: user?.institute_id,
          departments: dept,
          course_name: courseName,
          program_name: program,
          semester: courseSemester,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Response Error:', errorMessage);
        throw new Error(errorMessage);
      }

      toast.success('Course created successfully!');
      setCourseName('');
      setCourseSemester(1);
    } catch (error) {
      console.error('Error creating course:', error.message);
      toast.error('Error creating course: ' + error.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      const allowedExtension = '.xlsx';
      const maxSize = 5 * 1024 * 1024; // 5 MB

      if (!uploadedFile.name.endsWith(allowedExtension)) {
        setErrorMessage('Invalid file type. Please upload an .xlsx file.');
        return;
      }
      if (uploadedFile.size > maxSize) {
        setErrorMessage('File size exceeds 5 MB.');
        return;
      }
      setFile(uploadedFile);
      setErrorMessage(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true); // Start loading
    try {
      const res = await fetch('http://localhost:3000/api/course/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Bulk upload failed');
      toast.success('Courses uploaded successfully!');
      setFile(null);
    } catch (err) {
      console.error('Bulk upload error:', err);
      toast.error(err.message);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleDownloadData = () => {
    fetch(`http://localhost:3000/api/course/download`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Course_Data.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error('Download error:', err));
  };

  const handleTemplateDownload = () => {
    fetch(`http://localhost:3000/api/course/download-template`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to download template');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'course_template.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error('Template download error:', err));
  };

  const handleToggleUploadType = () => {
    setUploadType(uploadType === 'single' ? 'bulk' : 'single');
  };

  return (
    <>
      <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <DialogTrigger asChild>
          <Button>Create Courses</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Select Department</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[410px] p-4">
            <div className="grid gap-4 py-4">
              <div className="flex justify-between">
                <Button onClick={handleToggleUploadType}>
                  Switch to {uploadType === 'single' ? 'Bulk' : 'Single'} Upload
                </Button>
              </div>

              {uploadType === 'single' ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dept" className="text-left">
                      Offered by
                    </Label>
                    <Select
                      name="dept"
                      value={dept}
                      onValueChange={handleDeptChange}
                    >
                      <SelectTrigger className="w-[475px]">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Departments</SelectLabel>
                          {departments.map((department) => (
                            <SelectItem
                              key={department.dept_name}
                              value={department.dept_name}
                            >
                              {department.dept_name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="program" className="text-left">
                      Select Program
                    </Label>
                    <Select
                      name="program"
                      value={program}
                      onValueChange={setProgram}
                    >
                      <SelectTrigger className="w-[475px]">
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Programs</SelectLabel>
                          {programs.map((program) => (
                            <SelectItem key={program} value={program}>
                              {program}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="courseName" className="text-left">
                      Course Name
                    </Label>
                    <input
                      type="text"
                      id="courseName"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="input"
                      placeholder="Enter course name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="courseSemester" className="text-left">
                      Semester
                    </Label>
                    <input
                      type="number"
                      id="courseSemester"
                      value={courseSemester}
                      onChange={(e) =>
                        setCourseSemester(Number(e.target.value))
                      }
                      className="input"
                      min={1}
                      placeholder="Enter semester"
                    />
                  </div>
                  <Button variant="primary" onClick={handleCourseSubmit}>
                    Submit Course
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-left">
                      Upload File
                    </Label>
                    <div className="col-span-3">
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="input"
                      />
                      {file && (
                        <p className="text-gray-600 mt-2">{file.name}</p>
                      )}
                      {errorMessage && (
                        <div className="text-red-500">{errorMessage}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    disabled={!file || isLoading}
                    onClick={handleBulkUpload}
                    className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-md ${
                      file && !isLoading
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Uploading...' : 'Upload Bulk Data'}
                  </Button>
                  <div className="flex flex-wrap justify-end gap-3 mt-4">
                    <Button
                      onClick={handleDownloadData}
                      aria-label="Download course data"
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Download Data
                    </Button>
                    <Button
                      onClick={handleTemplateDownload}
                      aria-label="Download course template"
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Download Template
                    </Button>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          <DialogClose>
            <Button
              variant="secondary"
              onClick={() => setIsDeptDialogOpen(false)}
            >
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};
