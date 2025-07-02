import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { FileUpload } from "../components/file-upload"
import { ArrowRight, Plus } from "lucide-react"
import { useInterviewSetup } from "../hooks/interview/useInterviewSetup"

/**
 * MockInterviewPage component provides an interface for users to set up and start a mock interview session.
 * Users can provide job details (chat name, job title, company name, job description, and additional context) and upload their resume.
 * The AI-powered mock interview will tailor questions based on the provided information.
 */
export default function MockInterviewPage() {

  // State variables to manage the interview setup form
  const [showForm, setShowForm] = useState(false)
  const [chatName, setChatName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [context, setContext] = useState("")
  const [resume, setResume] = useState<File | null>(null)

  // Custom hook to handle interview setup logic
  const { submitInterview, loading, errors, resetErrors } = useInterviewSetup()

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitInterview({
      chatName,
      jobTitle,
      companyName,
      jobDescription,
      context,
      resume
    })
  }

  // Function to start a new interview session
  const startNewInterview = () => {
    setShowForm(true)
  }

  // Function to cancel the interview setup and reset the form
  const cancelInterview = () => {
    setShowForm(false)
    setChatName("")
    setJobTitle("")
    setCompanyName("")
    setJobDescription("")
    setContext("")
    setResume(null)
    resetErrors()
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Mock Interview
          </h1>
          <p className="mt-4 text-muted-foreground md:text-xl">
            Practice your interview skills with our AI-powered mock interviews
          </p>
        </div>

        {!showForm ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Ready to practice?</CardTitle>
              <CardDescription>
                Create a new mock interview session tailored to your job application
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <p className="mb-6 text-muted-foreground">
                Our AI will analyse the job description and create personalised interview
                questions to help you prepare.
              </p>
              <Button onClick={startNewInterview} size="lg" className="gap-1.5">
                Create New Interview <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <p className="text-sm text-muted-foreground">
                You can create multiple interview sessions for different job applications
              </p>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <CardTitle className="mb-2">Interview Setup</CardTitle>
                      <CardDescription className="mt-2">
                        Provide information about the position you're applying for
                      </CardDescription>
                    </div>
                    <Button variant="ghost" onClick={cancelInterview}>
                      Cancel
                    </Button>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="chatName">Chat Name</Label>
                    <Input
                      id="chatName"
                      placeholder="e.g. Frontend Developer at Google"
                      value={chatName}
                      onChange={(e) => setChatName(e.target.value)}
                    />
                    {errors.chatName && (
                      <p className="text-sm text-red-500">{errors.chatName}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g. Frontend Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                    {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle}</p>}
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g. Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                    {errors.companyName && (
                      <p className="text-sm text-red-500">{errors.companyName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Upload Resume / CV</Label>
                  <FileUpload onFileChange={setResume} accept=".pdf" maxSize={5} />
                  {errors.resume && <p className="text-sm text-red-500">{errors.resume}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job description here..."
                    className="min-h-[200px]"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  {errors.jobDescription && (
                    <p className="text-sm text-red-500">{errors.jobDescription}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Additional Context (Optional)</Label>
                  <Textarea
                    id="context"
                    placeholder="Add any extra info for the AI (e.g. company background, your goals, etc)..."
                    className="min-h-[120px]"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                  {errors.context && (
                    <p className="text-sm text-red-500">{errors.context}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-1.5"
                  disabled={loading}
                >
                  {loading ? "Starting..." : "Start Interview"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Your interview will be tailored based on the job information you provide
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
