import AppShell from "@/components/layouts/AppShell";
import IntakeForm from "@/components/forms/IntakeForm";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function IntakePage() {
  return (
    <AppShell
      title="New Event Intake"
      actions={
        <Link href="/events">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto">
        <IntakeForm />
      </div>
    </AppShell>
  );
}
