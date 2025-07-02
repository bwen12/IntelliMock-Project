import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import {
  Download,
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MySessionReport } from "../components/pdf-document";
import { Trash2 } from "lucide-react";
import { useInterviewHistory } from "../hooks/interview/useInterviewHistory";
import { getSummary } from "@/services/summaryService";
import { Summary } from "@/types/interview";
import { getReview } from "@/services/reviewService";
import { Review } from "@/types/interview";
import { getUserChats } from "@/services/summaryService";
import { Chat } from "@/types/chat";
import { formatSessionForPDF } from "@/lib/formatSessionForPDF";
import { DeleteSessionDialog } from "../components/dialog/delete-session-dialog";
import { useNotification } from "../hooks/useNotification";


/**
 * SessionPage component that displays detailed information about a specific interview session.
 * It fetches the summary, review, and chat data, and allows the user to download a session report.
 * Provides an interface for viewing the overall performance, strengths, areas for improvement,
 * and individual questions with answers and scores.
 */
export default function SessionDetailPage() {

  const { sessionId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const { deleteSession } = useInterviewHistory();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showError } = useNotification();

  // Fetch summary, reviews and chats based on sessionId of user
  const [summary, setSummary] = useState<Summary | null>(null);
  const [reviews, setReviews] = useState<Review | null>(null);
  const [userChat, setUserChat] = useState<Chat>();

  // Fetch summary data
  useEffect(() => {
    async function fetchSummary() {
      if (!sessionId) return;
      try {
        const data = await getSummary(sessionId);
        setSummary(data);
      } catch (error) {
        showError("Error Fetching Summary");
      }
    }
    fetchSummary();
  }, [sessionId]);

  // Fetch review data
  useEffect(() => {
    if (!sessionId) return;

    getReview(sessionId)
      .then((data) => {
        setReviews(data);
      })
      .catch(() => {
        showError("Failed to fetch interview summary.");
      })
      .finally(() => {
      });
  }, [sessionId]);


  // Fetch user chat data
  useEffect(() => {
    async function fetchChat() {
      if (!sessionId) return;

      try {
        const chats = await getUserChats();
        const chat = chats.data.find((c: Chat) => c.id === sessionId);
        setUserChat(chat || null);
      } catch (err) {
        showError("Failed to fetch interview summary.");
      }
    }

    fetchChat();
  }, [sessionId]);

  // Format the session data for PDF
  const summaryForPDF = formatSessionForPDF(
    summary,
    reviews,
    userChat ?? null
  );

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Format elapsed time to a more readable format
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const confirmDelete = async () => {
    if (!sessionId) return;
    setIsDeleting(true);
    try {
      await deleteSession(sessionId);
      navigate("/summary", { replace: true });
    } catch (error) {
      showError("Failed to delete session");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/summary"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Summary
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">
                {userChat?.chatName}
              </h1>
              <p className="text-muted-foreground">{userChat?.companyName}</p>
            </div>

            <div className="flex items-center gap-2">
              {summaryForPDF && (
                <PDFDownloadLink
                  document={<MySessionReport session={summaryForPDF} />}
                  fileName={`yourSummary-${summaryForPDF.id}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      variant="outline"
                      className="flex items-center"
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {loading ? "Preparing..." : "Download Full Report"}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}

              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
                aria-label="delete session"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-4 text-sm text-muted-foreground items-center">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              {userChat?.jobTitle || "Unknown Role"}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              {userChat?.createdDate ? formatDate(userChat.createdDate) : "N/A"}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              Duration of Interview: {userChat?.timeElapsed ? formatElapsedTime(userChat.timeElapsed) : "N/A"}
            </div>
          </div>

        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Score Card */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>
                  Based on your responses and delivery
                </CardDescription>
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
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Individual Question Performance</CardTitle>
                <CardDescription>Detailed scores for each question</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews?.reviews?.map((review, index) => {
                    const rawRating = parseFloat(review.rating || "0");
                    const score = isNaN(rawRating) ? 0 : Math.min(Math.max(rawRating * 10, 0), 100);

                    const badgeColor =
                      score >= 80
                        ? "bg-green-100 text-green-800"
                        : score >= 50
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800";

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>Question {index + 1}</span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-semibold ${badgeColor}`}
                          >
                            {score}%
                          </span>
                        </div>
                        <Progress value={score} className="h-3 rounded-md w-full" />
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
                          .map((line) => line.replace(/\*\*/g, "").replace(/^-+\s*/gm, "").trim())
                          .filter(Boolean)
                          .map((point, idx) => (
                            <li key={`s-${idx}`} className="text-pretty">{point}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Areas for Improvement:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        {item.weaknesses
                          .split("\n")
                          .map((line) => line.replace(/\*\*/g, "").replace(/^-+\s*/gm, "").trim())
                          .filter(Boolean)
                          .map((point, idx) => (
                            <li key={`w-${idx}`} className="text-pretty">{point}</li>
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
      </div>
      <DeleteSessionDialog
        open={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        interviewTitle={userChat?.chatName}
        isLoading={isDeleting} 
      />
    </div>
  );
}
