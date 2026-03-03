import { redirect } from "next/navigation";

export default function ProposalsPage() {
  redirect("/validators?tab=proposals");
}
