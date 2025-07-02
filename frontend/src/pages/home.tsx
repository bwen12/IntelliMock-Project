import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { ArrowRight, Brain, Clock, Users, Sparkles, GraduationCap} from "lucide-react"
import HomeImage from "../assets/images/homepage.png"
import { useAuthContext } from "../contexts/AuthProvider"

/**
 * HomePage component renders the landing page of the application.
 * The page is divided into two main sections: Hero Section and Features Section.
 * It provides an introduction to the platform and key features to encourage users to get started.
 */
export default function HomePage() {

    /**
    * Fetches the user data from the authentication context.
    * If the user is logged in, it provides access to their data.
    */
    const { user } = useAuthContext();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="w-full min-h-screen flex items-start pt-14 md:pt-16 lg:pt-20 xl:pt-24">
                <div className="container px-6 md:px-12">
                    <div className="grid gap-8 items-center lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_650px]">
                        {/* Image Section */}
                        <div className="flex items-center justify-center">
                            <img
                                src={HomeImage}
                                alt="AI Interview Logo"
                                className="object-cover h-auto w-full max-w-[550px] rounded-[1.5rem]"
                            />
                        </div>

                        {/* Text Section */}
                        <div className="flex flex-col justify-center space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-x-3">
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 w-fit">
                                        <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                                        <span className="text-xs font-medium text-purple-300">Powered by AI</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 w-fit">
                                        <GraduationCap className="h-3.5 w-3.5 text-blue-300" />
                                        <span className="text-xs font-medium text-blue-300">Student/Graduate Focused</span>
                                    </div>

                                </div>
                                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl xl:text-7xl">
                                    Ready to Ace Your Next Interview?
                                </h1>
                                <p className="max-w-[650px] text-muted-foreground text-lg md:text-2xl">
                                    IntelliMock uses advanced AI to simulate realistic interview scenarios, providing personalised
                                    feedback to help you land your dream job!
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 min-[400px]:flex-row">
                                <Link to="/mock-interview">
                                    <Button size="lg" className="gap-2 px-6 py-4 text-base sm:text-lg">
                                        Get Started <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                                {!user && (
                                    <Link to="/login">
                                        <Button size="lg" variant="outline" className="px-6 py-4 text-base sm:text-lg">
                                            Log In
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose IntelliMock?</h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Our platform offers unique features designed to help you succeed in your job interviews.
                            </p>
                        </div>
                    </div>
                    <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
                        <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                            {/* AI-Powered Questions */}
                            <div className="rounded-full bg-purple-900/20 p-4">
                                <Brain className="h-6 w-6 text-purple-300" />
                            </div>

                            <h3 className="text-xl font-bold">AI-Powered Questions</h3>
                            <p className="text-center text-muted-foreground">
                                Our AI analyses job descriptions to generate relevant, industry-specific interview questions.
                            </p>
                        </div>
                        <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                            <div className="rounded-full bg-blue-900/20 p-4">
                                <Users className="h-6 w-6 text-blue-300" />
                            </div>
                            <h3 className="text-xl font-bold">Realistic Simulations</h3>
                            <p className="text-center text-muted-foreground">
                                Experience interviews that feel like you're talking to a real recruiter or hiring manager.
                            </p>
                        </div>
                        <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                            {/* Instant Feedback */}
                            <div className="rounded-full bg-green-900/20 p-4">
                                <Clock className="h-6 w-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold">Instant Feedback</h3>
                            <p className="text-center text-muted-foreground">
                                Receive detailed feedback on your responses, with suggestions for improvement.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Link to="/mock-interview">
                            <Button size="lg" className="gap-1.5">
                                Try It Now <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
