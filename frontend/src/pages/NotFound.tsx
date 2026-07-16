import { PageHeader } from "@/components/layout/PageHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="animate-fade-in text-center pb-24 px-4 md:px-6">
      <PageHeader 
        title="404" 
        description="The page you are looking for does not exist."
        className="text-center"
      />
      <Link to="/">
        <Button size="lg" className="rounded-full">
          Return to Home
        </Button>
      </Link>
    </div>
  );
}
