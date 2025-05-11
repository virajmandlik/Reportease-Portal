import { FC, useState, useEffect } from 'react';
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
import { UploadCloud, FileText, FolderKanban } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-toastify'; // Importing toast
import 'react-toastify/dist/ReactToastify.css'; // Importing the styles

interface AddPlacementDataDialogProps {
  user: {
    userid: number | null;
    email: string | null;
    username: string | null;
    institute_id: number | null;
    type_id: number | null;
  } | null;
}

export const AddPlacementDataDialog: FC<AddPlacementDataDialogProps> = ({
  user,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'single' | 'bulk'>('single');
  const [studentData, setStudentData] = useState({
    student_reg: '',
    student_name: '',
    branch: '',
    recruiters: '',
    package_in_lakh: '',
  });
  const [departments, setDepartments] = useState<{ dept_name: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (user?.institute_id) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/acadDepartmentNames/${user.institute_id}`
          );
          if (!response.ok) throw new Error('Failed to fetch departments');
          const data = await response.json();
          setDepartments(data);
        } catch (error) {
          console.error('Error fetching departments:', error);
          setErrorMessage(error.message);
        }
      }
    };

    fetchDepartments();
  }, [user]);

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
      setErrorMessage(null); // Clear any previous error
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('the before sending is ');
      const res = await fetch('http://localhost:3000/api/placements/upload', {
        method: 'POST',
        body: formData,
      });
      console.log('the repsonse from backend is ');
      if (!res.ok) throw new Error('Upload failed');
      toast.success('File uploaded successfully!'); // Display success toast
      setFile(null); // Reset file after successful upload
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message); // Display error toast
    }
  };

  const handleSingleUpload = async () => {
    try {
      console.log(
        'Before sending to backend, the student registration number is:',
        studentData
      );
      const res = await fetch('http://localhost:3000/api/placements/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!res.ok) throw new Error('Single upload failed');

      toast.success('Single entry uploaded successfully!', {
        className: 'custom-toast',
        autoClose: 1000,
      }); // Display success toast

      // Clear fields after successful upload
      setStudentData({
        student_reg: '',
        student_name: '',
        branch: '',
        recruiters: '',
        package_in_lakh: '',
      });

      // Close the dialog on successful upload
      document.getElementById('dialog-close-button')?.click();
    } catch (err) {
      console.error('Single upload error:', err);
      toast.error(err.message, {
        className: 'custom-toast',
        autoClose: 1000,
      }); // Display error toast
    }
  };

  const handleToggleUploadType = () => {
    setUploadType(uploadType === 'single' ? 'bulk' : 'single');
  };

  const handleDownload = () => {
    fetch(`http://localhost:3000/api/placements/downloaddata`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const customFileName = 'Placement_Data.xlsx';
        const a = document.createElement('a');
        a.href = url;
        a.download = customFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error('Download error:', err));
  };

  const handleTemplateDownload = () => {
    fetch(`http://localhost:3000/api/placements/download`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to download template');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'placement_template.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error('Template download error:', err));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex place-self-start gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary text-muted-foreground"
        >
          <FolderKanban className="h-4 w-4" />
          Manage Placement Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-lg bg-white p-6 shadow-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Manage Placement Data
          </DialogTitle>
        </DialogHeader>
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        <div className="space-y-6">
          <div className="flex justify-between">
            <Button onClick={handleToggleUploadType}>
              Switch to {uploadType === 'single' ? 'Bulk' : 'Single'} Upload
            </Button>
          </div>

          {uploadType === 'single' ? (
            <div>
              <h3 className="text-lg font-semibold">Single Upload</h3>
              <Input
                placeholder="Student Registration Number"
                value={studentData.student_reg}
                onChange={(e) => {
                  console.log('Student Registration Number:', e.target.value); // Debugging line
                  setStudentData({
                    ...studentData,
                    student_reg: e.target.value,
                  });
                }}
                className="mt-2 w-full"
              />
              <Input
                placeholder="Student Name"
                value={studentData.student_name}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    student_name: e.target.value,
                  })
                }
                className="mt-2 w-full"
              />
              <Select
                value={studentData.branch}
                onValueChange={(value) =>
                  setStudentData({ ...studentData, branch: value })
                }
                className="mt-2 w-full"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Branches</SelectLabel>
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
              <Input
                placeholder="Recruiters"
                value={studentData.recruiters}
                onChange={(e) =>
                  setStudentData({ ...studentData, recruiters: e.target.value })
                }
                className="mt-2 w-full"
              />
              <Input
                placeholder="Package (in Lakh)"
                value={studentData.package_in_lakh}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    package_in_lakh: e.target.value,
                  })
                }
                className="mt-2 w-full"
              />
              <Button
                onClick={handleSingleUpload}
                className="mt-4 bg-green-500 text-white"
              >
                Upload Single Data
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold">Bulk Upload</h3>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-600"
              >
                Upload File
              </label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="mt-2 w-full"
              />
              <Button
                disabled={!file}
                onClick={() => file && handleUpload(file)}
                className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-md ${
                  file
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <UploadCloud size={16} /> Upload
              </Button>
              <div className="flex flex-wrap justify-end gap-3 mt-4">
                <Button
                  onClick={handleDownload}
                  aria-label="Download placement data"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Download Data
                </Button>
                <Button
                  onClick={handleTemplateDownload}
                  aria-label="Download sample placement template"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
                >
                  <FileText size={16} /> Download Template
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Dialog close button */}
        <DialogClose id="dialog-close-button" />
      </DialogContent>
    </Dialog>
  );
};
