import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Search, Calendar, Briefcase, Clock, ArrowRight } from "lucide-react"
import { getUserChats } from "@/services/summaryService"
import { Chat } from "@/types/chat"
import { useLocation } from "react-router-dom";
import { useNotification } from "../hooks/useNotification";

/**
* SummaryPage component displays a list of interview sessions and allows users to filter sessions
* by job title or company name. It also displays details for each session, such as job title, company
* name, creation date, and time elapsed since the session was created.
*/
export default function SummaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const location = useLocation();
  const { showError } = useNotification();

  // State to hold the list of chats
  const [chats, setChats] = useState<Chat[]>([]);

  // Fetch user chats when the component mounts
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getUserChats();

        if (Array.isArray(response.data)) {
          const sortedChats = response.data.sort(
            (a: Chat, b: Chat) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          );
          setChats(sortedChats);
        } else {
          showError("Something went wrong. Please try again");
        }
      } catch (error) {
        showError("Error getting chats");
      }
    };

    fetchChats();
  }, [location.key]);


  // Filter sessions based on search term
  const filteredChats = [...chats]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .filter(
      (session) =>
        session.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.chatName?.toLowerCase().includes(searchTerm.toLowerCase())
    );



  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  // Format elapsed time in minutes and seconds
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Interview Summary</h1>
            <p className="mt-2 text-muted-foreground">Review your past interview sessions and track your progress</p>
          </div>

          <div className="relative w-full md:w-[350px] lg:w-[330px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by chat name, job title, or company"
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No interview sessions found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChats.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{session.chatName || "Untitled Chat"}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{session.companyName || "Unknown Company"}</p>
                </CardHeader>

                <CardContent className="pb-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {session.jobTitle || "Unknown Role"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Created: {formatDate(session.createdDate)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Duration of Interview: {formatElapsedTime(session.timeElapsed)}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Link to={`/summary/${session.id}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
