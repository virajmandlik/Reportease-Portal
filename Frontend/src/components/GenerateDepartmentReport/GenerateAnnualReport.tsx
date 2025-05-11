import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";
import { Sidebar } from "../SideBar/Sidebar";

// Report Access Dialog Component
const ReportAccessDialog: React.FC<{
  logId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessfulAccess: (filePath: string, reportType?: string) => void;
}> = ({ logId, isOpen, onClose, onSuccessfulAccess }) => {
  const [accessPassword, setAccessPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleVerifyPassword = async () => {
    if (!logId) {
      setError("Invalid report ID");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch("http://localhost:3000/pdf/verify-report-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logId, password: accessPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onSuccessfulAccess(data.filePath, data.reportType);
      } else {
        setError(data.message || "Failed to verify password");
      }
    } catch (error) {
      setError("An error occurred during verification");
      console.error("Password verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Report Access Password</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-gray-500">
            Please enter the password from the CSV file to access your report.
          </p>
          <Input
            placeholder="Access Password"
            type="password"
            value={accessPassword}
            onChange={(e) => setAccessPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerifyPassword} 
            disabled={isLoading || !accessPassword}
          >
            {isLoading ? "Verifying..." : "Access Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Report Type Dialog Component
const ReportTypeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: string) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSelectFormat, isLoading }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Report Format</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-gray-500">
            Choose your preferred format for the annual report.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => onSelectFormat("pdf")} 
            disabled={isLoading}
            className="w-full"
          >
            PDF
          </Button>
          <Button 
            onClick={() => onSelectFormat("html")} 
            disabled={isLoading}
            className="w-full"
          >
            HTML
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const GenerateAnnualReport: FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedYear, setSelectedYear] = useState("2023-2024");
  const [showReportTypeDialog, setShowReportTypeDialog] = useState(false);
  const [reportDetails, setReportDetails] = useState<{
    filePath: string;
    reportType?: string;
  } | null>(null);
  const [reportLogId, setReportLogId] = useState<number | null>(null);
  const [isReportAccessDialogOpen, setIsReportAccessDialogOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      // Check if the user has type_id = 1 (admin)
      if (decoded.type_id !== 1) {
        navigate(`/dashboard/${decoded.username}`);
        toast.error("Only administrators can access this page");
        return;
      }
      setCurrentUser(decoded);
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    Cookies.remove("token");
    navigate("/login");
  };

  const handleSuccessfulAccess = async (filePath: string, reportType?: string) => {
    try {
      // Open the report in a new tab
      window.open(filePath, "_blank");
      
      // Reset state
      setReportDetails(null);
      setIsReportAccessDialogOpen(false);
      setProgress(0);
      
      toast.success("Report accessed successfully!");
    } catch (error) {
      console.error("Error accessing report:", error);
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setReportDetails(null);
      setIsReportAccessDialogOpen(false);
    }
  };

  // Report Generation Handler
  const handleGenerateReport = async (format: string) => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Prepare endpoint and body
    const endpoint = format === "pdf" 
      ? "/pdf/generate-annual-report-pdf" 
      : "/pdf/generate-annual-report-html";
    const yearLowerLimit = selectedYear.split('-')[0];
    const body = {
      year: yearLowerLimit,
      user: {
        first_name: currentUser ?.first_name,
        last_name: currentUser ?.last_name,
        institute_id: currentUser ?.institute_id,
        email: currentUser ?.email_id,
        id: currentUser ?.id,
      },
    };

    try {
      setIsLoading(true);
      setProgress(30); // Initial progress
      console.log("Sending data:", body);
      
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      // Update progress
      setProgress(60);

      if (response.ok) {
        const data = await response.json();
        const filePath = format === "pdf" 
          ? `http://localhost:3000/pdfs/${data.filePath}`
          : `http://localhost:3000${data.filePath}`;

        // Store report details instead of immediately opening
        setReportDetails({
          filePath,
          reportType: format
        });

        // Store log ID for potential future use
        setReportLogId(data.logId);

        // Open password verification dialog
        setIsReportAccessDialogOpen(true);

        // Download Password CSV
        if (data.passwordCsvPath) {
          const csvLink = document.createElement("a");
          csvLink.href = `http://localhost:3000${data.passwordCsvPath}`;
          csvLink.download = "report_access_credentials.csv";
          csvLink.click();
        }

        // Update progress and show success toast
        setProgress(80);
        toast.success("Annual report generated successfully!");

        // Final progress
        setProgress(100);
      } else {
        // Handle error response
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to generate annual report.");
        setProgress(0);
      }
    } catch (err) {
      // Handle network or unexpected errors
      console.error("Error during annual report generation:", err);
      toast.error("An unexpected error occurred while generating the annual report.");
      setProgress(0);
    } finally {
      // Reset dialog and loading states
      setShowReportTypeDialog(false);
      setIsLoading(false);
    }
  };

  // Year Options Generation
  const yearOptions = Array.from({ length: 24 }, (_, i) => {
    const year = 2000 + i;
    return `${year}-${year + 1}`;
  });

  // Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowReportTypeDialog(true);
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={currentUser } activePage="generate-annual-report" />
      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Generate Annual Report</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          {/* Report generation form */}
          <div className="border rounded-lg p-6 bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Annual Report Generator</h2>
            <p className="text-muted-foreground mb-6">
              Generate a comprehensive annual report that combines all reports generated for a specific academic year.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Year selection */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium mb-2">
                    Select Academic Year
                  </label>
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Information about annual reports */}
                <div className="bg-muted p-4 rounded-md mt-4">
                  <h3 className="text-sm font-medium mb-2">About Annual Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    The annual report will combine all existing reports that were generated for the selected academic year.
                    This includes event reports, club reports, finance reports, and more.
                  </p>
                </div>
                
                {/* Progress bar */}
                {isLoading && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Generating report...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
                
                {/* Submit button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="mt-4" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating..." : "Generate Annual Report"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
      
      {/* Report Type Dialog */}
      <ReportTypeDialog
        isOpen={showReportTypeDialog}
        onClose={() => setShowReportTypeDialog(false)}
        onSelectFormat={handleGenerateReport}
        isLoading={isLoading}
      />
      
      {/* Report Access Dialog */}
      <ReportAccessDialog
        logId={reportLogId}
        isOpen={isReportAccessDialogOpen}
        onClose={() => setIsReportAccessDialogOpen(false)}
        onSuccessfulAccess={handleSuccessfulAccess}
      />
    </div>
  );
}; 