import LegalDocuments from "../components/LegalDocuments.js";
import WelcomeLetter from "../components/WelcomeLetter.js";
import AccountCreation from "../components/AccountCreation.js";
import CreatorDashboard from "../CreatorDashboard.jsx";

export default function LandingPage() {
  return (
    <>
      <LegalDocuments />
      <WelcomeLetter />
      <AccountCreation />
      <CreatorDashboard />
    </>
  );
}
