import Nav from "@/components/layout/nav";
import Chatbot from "@/components/layout/chatbot";
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Nav />
      {children}
      <Chatbot />
    </div>
  );
}
