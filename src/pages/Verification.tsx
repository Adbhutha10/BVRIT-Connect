import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth';

const Verification = () => {
  const navigate = useNavigate();
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVerificationDocument(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!verificationDocument) {
        toast.error("Please upload a verification document.");
        setIsLoading(false);
        return;
      }
      
      // Simulate sending the file to 23211a0533@bvrit.ac.in
      // In a real application, you would use a backend service to send the email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store isVerified = false in local storage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        localStorage.setItem('current_user', JSON.stringify({
          ...currentUser,
          verified: true,
        }));
      }
      
      toast.success("Your verification document has been sent for review.");
      
      // Redirect to a "waiting for verification" page or back to the home page
      navigate('/alumni/profile-form');
    } catch (error) {
      console.error("Error sending verification document:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">  
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-md mx-auto">
          <Card className="border-t-4 border-t-blue-600 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Alumni Verification</CardTitle>
              <CardDescription>
                Please upload a document to verify your alumni status
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="verificationDocument">Verification Document</Label>
                  <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="space-y-2">
                      {!verificationDocument ? (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex justify-center text-sm text-gray-600">
                            <label 
                              htmlFor="verificationDocument" 
                              className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                            >
                              <span>Upload a file</span>
                              <Input
                                id="verificationDocument"
                                name="verificationDocument"
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX, JPG, PNG up to 10MB
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center justify-center space-y-2 flex-col">
                          <FileText className="h-10 w-10 text-blue-500 mb-2" />
                          <p className="text-sm font-medium">{verificationDocument.name}</p>
                          <button
                            type="button"
                            onClick={() => document.getElementById('verificationDocument')?.click()}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Change file
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Please upload any document that proves your alumni status (degree certificate, transcript, etc.)
                  </p>
                </div>
              
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-11 mt-6" 
                  disabled={isLoading || !verificationDocument}
                >
                  {isLoading ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 border-t pt-6">
              <div className="text-xs text-center text-gray-500">
                Your document will be reviewed by our team. This process typically takes 1-2 business days.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Verification;