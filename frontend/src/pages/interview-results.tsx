import { Link, useLocation } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Download, ArrowRight } from "lucide-react"
import { Review } from "@/types/interview"
import { useEffect, useState } from "react"
import { getReview } from "@/services/reviewService"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { MySessionReport } from "../components/pdf-document"
import { formatSessionForPDF } from "@/lib/formatSessionForPDF";
import { getSummary } from "@/services/summaryService";
import { getUserChats } from "@/services/summaryService";
import type { Summary } from "@/types/interview";
import type { Chat } from "@/types/chat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotification } from "../hooks/useNotification";

/**
 * `InterviewResults` Component
 * 
 * This component displays the results of an interview, including a performance analysis, strengths, areas for improvement,
 * and a breakdown of performance for each interview question. It also provides a button to download a full PDF report.
 * 
 * The component fetches data using React's `useEffect` hook and manages the state of the review, summary, and user chat.
 * It uses the `getReview`, `getSummary`, and `getUserChats` services to retrieve relevant information for the current interview session.
 * 
 * The main sections of the component include:
 * - **Overall Performance Card**: Displays the overall score with visual progress indicators.
 * - **Feedback Cards**: Lists strengths and areas for improvement based on the review data.
 * - **Question Breakdown**: Provides a detailed performance analysis for each interview question.
 * - **Next Steps Section**: Offers options to schedule a new mock interview or return to the dashboard.
 * - **PDF Download**: Allows the user to download a detailed session report in PDF format.
 * 
 * The component conditionally renders based on whether the data has been loaded, and it includes error handling in case of failed fetches.
 */
export default function InterviewResults() {
  const location = useLocation();
  const chatId = location.state?.chatId || null;

  /**
   * State variables to manage the review data, loading state, summary, and user chat.
   * - `reviews`: Stores the review data fetched from the server.
   * - `loading`: Indicates whether the data is still being loaded.
   * - `summary`: Stores the summary data fetched from the server.
   * - `userChat`: Stores the user chat data fetched from the server.
   */
  const [reviews, setReviews] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [userChat, setUserChat] = useState<Chat | null>(null);
  const { showError } = useNotification();
  const [activeTab, setActiveTab] = useState("overview");


  /**
   * Effect hook to fetch the review data when the component mounts or when the `chatId` changes.
   * It sets the loading state to false once the data is fetched or if an error occurs.
   */
  useEffect(() => {
    if (!chatId) return

    getReview(chatId)
      .then((data) => {
        setReviews(data)
      })
      .catch(() => {
        showError("Something went wrong. Please try again.");
      })
      .finally(() => {
        setLoading(false)
      })
  }, [chatId])

  //Hook for PDF Downlaod
  useEffect(() => {
    if (!chatId) return;
    getSummary(chatId)
      .then(setSummary)
      .catch(() => {
      showError("Failed to fetch interview summary.");
    });
  }, [chatId]);

  // Hook for PDF Download
  useEffect(() => {
    if (!chatId) return;
    getUserChats()
      .then((res) => {
        const chat = res.data.find((c: Chat) => c.id === chatId) || null;
        setUserChat(chat);
      })
      .catch(() => {
      showError("Failed to fetch interview summary.");
    });
  }, [chatId]);

  if (loading) {
    return <div className="text-center py-12">Loading interview results...</div>
  }

  if (!reviews) {
    return <div className="text-center py-12">No review found.</div>
  }

  /**
   * Format the summary for PDF download.
   * The `formatSessionForPDF` function is used to format the summary and reviews for the PDF document.
   */
  const summaryForPDF = formatSessionForPDF(
    summary,
    reviews,
    userChat ?? null
  );

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Interview Results</h1>
          <p className="mt-4 text-muted-foreground md:text-xl">
            Here's your personalised feedback and performance analysis
          </p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4">

          {/* Overall Score Card */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <Card className="mb-8">
              <CardHeader className="text-center">
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>Based on your responses and delivery</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-40 h-40 mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">
                      {summary ? `${summary.score * 10}%` : "N/A"}
                    </span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeOpacity="0.1"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={
                        summary
                          ? 2 * Math.PI * 45 * (1 - summary.score * 0.1)
                          : 2 * Math.PI * 45
                      }
                      className="text-primary"
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    Summary of your interview
                  </h4>
                  <p className="text-muted-foreground">
                    {summary
                      ? summary.summary
                        .replace(/^\*\*Summary:\*\*\s*/, "")
                        .replace(/\s*\*\*$/, "")
                      : "No summary available"}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                {summaryForPDF ? (
                  <PDFDownloadLink
                    document={<MySessionReport session={summaryForPDF} />}
                    fileName={`interview-report-${chatId}.pdf`}
                  >
                    {({ loading }) => (
                      <Button variant="outline" className="flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? "Preparing..." : "Download Full Report"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                ) : (
                  <Button variant="outline" disabled>
                    Download Full Report
                  </Button>
                )}
              </CardFooter>
            </Card>
            {/* Question Breakdown */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Question Breakdown</CardTitle>
                <CardDescription>Performance analysis for each interview question</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.reviews?.map((review, index) => {
                    const rawRating = parseFloat(review.rating || "0");
                    const score = isNaN(rawRating) ? 0 : Math.min(Math.max(rawRating * 10, 0), 100);

                    const badgeColor =
                      score >= 80 ? "bg-green-100 text-green-800" :
                        score >= 50 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800";

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>Question {index + 1}</span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-semibold ${badgeColor}`}
                          >
                            {score}%
                          </span>
                        </div>
                        <Progress value={score} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="questions" className="space-y-6">
            {reviews?.reviews?.map((item, index) => {
              const rawRating = parseFloat(item.rating || "0");
              const score = isNaN(rawRating) ? 0 : Math.min(Math.max(rawRating * 10, 0), 100);

              const badgeColor =
                score >= 80 ? "bg-green-100 text-green-800" :
                  score >= 50 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800";

              return (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <div className={`px-2 py-1 rounded text-sm font-medium ${badgeColor}`}>
                        {score}%
                      </div>

                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Question:</h4>
                      <p className="text-muted-foreground">{item.question}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Your Answer:</h4>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Exemplar Answer:</h4>
                      <p className="text-muted-foreground">
                        {item.exemplar.replace(/\*\*/g, "").trim()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Areas of Strength:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        {item.strengths
                          .split("\n")
                          .map((line) =>
                            line.replace(/\*\*/g, "").replace(/^-+\s*/gm, "").trim()
                          )
                          .filter(Boolean)
                          .map((point, idx) => (
                            <li key={`s-${index}-${idx}`} className="text-pretty">
                              {point}
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Areas for Improvement:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        {item.weaknesses
                          .split("\n")
                          .map((line) =>
                            line.replace(/\*\*/g, "").replace(/^-+\s*/gm, "").trim()
                          )
                          .filter(Boolean)
                          .map((point, idx) => (
                            <li key={`w-${index}-${idx}`} className="text-pretty">
                              {point}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 py-3 flex flex-col items-start">
                    <h4 className="text-sm font-medium mb-1 text-muted-foreground">
                      Answer Evaluation Representation: {score}%
                    </h4>
                    <Progress value={score} className="w-full" />

                  </CardFooter>
                </Card>
              );
            })}

          </TabsContent>
        </Tabs>


        {/* Next Steps */}
        <div className="flex flex-col items-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Ready to improve?</h2>
          <p className="text-muted-foreground text-center max-w-lg mb-6">
            Practice makes perfect. Try another mock interview to refine your skills and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/mock-interview">
              <Button className="flex items-center">
                New Interview <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
