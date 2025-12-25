import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, tool_runs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Sparkles, Clock, ArrowRight, FileText, Calendar, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getUserCredits } from "@/services/credit";

// Force dynamic rendering so we always get the latest data
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // 1. Fetch User
  const userRecord = await db()
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!userRecord.length) {
    // Edge case: User logged in via provider but not in DB yet?
    // Usually handled by auth callback, but safe to redirect or show error
    return <div className="p-8">User account not initialized. Please contact support.</div>;
  }

  const user = userRecord[0];

  // 2. Fetch Credits Balance and Plan Tier
  const creditSummary = await getUserCredits(user.uuid);
  const currentBalance = creditSummary.left_credits || 0;
  const planTier = creditSummary.plan_tier || "free";

  // 3. Fetch Tool Runs (History)
  const history = await db()
    .select()
    .from(tool_runs)
    .where(eq(tool_runs.user_uuid, user.uuid))
    .orderBy(desc(tool_runs.created_at))
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">My Studio</h1>
            <p className="text-gray-500 mt-1">Manage your credits and view your generation history.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/tools/video-storyboard" 
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Project
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Credit Balance */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition duration-500"></div>
            <div className="relative z-10">
              <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Available Credits
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-4">{currentBalance}</div>
              <Link href="/pricing" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Top up credits <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Projects Count */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Total Projects
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-4">{history.length}</div>
            <div className="text-sm text-gray-400">Lifetime generations</div>
          </div>

          {/* Member Status */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
              <UserBadge /> Plan Status
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-4">
              {planTier === "pro" ? "Pro" : planTier === "basic" ? "Basic" : "Free"}
            </div>
            <Link href="/pricing" className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1">
              Upgrade to Pro <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Recent History
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
              <p className="text-gray-500 mb-6">Create your first video storyboard today.</p>
              <Link 
                href="/tools/video-storyboard" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
              >
                Start Creating
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((run) => {
                // Parse JSON output safely
                let outputTitle = "Untitled Project";
                try {
                  if (run.output_json) {
                    const output = JSON.parse(run.output_json);
                    outputTitle = output.title || "Untitled Project";
                  }
                } catch (e) {}

                return (
                  <div key={run.id} className="p-6 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{outputTitle}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {run.created_at ? formatDistanceToNow(new Date(run.created_at), { addSuffix: true }) : "Unknown date"}
                          </span>
                          <span>|</span>
                          <span>{run.cost_credits} Credits</span>
                          <span>|</span>
                          <span className="uppercase text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">
                            {run.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* In a real app, this would go to a persistent result page /project/[id] */}
                      {/* For now, we don't have a persistent view page for runs, but we could make one */}
                      <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 transition">
                        View JSON
                      </button>
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                        Open
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserBadge() {
  return (
    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
